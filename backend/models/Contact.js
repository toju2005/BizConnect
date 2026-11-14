
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: [true, "Contact name is required"],
            trim: true
        },

        email: {
            type: String,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true
        },

        company: {
            type: String,
            trim: true
        },

        jobTitle: {
            type: String,
            trim: true
        },

        category: {
            type: String,
            enum: ["Lead", "Client", "Customer", "Supplier", "Other"],
            default: "Lead"
        },

        status: {
            type: String,
            enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
            default: "New"
        },

        address: {
            type: String,
            trim: true
        },

        notes: {
            type: String,
            trim: true
        },

        followUpDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);
