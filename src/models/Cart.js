// models/Cart.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  
  
  selectedCustomizations: [
    {
      type: {
        type: String,
        required: true,
      },
      option: {
        type: String,
        required: true,
      },
      extraPrice: { type: Number, default: 0 }, // extra price for selected option
    },
  ],
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalPrice: { type: Number, default: 0 }, 
    fullPrice: { type: Number, default: 0 }, 
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1, min: 1 },
     items: [cartItemSchema],

  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
