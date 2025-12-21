// src/app/api/news/admin/route.js
import { connectDB } from "@/lib/db";
import News from "@/models/News";  // ✅ Correct import
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const news = await News.find({ status: "published" }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, news });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}