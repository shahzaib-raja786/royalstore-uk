import { connectDB } from "@/lib/db";
import News from "@/models/News";
import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/adminAuth";

export async function GET(req, { params }) {
  try {
    const { id } = await params; // ✅ Await params

    // Verify admin authentication
    const auth = await verifyAdminAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const news = await News.findById(id);
    if (!news) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, news });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params; // ✅ Await params

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
    const news = await News.findByIdAndUpdate(id, body, { new: true });
    if (!news) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, news });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params; // ✅ Await params

    // Verify admin authentication
    const auth = await verifyAdminAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    await News.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "News deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
