"use client";
import React from "react";

const ConfirmModal = ({ show, message, onYes, onNo }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
            <div className="bg-white w-[90%] max-w-[400px] p-6 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
                <p className="text-gray-800 text-center mb-6 text-base font-medium">
                    {message}
                </p>

                <div className="flex justify-center gap-3">
                    <button
                        onClick={onNo}
                        className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors duration-200"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onYes}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
