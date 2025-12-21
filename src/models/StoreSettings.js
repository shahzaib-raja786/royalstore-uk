import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
    {
        paymentMethods: {
            cod: { type: Boolean, default: true },
            stripe: { type: Boolean, default: false },
        },
        stripeConfig: {
            publicKey: { type: String, default: "" },
            // Secret key should ideally be in env variables, but we can store non-sensitive config here
        },
        // Future settings can go here (e.g., site name, logo, support email)
    },
    { timestamps: true }
);

// Singleton pattern: Ensure only one settings document exists
storeSettingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({});
};

const StoreSettings =
    mongoose.models.StoreSettings ||
    mongoose.model("StoreSettings", storeSettingsSchema);

export default StoreSettings;
