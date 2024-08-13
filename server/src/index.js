// require('dotenv').config({path:"../env"})
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";

import dotenv from "dotenv";

import connectDB from "./dbConfig/index.js";

import app from "./app.js"

dotenv.config({
    path:'../env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running on ${process.env.PORT}`);
    })
})
.catch((error)=>{
     console.log("MONGO DB CONNECTION FAIL !!!",error)
})

