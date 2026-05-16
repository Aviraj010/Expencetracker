import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
    try {
        // 1. Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized or token missing"
            });
        }

        // 2. Extract token
        const token = authHeader.split(" ")[1];

        // 3. Verify token
        const payload = jwt.verify(token, JWT_SECRET);

        // 4. Find user
        const user = await userModel.findById(payload.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // 5. Attach user to request
        req.user = user;

        next();

    } catch (err) {
        console.error("JWT failed", err);
        return res.status(401).json({
            success: false,
            message: "Token invalid or expired"
        });
    }
}