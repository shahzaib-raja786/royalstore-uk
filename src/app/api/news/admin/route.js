// src/app/api/news/admin/route.js
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/adminAuth";

export async function POST(req) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const news = await News.create(body);

    return NextResponse.json({ success: true, news }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}


export async function GET() {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const news = await News.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, news });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}