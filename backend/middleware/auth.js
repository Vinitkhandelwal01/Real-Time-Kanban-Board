const jwt = require('jsonwebtoken');
require('dotenv').config(); 

module.exports = function (req, res, next) {
  try{

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
        success: false,
        message: "Token is missing or invalid format",
    });
    }

    const token = authHeader.split(" ")[1]; 
    if(!token) {
        return res.status(403).json({
            success:false,
            message:"Token is missing",
        });
    }

    // verify the token
    try{
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        console.log(decode);

        req.user = decode; 
        console.log("req.user (after decode):", req.user);
    } catch(error){
        return res.status(401).json({
            success:false,
            message:"Token is invalid"
        });
    }
    next(); 

} catch(error) {
    return res.status(401).json({
        success:false,
        message:"Something went wrong"
    });
}
}; 