import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import StoreSettings from "@/models/StoreSettings";

export async function GET() {
    try {
        await connectDB();
        const settings = await StoreSettings.getSettings();

        // Return only public info (payment methods status)
        return NextResponse.json({
            success: true,
            paymentMethods: settings.paymentMethods,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
