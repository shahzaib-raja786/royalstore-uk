"use client";

import { useState, useEffect } from "react";
import { Save, Wallet, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        paymentMethods: {
            cod: true,
            stripe: false,
        },
        stripeConfig: {
            publicKey: "",
        },
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            if (data.success && data.settings) {
                setSettings(data.settings);
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setSettings((prev) => ({
            ...prev,
            paymentMethods: {
                ...prev.paymentMethods,
                [name]: checked,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Settings updated successfully");
            } else {
                toast.error(data.error || "Failed to update settings");
            }
        } catch (err) {
            console.error("Error updating settings:", err);
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading settings...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
            <h2 className="text-xl font-bold text-[#de5422] mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Gateway Settings
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Cash on Delivery (COD)</h3>
                                <p className="text-sm text-gray-500">Allow users to pay when they receive the order</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="cod"
                                checked={settings.paymentMethods?.cod || false}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#de5422]"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Stripe Payment</h3>
                                <p className="text-sm text-gray-500">Accept credit/debit cards via Stripe</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="stripe"
                                checked={settings.paymentMethods?.stripe || false}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#de5422]"></div>
                        </label>
                    </div>
                </div>

                {/* Future Config Area */}
                {settings.paymentMethods?.stripe && (
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
                        <strong>Note:</strong> To fully enable Stripe, ensure you have set the <code>STRIPE_SECRET_KEY</code> in your environment variables and uncommented the code in <code>/api/checkout/stripe/route.js</code>.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#de5422] text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving Changes..." : "Save Settings"}
                </button>
            </form>
        </div>
    );
}
