import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import OTP from "@/models/OTP";

export async function POST(req) {
    try {
        await connectDB();

        const { email, otp } = await req.json();

        // Validate inputs
        if (!email || !email.trim() || !otp || !otp.trim()) {
            return NextResponse.json(
                { message: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find the OTP
        const otpRecord = await OTP.findOne({
            email: normalizedEmail,
            otp: otp.trim(),
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return NextResponse.json(
                { message: "Invalid verification code" },
                { status: 400 }
            );
        }

        // Check if OTP is expired
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return NextResponse.json(
                { message: "Verification code has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Check if already verified
        if (otpRecord.verified) {
            return NextResponse.json(
                { message: "This code has already been used" },
                { status: 400 }
            );
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        return NextResponse.json(
            {
                message: "Verification successful",
                verified: true
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
