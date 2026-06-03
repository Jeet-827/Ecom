import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    adminKey: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["admin", "owner"],
        default: "admin"
    }
}, {
    timestamps: true
});

export default mongoose.model("Admin", adminSchema);