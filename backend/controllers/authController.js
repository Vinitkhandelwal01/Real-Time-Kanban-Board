const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config(); 
   
exports.registerUser = async (req, res) => {
  try{
    // data fetch from request ki body
    const {userName,email,password,confirmPassword} = req.body;
    console.log("Register Request Body:", req.body);

    // validate krlo 
    if(!userName|| !email || !password || !confirmPassword )  {
        return res.status(403).json({
            success:false,
            message:"All fields are required!!",
        });
    }

    // 2 password match krlo
    if(password !== confirmPassword){
        return res.status(403).json({
            success:false,
            message:"Password and Confirm Password does not match!!",
        });
    }

    //check user already exist or not 
    const checkUserPresent = await User.findOne({email});

    if(checkUserPresent){   
        return res.status(401).json({
            success:false,
            message:"User already registered!!",
        });
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password,10);

    console.log("Creating user with:", { userName, email, password: hashedPassword });

    const user = await User.create({
        userName,email,password:hashedPassword
    });

    // send response
    return res.status(200).json({
        success:true,
        message:"User registered Successfully!!",
        user,
    });

} catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"User cannot be registered. Please try again!!",
    });
}
};

exports.loginUser = async (req, res) => {
  try{
    
    const { email, password } = req.body

    // validation data
    if(!email || !password){
        return res.status(403).json({
            success:false,
            message:"Filled all details!!",
        });
    }

    //user check exist or not 
    const user = await User.findOne({email}); // it give a full user with additional details

    if(!user){
        return res.status(403).json({
            success:false,
            message:"Plesae signup!!",
        });
    }

    // password matching
    if(await bcrypt.compare(password,user.password)) {
        const payload = {
            email: user.email,
            id: user._id,
            username: user.userName,
        }
        //  generate JWT(
        const token = jwt.sign(payload, process.env.JWT_SECRET,{
            expiresIn:"2h",
        });
        user.token = token;
        user.password = undefined;

        // create cookie and send response
        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly:true,
        }
        res.cookie("token",token,options).status(200).json({
            success:true,
            token,
            user,
            message:"Logged in successfully!!",
        });
    }
    else{
        return res.status(403).json({
            success:false,
            message:"Password is Incorrect!!",
        });
    }
} catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"Login failure, Please try again!!",
    });
}
}; 