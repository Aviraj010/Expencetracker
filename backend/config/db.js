import mongoose from "mongoose";

export const connectDB=async()=>{
    try {
        await mongoose.connect("mongodb+srv://avirajcheetri_db_user:fjLZQzBYrDcC8XVB@cluster0.aeq0u1w.mongodb.net/expense");  
        console.log("connected to DB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};