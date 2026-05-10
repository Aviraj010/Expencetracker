import express from "express";
import cors from "cors";
import "dotenv/config"
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import incomeRouter from "./routes/incomeRoute.js";
import expenseRouter from "./routes/expenseRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";


const app=express();
const port=4000;
//database mongo db

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/user",userRouter);
app.use("/api/income",incomeRouter);
app.use("/api/expense",expenseRouter);
app.use("/api/dashboard",dashboardRouter);

app.get("/",(req,res)=>{
    res.send("API WORKING");
    console.log("api working");

})

connectDB();

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})