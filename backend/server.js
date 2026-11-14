
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// -------------------- CORS CONFIGURATION --------------------

const allowedOrigins = [
    "https://bizconnect-rust-gamma.vercel.app",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an origin (e.g. Postman)
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error(`CORS blocked this origin: ${origin}`)
            );
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

// Connect to MongoDB before processing API requests
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

// -------------------- GLOBAL ERROR HANDLER --------------------

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

// -------------------- VERCEL EXPORT --------------------

module.exports = app;
