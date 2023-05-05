import  jwt  from "jsonwebtoken";


export const verifyToken = async(req,res,next)=>{
    try{
       
let token = await req.header("Authorization");
// console.log(req,'req')
// console.log(token,'token')
if(!token){
    return res.status(403).json({message:"access denied"})
}
if(token.startsWith("Bearer ")){
    token = token.slice(7,token.length).trimLeft();
}
const verified = jwt.verify(token,process.env.JWT_SECRET)
req.user = verified
next();


    }catch (err){

    }
}