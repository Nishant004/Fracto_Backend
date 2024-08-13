import mongoose, { Schema } from "mongoose";

// import { JsonWebTokenError } from "jsonwebtoken";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const sessionSchema = new Schema({
  ip: String,
  userAgent: String,
  loginTime: { type: Date, default: Date.now },
  refreshToken: String,
});

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    description: {
      type: String,
    },
    sessions: [sessionSchema],
  },
  { timestamps: true }
);


//password hashed in DB // don't use arrow function because it does not know context
//Meaning {this.} will not work
userSchema.pre("save", async function (next) {

//no poassword modification * new pasword reset * 1st time password
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10)
  next()
})


//password matching 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}


//jwt tokken 
userSchema.methods.generateAccessToken = function(){
   return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {  
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)


}

export const User = mongoose.model("User", userSchema);
