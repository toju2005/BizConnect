
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// -------------------- CORS CONFIGURATION --------------------

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    "https://biz-connect-azure-iota.vercel.app",
    "https://biz-connect-78qawpwhk-angshu-kar-mahapatras-projects.vercel.app",

    process.env.FRONTEND_URL,
]
    .filter(Boolean)
    .map(origin => origin.trim().replace(/\/+$/, ""));

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.error("Blocked CORS origin:", origin);

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// -------------------- GENERAL MIDDLEWARE --------------------

app.use(express.json());

// -------------------- HOME ROUTE --------------------

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to BizConnect API",
        status: "Running",
    });
});

// -------------------- DATABASE CONNECTION --------------------

app.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection error:", error.message);
        next(error);
    }
});

// -------------------- API ROUTES --------------------

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/ai", aiRoutes);

// -------------------- UNKNOWN ROUTES --------------------

app.use((req, res) => {
    res.status(404).json({
        message: "API route not found",
    });
});

// -------------------- ERROR HANDLER --------------------

app.use((error, req, res, next) => {
    console.error("Server Error:", error);

    res.status(error.status || 500).json({
        message:
            error.message === "Not allowed by CORS"
                ? "CORS error: Origin not allowed"
                : "Internal Server Error",
    });
});

// -------------------- LOCAL DEVELOPMENT --------------------

if (require.main === module) {
    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
        console.log(`BizConnect server running on port ${PORT}`);
    });
}

// -------------------- EXPORT --------------------

module.exports = app;
