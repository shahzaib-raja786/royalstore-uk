import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto-delete after 10 minutes (600 seconds)
    }
});

// Index for faster lookups
OTPSchema.index({ email: 1, createdAt: -1 });

// Clear cached model to prevent Mongoose OverwriteModelError
delete mongoose.models.OTP;

const OTP = mongoose.model("OTP", OTPSchema);

export default OTP;
