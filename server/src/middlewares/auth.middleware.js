import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";

// if res not used _
export const verifyJWT = asyncHandler(async(req, _ ,next)=>{

try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
    
        const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
           /// ._id from jwt generateAccessToken ../user.model
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user){
            //discuss about frontend
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user
        next()
} catch (error) {
    throw new ApiError(401,error?.message ||"Invalid access token")
    
}
})