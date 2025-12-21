import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import OTP from "@/models/OTP";
import { sendOTPEmail } from "@/lib/email";

export async function POST(req) {
    try {
        await connectDB();

        const { email } = await req.json();

        // Validate email
        if (!email || !email.trim()) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if there's an existing OTP
        const existingOTP = await OTP.findOne({
            email: normalizedEmail,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!existingOTP) {
            return NextResponse.json(
                { message: "No active reset request found. Please start over." },
                { status: 404 }
            );
        }

        // Generate new 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update existing OTP
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        existingOTP.otp = otp;
        existingOTP.verified = false;
        existingOTP.expiresAt = expiresAt;
        existingOTP.createdAt = new Date();
        await existingOTP.save();

        // Send new OTP email
        try {
            await sendOTPEmail(normalizedEmail, otp);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            return NextResponse.json(
                { message: "Failed to send verification email. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: "New verification code sent to your email",
                email: normalizedEmail
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Resend OTP error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
