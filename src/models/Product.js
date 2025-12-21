// models/Product.js
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. "Red", "4 Doors", "Extra Drawer"
  price: { type: Number, default: 0 }, // extra cost if selected
});

const customizationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  // e.g. "color", "doors", "shelves", "drawers"
  label: { type: String, required: true },
  // e.g. "Choose Color", "Select Doors"
  options: [optionSchema], // multiple options for each customization
  required: { type: Boolean, default: false },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Wardrobe
    description: { type: Object },
    basePrice: { type: Number, required: true }, // banse price without customization
    discount: { type: Number, default: 0 }, // discount in percentage
    thumbnail: { type: String }, // main image
    images: [String], // default images (could be general photos)
    customizations: [customizationSchema], // 🔥 dynamic custom options
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subcategory: { type: String }, // Store subcategory name directly
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
