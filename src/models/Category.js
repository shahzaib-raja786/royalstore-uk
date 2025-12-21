// models/Category.js
import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    subcategories: [
      {
        name: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Clear the cached model to ensure schema updates are applied
if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

export default mongoose.model("Category", CategorySchema);
