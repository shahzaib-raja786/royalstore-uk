// // models/Route.js
// import mongoose from "mongoose";

// const routeSchema = new mongoose.Schema(
//   {
//     city: { type: String, required: true },
//     deliveryDate: { type: Date, required: true }, 
//     status: {
//       type: String,
//       enum: [
//         "pending",
//         "processing",
//         "shipped",
//         "delivered",
//         "cancelled",
//         "returned",
//       ],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.models.Route || mongoose.model("Route", routeSchema);
