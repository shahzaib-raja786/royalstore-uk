// models/Ticker.js
import mongoose from "mongoose";

const TickerSchema = new mongoose.Schema({
  message: { type: String, required: true },
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ticker || mongoose.model("Ticker", TickerSchema);
