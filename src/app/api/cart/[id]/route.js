import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Cart from "@/models/Cart";
import mongoose from "mongoose";



export async function PATCH(req, context) {
  await connectDB();

  try {
    const { id } = await context.params; // ✅ fixed
    const { quantity } = await req.json();

    if (!quantity || quantity < 1) {
      return new Response(JSON.stringify({ error: "Invalid quantity" }), { status: 400 });
    }

    // Ensure ObjectId conversion
    const cartItem = await Cart.findById(new mongoose.Types.ObjectId(id));

    if (!cartItem) {
      return new Response(JSON.stringify({ error: "Item not found" }), { status: 404 });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return new Response(JSON.stringify(cartItem), { status: 200 });
  } catch (err) {
    console.error("PATCH error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

// ✅ DELETE: Remove a specific cart item by ID
export async function DELETE(req, context) {
  await connectDB();

  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: "Invalid cart item ID" }), {
        status: 400,
      });
    }

    // Find and delete the cart item
    const deletedItem = await Cart.findByIdAndDelete(new mongoose.Types.ObjectId(id));

    if (!deletedItem) {
      return new Response(JSON.stringify({ error: "Item not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: "Item deleted successfully" }), {
      status: 200,
    });
  } catch (err) {
    console.error("DELETE error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
