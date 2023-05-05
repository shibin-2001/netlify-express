import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


// REGISTER USER

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      occupation,
      location,
    } = req.body;

    const Salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, Salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      // friends,
      occupation,
      location,
      // notifications,
      viewedProfile: Math.floor(Math.random() * 1000),
      impressions: Math.floor(Math.random() * 1000),
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGGING IN
export const login = async (req, res) => {
  try {
    // console.log(req.body)
    const { email, password } = req.body;
const user = await User.findOne({email:email})
// console.log(user)
if(!user) return res.status(400).json({message:"user does not exists"})


const isMatch = await bcrypt.compare(password,user.password)
// console.log(isMatch)
if(!isMatch) return res.status(400).json({message:"Invalid Credentials"})

const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

delete user.password

res.status(200).json({token,user})

  } catch (err) {
    res.status(500).json({error:err.message})
  }
};
