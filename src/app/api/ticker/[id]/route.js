import { connectDB } from "@/lib/db";
import Ticker from "@/models/Ticker";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, message: "Ticker id required" }, { status: 400 });
    }

    const deleted = await Ticker.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Ticker not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Ticker deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


