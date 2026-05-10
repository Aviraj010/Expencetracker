import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_secret_key";
const TOKEN_EXPIRES = "24h";

const createToken = (userId) =>
    jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });


// REGISTER USER
export async function registerUser(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters"
        });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name,
            email,
            password: hashed
        });

        const token = createToken(user._id);

        return res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}


// LOGIN USER
export async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Both fields are required"
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = createToken(user._id);

        return res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

//get user details
export async function getCurrentUser(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const user = await userModel
            .findById(req.user.id)
            .select("name email");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            user
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

//update user
export async function updateProfile(req, res) {
    const { name, email } = req.body;

    if (!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Valid name and email are required"
        });
    }

    try {
        // Check if email already used by another user
        const exists = await userModel.findOne({
            email,
            _id: { $ne: req.user.id }
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Email already in use"
            });
        }

        // Update user
        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true }
        ).select("name email"); // ✅ correct place

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            user
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

//to change user password
export async function updatePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password invalid or too short"
        });
    }

    try {
        const user = await userModel
            .findById(req.user.id)
            .select("password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check current password
        const match = await bcrypt.compare(currentPassword, user.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);

        // Save updated password
        await user.save();

        return res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}