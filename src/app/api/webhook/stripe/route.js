import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

// Placeholder Stripe Webhook
export async function POST(req) {
    try {
        const body = await req.text();
        // const sig = req.headers.get("stripe-signature");

        // let event;
        // try {
        //   event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        // } catch (err) {
        //   return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
        // }

        // Handle the event
        /*
        switch (event.type) {
          case "checkout.session.completed":
            const session = event.data.object;
            await Order.findOneAndUpdate(
                { stripeSessionId: session.id },
                { paymentStatus: "paid", status: "processing" }
            );
            break;
          default:
            console.log(`Unhandled event type ${event.type}`);
        }
        */

        return NextResponse.json({ received: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
