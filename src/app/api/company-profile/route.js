import { connectDB } from "@/lib/db";
import CompanyProfile from "@/models/CompanyProfile";
import { NextResponse } from "next/server";

// GET: Fetch company profile
export async function GET() {
    try {
        console.log("Connecting to DB...");
        await connectDB();
        console.log("Connected to DB successfully");
        
        // Fetch the single document. Since there's only one profile, findOne() works.
        console.log("Fetching company profile...");
        const profile = await CompanyProfile.findOne();
        console.log("Profile fetched:", profile);
        
        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error("Error fetching company profile:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch company profile", error: error.message },
            { status: 500 }
        );
    }
}

// POST: Create or Update company profile (Upsert)
export async function POST(req) {
    try {
        console.log("Connecting to DB...");
        await connectDB();
        console.log("Connected to DB successfully");
        
        const data = await req.json();
        console.log("Received data:", data);

        // Check if a profile already exists
        console.log("Checking for existing profile...");
        let profile = await CompanyProfile.findOne();
        console.log("Existing profile:", profile);

        if (profile) {
            // Update existing profile
            console.log("Updating existing profile...");
            profile = await CompanyProfile.findByIdAndUpdate(profile._id, data, {
                new: true,
                runValidators: true,
            });
            console.log("Profile updated:", profile);
        } else {
            // Create new profile
            console.log("Creating new profile...");
            profile = await CompanyProfile.create(data);
            console.log("Profile created:", profile);
        }

        return NextResponse.json({
            success: true,
            message: "Company profile updated successfully",
            profile
        }, { status: 201 });

    } catch (error) {
        console.error("Error saving company profile:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to save company profile", error: error.message },
            { status: 500 }
        );
    }
}