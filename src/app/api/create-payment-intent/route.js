
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        await connectDB();

        // Optional: Verify user authentication if required
        // const auth = await verifyAuth(req);
        // if (!auth.success) {
        //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const { amount, currency = "gbp" } = await req.json();

        if (!amount) {
            return NextResponse.json(
                { error: "Amount is required" },
                { status: 400 }
            );
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents/pence
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Internal Error:", error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
