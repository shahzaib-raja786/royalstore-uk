"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import {
    DollarSign,
    Package,
    User,
    Calendar,
    AlertCircle,
    CheckCircle,
    ArrowLeftRight,
    Search,
    Loader,
    ChevronDown,
    ChevronUp,
    MapPin,
    X,
    Eye
} from "lucide-react";

export default function RefundRequests() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [simpleOrderData, setSimpleOrderData] = useState({});

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        orderId: null
    });

    useEffect(() => {
        fetchRefundableOrders();
    }, []);

    const fetchRefundableOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/order", {
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                // Filter orders that are paid via stripe but cancelled/returned
                const refundable = (data.orders || []).filter(order =>
                    order.paymentMethod === "stripe" &&
                    order.paymentStatus === "paid" &&
                    ["cancelled", "returned"].includes(order.status)
                );
                setOrders(refundable);
            } else {
                toast.error(data.message || "Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching refundable orders:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const fetchSimpleOrderData = async (orderId) => {
        try {
            const response = await fetch(`/api/order/${orderId}/simple`, {
                credentials: "include"
            });
            const data = await response.json();

            if (data.success) {
                setSimpleOrderData(prev => ({
                    ...prev,
                    [orderId]: data.order
                }));
            }
        } catch (error) {
            console.error("Error fetching simplified order:", error);
        }
    };

    const handleApproveRefund = async (orderId) => {
        setProcessingId(orderId);
        try {
            const res = await fetch(`/api/admin/order/${orderId}/refund`, {
                method: "POST",
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Refund processed successfully!");
                // Remove from the list
                setOrders(prev => prev.filter(o => o._id !== orderId));
            } else {
                toast.error(data.message || "Failed to process refund");
            }
        } catch (error) {
            console.error("Error processing refund:", error);
            toast.error("An error occurred during refund processing");
        } finally {
            setProcessingId(null);
            setConfirmModal({ show: false, orderId: null });
        }
    };

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader className="w-10 h-10 text-orange-600 animate-spin" />
                <p className="text-gray-500 font-medium">Loading pending refunds...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        Refund Approvals
                    </h2>
                    <p className="text-gray-500 mt-1">Manage and approve Stripe refunds for cancelled or returned orders.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or User..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">No Pending Refunds</h3>
                    <p className="text-gray-500 mt-2">All eligible refunds have been processed or there are no cancelled/returned orders awaiting payment returns.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {filteredOrders.map((order) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-sm text-gray-500 font-mono">#{order._id.slice(-8)}</span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-50 rounded-lg">
                                                        <User className="w-4 h-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Customer</p>
                                                        <p className="font-semibold text-gray-900">{order.user?.name || "Unknown"}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Amount</p>
                                                        <p className="font-bold text-green-600">£{order.totalPrice?.toFixed(2)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-50 rounded-lg">
                                                        <Calendar className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Date</p>
                                                        <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    const isExpanded = expandedOrder === order._id;
                                                    if (!isExpanded && !simpleOrderData[order._id]) fetchSimpleOrderData(order._id);
                                                    setExpandedOrder(isExpanded ? null : order._id);
                                                }}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${expandedOrder === order._id
                                                    ? "bg-orange-50 text-orange-600 border-orange-200"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-500 hover:text-orange-600"
                                                    }`}
                                            >
                                                {expandedOrder === order._id ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                {expandedOrder === order._id ? "Hide Detail" : "View Detail"}
                                            </button>

                                            <button
                                                onClick={() => setConfirmModal({ show: true, orderId: order._id })}
                                                disabled={processingId === order._id}
                                                className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                                            >
                                                {processingId === order._id ? (
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <ArrowLeftRight className="w-5 h-5" />
                                                )}
                                                Approve Refund
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Detail Section */}
                                    <AnimatePresence>
                                        {expandedOrder === order._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="mt-6 pt-6 border-t border-gray-100 overflow-hidden"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {simpleOrderData[order._id] ? (
                                                        <>
                                                            {/* Product List */}
                                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                                    <Package className="w-4 h-4 text-orange-600" />
                                                                    Products ({simpleOrderData[order._id].products.length})
                                                                </h4>
                                                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                                    {simpleOrderData[order._id].products.map((p, idx) => (
                                                                        <div key={idx} className="flex gap-3 text-sm p-2 bg-white rounded-lg border border-gray-100">
                                                                            <img
                                                                                src={p.image || "/fallback.png"}
                                                                                alt={p.productName}
                                                                                className="w-12 h-12 object-cover rounded-md border border-gray-200"
                                                                            />
                                                                            <div className="flex-1">
                                                                                <div className="flex justify-between font-medium text-gray-900">
                                                                                    <span>{p.productName}</span>
                                                                                    <span>£{p.total?.toFixed(2)}</span>
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 mt-1">
                                                                                    Qty: {p.quantity} × £{p.price?.toFixed(2)}
                                                                                </div>
                                                                                {p.customizations?.length > 0 && (
                                                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                                                        {p.customizations.map((c, i) => (
                                                                                            <span key={i} className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-100 uppercase">
                                                                                                {c.type}: {c.option}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Shipping Details */}
                                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4 text-orange-600" />
                                                                    Shipping Details
                                                                </h4>
                                                                <div className="text-sm space-y-2 text-gray-600">
                                                                    <div className="flex justify-between">
                                                                        <span>Name:</span>
                                                                        <span className="font-medium text-gray-900">{simpleOrderData[order._id].shippingInfo?.customerName}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>Phone:</span>
                                                                        <span className="font-medium text-gray-900">{simpleOrderData[order._id].shippingInfo?.phone}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span>Email:</span>
                                                                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{simpleOrderData[order._id].shippingInfo?.email}</span>
                                                                    </div>
                                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                                        <p className="font-medium text-gray-900">Address:</p>
                                                                        <p>{simpleOrderData[order._id].shippingInfo?.address?.street}</p>
                                                                        <p>{simpleOrderData[order._id].shippingInfo?.address?.city}, {simpleOrderData[order._id].shippingInfo?.address?.postalCode}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="col-span-2 flex justify-center py-8">
                                                            <Loader className="w-8 h-8 text-orange-600 animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                    <p className="font-bold mb-1">Important Note</p>
                    <p>Approving a refund here will immediately trigger the financial transaction in Stripe. Please ensure you have received the products (for returns) or finalized the cancellation before proceeding. Refund actions are irreversible through this dashboard.</p>
                </div>
            </div>

            {/* Refund Confirmation Modal */}
            <ConfirmModal
                show={confirmModal.show}
                title="Approve Refund?"
                message="Are you sure you want to approve this refund? This will immediately return the total amount to the customer's original payment method via Stripe. This action cannot be undone."
                yesText="Confirm Refund"
                variant="warning"
                onYes={() => handleApproveRefund(confirmModal.orderId)}
                onNo={() => setConfirmModal({ show: false, orderId: null })}
            />
        </div>
    );
}
