// models/DeliveryRoute.js
import mongoose from "mongoose";

const deliveryRouteSchema = new mongoose.Schema({
 city: { type: String, required: true },
    deliveryDate: { type: Date, required: true }, 
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
      
});

export default mongoose.models.DeliveryRoute || mongoose.model("DeliveryRoute", deliveryRouteSchema);
