import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import {register} from './controllers/auth.js'
import {createPost} from './controllers/posts.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users } from "./data/index.js";
// CONFIGURATION
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use(express.static(path.join(__dirname, 'client')));

app.use('',(req,res)=>{
  res.sendFile(path.join(__dirname, "client/index.html"));
})


//  FILE STORAGE

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage });

app.post("/upload", upload.single("picture"), (req, res) => {
  console.log(req,'req')
  console.log(req.file)
  const file = req.file
console.log(file)
  const fileUrls = 
     `http://localhost:5000/assets/${file.filename}`;

  res.json({ message: "Images uploaded successfully",fileUrls });
});

// ROUTES WITH FILE
app.post('/auth/register',register);
app.post('/new_post',verifyToken,upload.single("picture"),createPost);
// ROUTES

app.use('/auth',authRoutes)
app.use('/user',userRoutes)
app.use('/posts',postRoutes)


app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})
// MONGOOSE SETUP

const Port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>{
    // app.listen(Port,()=>console.log(`Server is running at port :${Port}`))
    // User.insertMany(users)
}).catch((err)=>console.log(err))

module.exports = app