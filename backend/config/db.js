
const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const mongoURI = process.env.MONGO_URI?.trim();

    if (!mongoURI) {
        throw new Error("MONGO_URI is missing");
    }

    // Check the URI without exposing credentials
    const isValid = /^mongodb(\+srv)?:\/\//.test(mongoURI);

    console.log("MongoDB URI loaded:", !!mongoURI);
    console.log("MongoDB URI format valid:", isValid);
    console.log("MongoDB URI scheme:", mongoURI.split(":")[0]);

    if (!isValid) {
        throw new Error("Invalid MONGO_URI format in environment variables");
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(mongoURI, {
                serverSelectionTimeoutMS: 10000,
            })
            .then(() => {
                console.log(
                    `MongoDB Connected: ${mongoose.connection.host}`
                );

                return mongoose.connection;
            })
            .catch((error) => {
                connectionPromise = null;
                console.error("MongoDB Connection Failed:", error.message);
                throw error;
            });
    }

    return connectionPromise;
};

module.exports = connectDB;
