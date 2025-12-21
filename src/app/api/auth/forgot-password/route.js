import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
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

        // Check if user exists
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return NextResponse.json(
                { message: "No account found with this email address" },
                { status: 404 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email: normalizedEmail });

        // Create new OTP with 10-minute expiry
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await OTP.create({
            email: normalizedEmail,
            otp,
            verified: false,
            expiresAt,
        });

        // Send OTP email
        try {
            await sendOTPEmail(normalizedEmail, otp);
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Delete the OTP if email fails
            await OTP.deleteOne({ email: normalizedEmail, otp });
            return NextResponse.json(
                { message: "Failed to send verification email. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: "Verification code sent to your email",
                email: normalizedEmail
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
