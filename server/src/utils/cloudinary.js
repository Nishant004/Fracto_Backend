
import { v2 as cloudinary } from "cloudinary";
//{as }koi bhi {name}

import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});


// // async function uploadOnCloudinary(localFilePath) {
// //     // Function logic goes here
// //   }

const uploadOnCloudinary = async(localFilePath) => {
 try {
    if (!localFilePath) return null
    //upload the file on clodinary
    const response = await cloudinary.uploader.upload(localFilePath,
        {
        resource_type: "auto"
        })
    //file has been uploaded successfull
    console.log("file is uploaded on cloudinary",response.url)
   //  fs.unlinkSync(localFilePath)
    return response;

 } catch (error) {
    fs.unlinkSync(localFilePath) //remove the locally saved temporart file as the operation got failded
    return null
    
 }
}


// // export default uploadOnCloudinary
export {uploadOnCloudinary}


// // cloudinary.v2.uploader
// // .upload("dog.mp4", 
// // {resource_type: "video", public_id: "my_dog",
// //   overwrite: true, notification_url: "https://mysite.example.com/notify_endpoint"})
// // .then(result=>console.log(result));