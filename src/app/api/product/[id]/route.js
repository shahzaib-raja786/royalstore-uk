// src/app/api/product/[id]/route.js
import { NextResponse } from "next/server"; // ✅ ye import missing tha
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    console.log("Fetching product with ID:", id);

    const product = await Product.findById(id); // sirf Product collection se find karega

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}


// 🟢 Update Product
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    console.log("Received update data:", body);

    const updated = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT Product Error:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}

// 🟢 Delete Product
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Product Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
