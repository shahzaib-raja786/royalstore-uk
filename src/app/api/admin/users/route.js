import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyAdminAuth } from "@/lib/adminAuth";

// GET: List all users (Admin only)
export async function GET(req) {
    try {
        await connectDB();

        // Verify Admin
        // Verify Admin
        const auth = await verifyAdminAuth();
        if (!auth.authenticated) {
            return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
        }

        // Fetch all users, sorted by role (admins first) then name
        const users = await User.find({})
            .select("-password") // Exclude password
            .sort({ role: 1, name: 1 });

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error("GET /api/admin/users error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PATCH: Update user role (Admin only)
export async function PATCH(req) {
    try {
        await connectDB();

        // Verify Admin
        // Verify Admin
        const auth = await verifyAdminAuth();
        if (!auth.authenticated) {
            return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
        }

        const userId = auth.user.id;

        const { targetUserId, newRole } = await req.json();

        if (!targetUserId || !["admin", "customer"].includes(newRole)) {
            return NextResponse.json(
                { success: false, message: "Invalid data" },
                { status: 400 }
            );
        }

        // Prevent admin from demoting themselves
        if (targetUserId === userId && newRole !== "admin") {
            return NextResponse.json(
                { success: false, message: "You cannot demote yourself" },
                { status: 400 }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            targetUserId,
            { role: newRole },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `User role updated to ${newRole}`,
            user: updatedUser,
        });
    } catch (error) {
        console.error("PATCH /api/admin/users error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// DELETE: Delete user (Admin only)
export async function DELETE(req) {
    try {
        await connectDB();

        // Verify Admin
        // Verify Admin
        const auth = await verifyAdminAuth();
        if (!auth.authenticated) {
            return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
        }

        const userId = auth.user.id;

        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get("id");

        if (!targetUserId) {
            return NextResponse.json(
                { success: false, message: "User ID required" },
                { status: 400 }
            );
        }

        // Prevent admin from deleting themselves
        if (targetUserId === userId) {
            return NextResponse.json(
                { success: false, message: "You cannot delete yourself" },
                { status: 400 }
            );
        }

        const deletedUser = await User.findByIdAndDelete(targetUserId);

        if (!deletedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("DELETE /api/admin/users error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
