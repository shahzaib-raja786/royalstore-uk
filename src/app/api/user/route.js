import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// ✅ GET user info (exclude role & password)
export async function GET(req) {
  try {
    await connectDB();
    const id=req.headers.get("x-user-id");
    if (!id) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findById(id).select("-role -password");
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return Response.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ✅ UPDATE user profile (with password hashing, exclude role update)
export async function PUT(req) {
  try {
    await connectDB();
    const id=req.headers.get("x-user-id");
    if (!id) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();

    // allowed fields only
    const allowedUpdates = ["name", "email", "password"];
    const updateData = {};
    for (const field of allowedUpdates) {
      if (body[field]) updateData[field] = body[field];
    }

    // ✅ hash password if present
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-role -password");

    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return Response.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
