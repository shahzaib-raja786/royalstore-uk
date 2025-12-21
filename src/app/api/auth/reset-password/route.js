import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        await connectDB();

        const { email, otp, newPassword } = await req.json();

        // Validate inputs
        if (!email || !email.trim() || !otp || !otp.trim() || !newPassword) {
            return NextResponse.json(
                { message: "Email, OTP, and new password are required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Validate password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        // Find and verify OTP
        const otpRecord = await OTP.findOne({
            email: normalizedEmail,
            otp: otp.trim(),
            verified: true,
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return NextResponse.json(
                { message: "Invalid or unverified OTP. Please verify your code first." },
                { status: 400 }
            );
        }

        // Check if OTP is expired
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return NextResponse.json(
                { message: "Verification code has expired. Please start over." },
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        user.password = hashedPassword;
        await user.save();

        // Delete the used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        return NextResponse.json(
            {
                message: "Password reset successful",
                success: true
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
