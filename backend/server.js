import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB } from "./config/db.js";

import userRouter from "./routes/userRouter.js";
import incomeRouter from "./routes/incomeRoute.js";
import expenseRouter from "./routes/expenseRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;

// middleware
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// api routes
app.use("/api/user", userRouter);

app.use("/api/income", incomeRouter);

app.use("/api/expense", expenseRouter);

app.use("/api/dashboard", dashboardRouter);

// frontend build folder
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// react router handling
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// database connection
connectDB();

// server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});