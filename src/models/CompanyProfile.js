import mongoose from "mongoose";

const CompanyProfileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        logo: {
            type: String, // URL to the logo image
        },
        socialLinks: {
            facebook: { type: String, trim: true },
            twitter: { type: String, trim: true },
            instagram: { type: String, trim: true },
            linkedin: { type: String, trim: true },
            youtube: { type: String, trim: true },
        },
    },
    { timestamps: true }
);

// Prevent model recompilation error in dev mode
const CompanyProfile = mongoose.models.CompanyProfile || mongoose.model("CompanyProfile", CompanyProfileSchema);

export default CompanyProfile;
