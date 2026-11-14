
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide all required fields."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Registration successful.",
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        res.status(500).json({
            message: "Registration failed.",
            error: error.message
        });
    }
};

// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        res.status(200).json({
            message: "Login successful.",
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed.",
            error: error.message
        });
    }
};

// GET LOGGED-IN USER
const getMe = async (req, res) => {
    res.status(200).json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            createdAt: req.user.createdAt
        }
    });
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required."
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedName || !normalizedEmail) {
            return res.status(400).json({
                message: "Name and email cannot be empty."
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user._id }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "This email is already used by another account."
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                name: normalizedName,
                email: normalizedEmail
            },
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            message: "Profile updated successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        res.status(500).json({
            message: "Unable to update profile.",
            error: error.message
        });
    }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Both current and new passwords are required."
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "New password must contain at least 8 characters."
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "New password must be different from the current password."
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Current password is incorrect."
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.status(200).json({
            message: "Password changed successfully."
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to change password.",
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    changePassword
};
