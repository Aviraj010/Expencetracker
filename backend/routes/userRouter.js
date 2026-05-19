import express from "express";
import { deleteUser, getCurrentUser, loginUser, registerUser, updatePassword, updateProfile } from "../controller/userController.js";
import authMiddleware from "../middleware/auth.js";


const userRouter=express.Router();

userRouter.post("/register",registerUser);
userRouter.post("/login",loginUser);

//protected routes
userRouter.get("/me",authMiddleware,getCurrentUser);
userRouter.put("/profile",authMiddleware,updateProfile);
userRouter.put("/password",authMiddleware,updatePassword);
userRouter.delete("/delete",authMiddleware,deleteUser);

export default userRouter;