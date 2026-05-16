import express from "express";
import cors from "cors";
import "dotenv/config"
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import incomeRouter from "./routes/incomeRoute.js";
import expenseRouter from "./routes/expenseRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

connectDB();

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})