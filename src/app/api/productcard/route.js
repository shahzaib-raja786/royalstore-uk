import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    // Populate category name
    const products = await Product.find()
      .populate("category", "name") // sirf name populate hoga
      .lean();

    return new Response(JSON.stringify(products || []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch products", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
