import mongoose from "mongoose";

export const connectDB = async () =>{
    let Client = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`database connected to ${Client.connection.host}`);
};