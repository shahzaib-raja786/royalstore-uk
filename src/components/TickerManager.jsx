"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Link as LinkIcon, MessageCircle, AlertCircle, Loader, ExternalLink } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

export default function TickerManager() {
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [tickers, setTickers] = useState([]);
  const [deleting, setDeleting] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    tickerId: null,
  });

  // Fetch tickers from API
  const fetchTickers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ticker");
      const data = await res.json();
      setTickers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tickers:", error);
      toast.error("Failed to load tickers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickers();
  }, []);

  // Add new ticker
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          link: link.trim() || undefined
        }),
      });

      if (res.ok) {
        const newTicker = await res.json();
        setTickers([newTicker, ...tickers]);
        setMessage("");
        setLink("");
        toast.success("🎉 Ticker added successfully!");
      } else {
        const error = await res.json();
        toast.error(error?.message || "Failed to add ticker");
      }
    } catch (error) {
      console.error("Error adding ticker:", error);
      toast.error("Failed to add ticker");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete ticker
  const handleDelete = (id) => {
    setConfirmModal({ show: true, tickerId: id });
  };

  const confirmDelete = async () => {
    const id = confirmModal.tickerId;
    setConfirmModal({ show: false, tickerId: null });

    setDeleting(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/ticker/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("🗑️ Ticker deleted successfully");
        setTickers(prev => prev.filter(t => t._id !== id));
      } else {
        toast.error(data?.message || "Failed to delete ticker");
      }
    } catch (error) {
      console.error("Error deleting ticker:", error);
      toast.error("Failed to delete ticker");
    } finally {
      setDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ show: false, tickerId: null });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#de5422] mb-2 flex items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8" />
            Ticker Manager
          </h1>
          <p className="text-gray-600">Manage announcement messages for the ticker bar</p>
        </div>

        {/* Add Ticker Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-[#de5422] mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Ticker
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Announcement Message *
              </label>
              <input
                type="text"
                placeholder="Enter your announcement message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300"
                required
                maxLength={200}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {message.length}/200 characters
              </div>
            </div>

            {/* Link Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-1" />
                Optional Link
              </label>
              <input
                type="url"
                placeholder="https://example.com (optional)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#de5422] hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Adding Ticker...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Ticker
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tickers List */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#de5422] flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Active Tickers
              <span className="bg-orange-100 text-[#de5422] px-2 py-1 rounded-full text-sm font-medium">
                {tickers.length} ticker{tickers.length !== 1 ? 's' : ''}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#de5422] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tickers...</p>
              </div>
            </div>
          ) : tickers.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Tickers Yet</h3>
              <p className="text-gray-500">Add your first announcement to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickers.map((ticker) => (
                <div
                  key={ticker._id}
                  className="border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Message */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 bg-[#de5422] rounded-lg mt-1">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium leading-relaxed">
                            {ticker.message}
                          </p>

                          {/* Link */}
                          {ticker.link && (
                            <div className="mt-2 flex items-center gap-2">
                              <LinkIcon className="w-4 h-4 text-[#de5422]" />
                              <a
                                href={ticker.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#de5422] hover:text-orange-700 font-medium text-sm flex items-center gap-1 transition-colors duration-200"
                              >
                                {ticker.link}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="text-xs text-gray-500 mt-2">
                            Added: {new Date(ticker.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(ticker._id)}
                      disabled={deleting[ticker._id]}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete ticker"
                    >
                      {deleting[ticker._id] ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Tips for Effective Tickers
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Keep messages short and impactful (under 200 characters)</li>
            <li>• Use links to direct users to relevant pages</li>
            <li>• Highlight promotions, announcements, or important updates</li>
            <li>• Test links to ensure they work properly</li>
          </ul>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          show={confirmModal.show}
          message="Are you sure you want to delete this ticker?"
          onYes={confirmDelete}
          onNo={cancelDelete}
        />
      </div>
    </div>
  );
}