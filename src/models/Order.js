// models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1, min: 1 },
  selectedCustomizations: [
    {
      type: { type: String, required: true },
      option: { type: String, required: true },
      extraPrice: { type: Number, default: 0 },
    },
  ],
  priceAtPurchase: { type: Number, required: true }, // final price per item including customization
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned", "cancellation_requested", "return_requested"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "paypal", "stripe", "wallet"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    stripeSessionId: { type: String, default: null },
    paymentIntentId: { type: String, default: null },
    couponCode: { type: String, default: null },
    deliveryDate: {
      type: Date,
      default: null,
    },
    shippingAddress: {
      firstName: String,
      lastName: String,
      streetAddress: String,
      city: String,
      postalCode: String,
      phone: String,
      email: String,
      notes: String,
    },
    deliveryRoute: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryRoute", default: null },
    // Cancellation fields
    cancellationReason: { type: String, default: null },
    cancellationRequestedAt: { type: Date, default: null },
    cancelledBy: {
      type: String,
      enum: ["user", "admin", null],
      default: null
    },
    // Return fields
    returnReason: { type: String, default: null },
    returnRequestedAt: { type: Date, default: null },
    returnApprovedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Clear the cached model in development to prevent schema validation errors
if (process.env.NODE_ENV === 'development' && mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
