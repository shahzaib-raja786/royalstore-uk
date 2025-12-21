"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    User,
    MapPin,
    Calendar,
    Package,
    Truck,
} from "lucide-react";

export default function CancellationRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [adminNote, setAdminNote] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/cancellation-requests", {
                credentials: "include",
            });
            const data = await res.json();

            if (data.success) {
                setRequests(data.requests || []);
            } else {
                toast.error(data.message || "Failed to fetch cancellation requests");
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Failed to load cancellation requests");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        if (!selectedRequest) return;

        setProcessingId(selectedRequest._id);

        try {
            const res = await fetch("/api/admin/cancellation-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    orderId: selectedRequest._id,
                    action,
                    adminNote: adminNote || undefined,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                await fetchRequests(); // Refresh the list
                setShowModal(false);
                setSelectedRequest(null);
                setAdminNote("");
            } else {
                toast.error(data.message || `Failed to ${action} request`);
            }
        } catch (error) {
            console.error(`Error ${action}ing request:`, error);
            toast.error(`Failed to ${action} cancellation request`);
        } finally {
            setProcessingId(null);
        }
    };

    const openModal = (request, action) => {
        setSelectedRequest(request);
        setModalAction(action);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#de5422] border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Loading cancellation requests...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-amber-400 px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Cancellation Requests
                            </h2>
                            <p className="text-orange-100 text-sm mt-1">
                                {requests.length} pending request{requests.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        All Clear!
                    </h3>
                    <p className="text-gray-600">
                        No pending cancellation requests at the moment.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((request) => (
                        <RequestCard
                            key={request._id}
                            request={request}
                            onApprove={() => openModal(request, "approve")}
                            onReject={() => openModal(request, "reject")}
                            isProcessing={processingId === request._id}
                        />
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showModal && selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setShowModal(false);
                            setSelectedRequest(null);
                            setAdminNote("");
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div
                                className={`px-6 py-4 ${modalAction === "approve"
                                        ? "bg-gradient-to-r from-green-600 to-emerald-600"
                                        : "bg-gradient-to-r from-red-600 to-orange-600"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        {modalAction === "approve" ? (
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        {modalAction === "approve" ? "Approve" : "Reject"} Cancellation
                                    </h3>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                <p className="text-gray-700">
                                    {modalAction === "approve"
                                        ? "Are you sure you want to approve this cancellation request? The order will be cancelled and removed from the delivery route."
                                        : "Are you sure you want to reject this cancellation request? The order will remain active."}
                                </p>

                                {/* Order Details */}
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Order ID:</span>
                                        <span className="font-mono font-semibold">
                                            {selectedRequest._id.slice(-8)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Customer:</span>
                                        <span className="font-semibold">
                                            {selectedRequest.user?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total:</span>
                                        <span className="font-semibold">
                                            £{selectedRequest.totalPrice?.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Admin Note */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Admin Note (optional)
                                    </label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder={
                                            modalAction === "approve"
                                                ? "Add a note about why this was approved..."
                                                : "Add a note about why this was rejected..."
                                        }
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all duration-200 resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedRequest(null);
                                        setAdminNote("");
                                    }}
                                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleAction(modalAction)}
                                    disabled={processingId === selectedRequest._id}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${modalAction === "approve"
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-red-600 hover:bg-red-700"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {processingId === selectedRequest._id
                                        ? "Processing..."
                                        : `Confirm ${modalAction === "approve" ? "Approval" : "Rejection"}`}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Request Card Component
function RequestCard({ request, onApprove, onReject, isProcessing }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Cancellation Requested
                            </span>
                            <span className="text-sm text-gray-500">
                                {new Date(request.cancellationRequestedAt).toLocaleString()}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4" />
                                <span className="font-semibold">{request.user?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Package className="w-4 h-4" />
                                <span>
                                    {request.items?.length} item{request.items?.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="font-semibold">£{request.totalPrice?.toFixed(2)}</span>
                            </div>
                            {request.deliveryRoute && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Truck className="w-4 h-4" />
                                    <span>{request.deliveryRoute.city}</span>
                                </div>
                            )}
                        </div>

                        {/* Cancellation Reason */}
                        {request.cancellationReason && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm font-semibold text-amber-900 mb-1">
                                    Reason:
                                </p>
                                <p className="text-sm text-amber-800">{request.cancellationReason}</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onReject}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-red-50 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            Reject
                        </button>
                        <button
                            onClick={onApprove}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
