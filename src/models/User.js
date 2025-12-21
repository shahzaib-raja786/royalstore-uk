import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
  addresses: [{
    firstName: String,
    lastName: String,
    streetAddress: String,
    city: String,
    postalCode: String,
    phone: String,
    email: String,
    notes: String,
    isDefault: { type: Boolean, default: false }
  }]
});

export default mongoose.models.User || mongoose.model("User", userSchema);
