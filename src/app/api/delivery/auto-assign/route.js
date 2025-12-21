import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import DeliveryRoute from "@/models/DeliveryRoute";
import { verifyAdminAuth } from "@/lib/adminAuth";

export async function POST(req) {
    try {
        await connectDB();

        // Authorization Check
        const auth = await verifyAdminAuth();
        if (!auth.authenticated) {
            return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
        }

        const { dryRun, deliveryDate, assignments } = await req.json();

        // 1. Fetch unassigned orders that are eligible (e.g., pending/processing)
        const orders = await Order.find({
            deliveryRoute: null,
            status: { $in: ["pending", "processing"] }, // Only assign active orders
        }).select("shippingAddress.city _id");

        if (orders.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No eligible unassigned orders found.",
                preview: { newRoutes: [], existingRoutes: [] }
            });
        }

        // Group orders by city
        const ordersByCity = {};
        orders.forEach(order => {
            const city = order.shippingAddress?.city?.trim(); // Normalize city
            if (city) {
                if (!ordersByCity[city]) ordersByCity[city] = [];
                ordersByCity[city].push(order._id);
            }
        });

        // --- DRY RUN: Generate Preview ---
        if (dryRun) {
            const newRoutes = [];
            const existingRoutes = [];

            for (const city of Object.keys(ordersByCity)) {
                // Check for EXISTING active route (pending or processing)
                const existingRoute = await DeliveryRoute.findOne({
                    city: { $regex: new RegExp(`^${city}$`, "i") }, // Case-insensitive exact match
                    status: { $in: ["pending", "processing"] }
                });

                const orderCount = ordersByCity[city].length;

                if (existingRoute) {
                    existingRoutes.push({
                        city: existingRoute.city, // Use route's canonical city name
                        originalCityKey: city, // Keep track of exact match key
                        routeId: existingRoute._id,
                        currentStatus: existingRoute.status,
                        deliveryDate: existingRoute.deliveryDate,
                        orderCount,
                        suggestedDate: existingRoute.deliveryDate // Default to existing date
                    });
                } else {
                    newRoutes.push({
                        city,
                        orderCount,
                        suggestedDate: deliveryDate // Default to selected global date
                    });
                }
            }

            return NextResponse.json({
                success: true,
                preview: { newRoutes, existingRoutes }
            });
        }

        // --- EXECUTION: Perform Assignments ---
        if (!assignments || !Array.isArray(assignments)) {
            return NextResponse.json({ success: false, message: "Invalid assignments data" }, { status: 400 });
        }

        let assignedCount = 0;
        let createdRoutesCount = 0;
        const updatedRoutes = new Set();

        for (const assignment of assignments) {
            const { city, date } = assignment;
            const orderIds = ordersByCity[city];

            if (!orderIds || orderIds.length === 0) continue;

            // RE-CHECK for existing route to ensure consistency during execution
            let route = await DeliveryRoute.findOne({
                city: { $regex: new RegExp(`^${city}$`, "i") },
                status: { $in: ["pending", "processing"] }
            });

            if (route) {
                // Use EXISTING route
                // Optionally update date if provided? Usually we keep existing route date unless explicitly changed.
                // For now, we trust the existing route's date and status, or maybe update date if critical.
                // The requirement implies just "assign to previous created route".
            } else {
                // Create NEW Route
                route = await DeliveryRoute.create({
                    city,
                    deliveryDate: new Date(date),
                    status: "pending"
                });
                createdRoutesCount++;
            }

            // Assign orders
            await Order.updateMany(
                { _id: { $in: orderIds } },
                {
                    $set: {
                        deliveryRoute: route._id,
                        status: route.status // Sync status!
                    }
                }
            );

            updatedRoutes.add(route.city);
            assignedCount += orderIds.length;
        }

        return NextResponse.json({
            success: true,
            message: `Assigned ${assignedCount} orders. Created ${createdRoutesCount} new routes.`,
            updatedRoutes: Array.from(updatedRoutes)
        });

    } catch (error) {
        console.error("Auto Assign Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
