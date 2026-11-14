
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
    },
}));

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to BizConnect API",
        status: "Running",
    });
});

// Connect to MongoDB before handling API requests
app.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/ai", aiRoutes);

// Unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "API route not found",
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        message: "Internal Server Error",
    });
});

// Local development
if (require.main === module) {
    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
        console.log(`BizConnect server running on port ${PORT}`);
    });
}

// Vercel export
module.exports = app;
