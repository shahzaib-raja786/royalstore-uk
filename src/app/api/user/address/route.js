import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// GET user's saved addresses
export async function GET(req) {
    await connectDB();
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized - no user id" },
                { status: 401 }
            );
        }

        const user = await User.findById(userId).select("addresses");

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, addresses: user.addresses || [] },
            { status: 200 }
        );
    } catch (err) {
        console.error("GET address error:", err);
        return NextResponse.json(
            { error: "Failed to fetch addresses", details: err.message },
            { status: 500 }
        );
    }
}

// POST - Add a new address
export async function POST(req) {
    await connectDB();
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized - no user id" },
                { status: 401 }
            );
        }

        const addressData = await req.json();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Initialize addresses array if it doesn't exist
        if (!user.addresses) {
            user.addresses = [];
        }

        // Add new address
        user.addresses.push(addressData);
        await user.save();

        return NextResponse.json(
            { success: true, addresses: user.addresses },
            { status: 201 }
        );
    } catch (err) {
        console.error("POST address error:", err);
        return NextResponse.json(
            { error: "Failed to add address", details: err.message },
            { status: 500 }
        );
    }
}

// PUT - Update an existing address
export async function PUT(req) {
    await connectDB();
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized - no user id" },
                { status: 401 }
            );
        }

        const { addressId, ...addressData } = await req.json();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const addressIndex = user.addresses.findIndex(
            (addr) => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return NextResponse.json(
                { error: "Address not found" },
                { status: 404 }
            );
        }

        // Update address
        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex],
            ...addressData,
        };
        await user.save();

        return NextResponse.json(
            { success: true, addresses: user.addresses },
            { status: 200 }
        );
    } catch (err) {
        console.error("PUT address error:", err);
        return NextResponse.json(
            { error: "Failed to update address", details: err.message },
            { status: 500 }
        );
    }
}

// DELETE - Remove an address
export async function DELETE(req) {
    await connectDB();
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized - no user id" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const addressId = searchParams.get("addressId");

        if (!addressId) {
            return NextResponse.json(
                { error: "Address ID required" },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Remove address
        user.addresses = user.addresses.filter(
            (addr) => addr._id.toString() !== addressId
        );
        await user.save();

        return NextResponse.json(
            { success: true, addresses: user.addresses },
            { status: 200 }
        );
    } catch (err) {
        console.error("DELETE address error:", err);
        return NextResponse.json(
            { error: "Failed to delete address", details: err.message },
            { status: 500 }
        );
    }
}
