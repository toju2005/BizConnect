
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    }
}));

app.use(express.json());

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/ai", aiRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to BizConnect API",
        status: "Running"
    });
});

// Unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "API route not found"
    });
});

// Local development only
if (require.main === module) {
    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
        console.log(`BizConnect server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
