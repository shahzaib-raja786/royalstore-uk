import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StoreSettings from "@/models/StoreSettings";
import { verifyAdminAuth } from "@/lib/adminAuth";

export async function GET() {
    try {
        // Verify Admin
        const auth = await verifyAdminAuth();
        if (!auth.authenticated) {
            return NextResponse.json(
                { success: false, error: auth.error || "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();
        const settings = await StoreSettings.getSettings();

        return NextResponse.json({
            success: true,
            settings,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        // Verify Admin
        const auth = await verifyAdminAuth();
        if (!auth.authenticated) {
            return NextResponse.json(
                { success: false, error: auth.error || "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();
        const body = await req.json();

        // Singleton update: find the one document and update it
        let settings = await StoreSettings.findOne();
        if (!settings) {
            settings = new StoreSettings(body);
        } else {
            // Update fields
            if (body.paymentMethods) settings.paymentMethods = body.paymentMethods;
            if (body.stripeConfig) settings.stripeConfig = body.stripeConfig;
            // Add other settings updates here as needed
        }

        await settings.save();

        return NextResponse.json({
            success: true,
            message: "Settings updated successfully",
            settings,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
