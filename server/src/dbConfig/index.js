import mongoose from "mongoose";
import { DB_NAME } from "../contant.js";


const connectDB = async ()=> {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connection !! DB HOST:${connectionInstance.connection.host}`);
        //consolelog connectionInstance

        
    } catch (error) {
        console.log("MONGO_DB CONNECT FAILED",error)
        process.exit(1)
        //ready exit
    }
}


export default connectDB