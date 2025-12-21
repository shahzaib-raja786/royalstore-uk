import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } =await params;
    console.log("Fetching product with ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ message: "Invalid product ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const product = await Product.findById(id).populate("category").lean();

    if (!product) {
      return new Response(
        JSON.stringify({ message: "Product not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch product" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
