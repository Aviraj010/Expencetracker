import express from "express"
import authMiddleware from "../middleware/auth.js"
import { addExpense, deleteExpense, downloadExpense, getAllExpense, getExpenseOverview, updateExpense } from "../controller/expenseController.js";

const expenseRouter=express.Router();

expenseRouter.post("/add",authMiddleware,addExpense);
expenseRouter.get("/get",authMiddleware,getAllExpense);

expenseRouter.put("/update/:id",authMiddleware,updateExpense);
expenseRouter.get("/downloadExcel",authMiddleware,downloadExpense);

expenseRouter.delete("/delete/:id",authMiddleware,deleteExpense);
expenseRouter.get("/overview",authMiddleware,getExpenseOverview);

export default expenseRouter;
