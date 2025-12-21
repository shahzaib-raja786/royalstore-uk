import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import StoreSettings from "@/models/StoreSettings";
import { verifyAdminAuth } from "@/lib/adminAuth"; // Not really needed for public checkout, but good for admin checks

// Placeholder imports for when Stripe is installed
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        await connectDB();
        const { items, email } = await req.json();

        const settings = await StoreSettings.getSettings();
        if (!settings.paymentMethods.stripe) {
            return NextResponse.json(
                { error: "Stripe payment is currently disabled." },
                { status: 400 }
            );
        }

        // 1. Calculate price securely on server (mock logic for now)
        // const amount = calculateTotal(items);

        // 2. Create Stripe Session
        /*
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: items.map(item => ({
            price_data: {
                currency: "gbp",
                product_data: { name: item.name },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
          })),
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout`,
          customer_email: email,
        });
        */

        // Placeholder Response
        return NextResponse.json({
            success: false,
            message: "Stripe integration is not yet active. Please add your API keys and uncomment the code in /api/checkout/stripe/route.js"
        }, { status: 501 });

        // return NextResponse.json({ id: session.id });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
