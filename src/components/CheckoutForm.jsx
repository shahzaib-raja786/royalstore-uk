"use client";

import { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { Loader } from "lucide-react";

export default function CheckoutForm({ amount, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/order-confirmation`,
            },
            redirect: "if_required",
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            // Payment succeeded!
            setMessage("Payment succeeded!");
            // Call the parent's success handler to create the order in DB
            onSuccess(paymentIntent);
        } else {
            setIsLoading(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            {message && (
                <div id="payment-message" className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-[#de5422] hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay £${amount.toFixed(2)}`
                )}
            </button>
        </form>
    );
}
