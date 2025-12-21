import mongoose from "mongoose";

const HeroImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.HeroImage || mongoose.model("HeroImage", HeroImageSchema);
