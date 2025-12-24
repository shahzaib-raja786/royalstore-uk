"use client";
import React from "react";

const ConfirmModal = ({ show, title = "Are you sure?", message, onYes, onNo, yesText = "Yes, Continue", noText = "Cancel", variant = "danger" }) => {
    if (!show) return null;

    const variantStyles = {
        danger: "bg-red-600 hover:bg-red-700 text-white",
        warning: "bg-orange-600 hover:bg-orange-700 text-white",
        success: "bg-green-600 hover:bg-green-700 text-white",
        primary: "bg-[#de5422] hover:bg-[#de5422]/90 text-white",
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-[400px] p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-100">
                {title && (
                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                        {title}
                    </h3>
                )}
                <p className="text-gray-600 text-center mb-8 text-sm leading-relaxed">
                    {message}
                </p>

                <div className="flex justify-center gap-3">
                    <button
                        onClick={onNo}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200"
                    >
                        {noText}
                    </button>

                    <button
                        onClick={onYes}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 ${variantStyles[variant] || variantStyles.danger}`}
                    >
                        {yesText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
