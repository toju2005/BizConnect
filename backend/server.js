
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
dotenv.config();

const app = express();

// Database connection
connectDB();

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
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

// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`BizConnect server running on port ${PORT}`);
});
