"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount: "",
    expiry: "",
    maxUses: "",
    minOrder: ""
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch all coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupon/getAll");
      const data = await res.json();
      
      if (res.ok) {
        setCoupons(data.coupons || []);
      } else {
        toast.error(data?.error || "Failed to fetch coupons");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Network error while fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  // Delete all coupons with confirmation
  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL coupons? This action cannot be undone.")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/coupon/deleteAll", { 
        method: "DELETE" 
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(`🗑️ Deleted ${data.deletedCount} coupons`);
        setCoupons([]);
      } else {
        toast.error(data?.error || "Failed to delete all coupons");
      }
    } catch (error) {
      console.error("Delete all error:", error);
      toast.error("Network error while deleting coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle input change with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!form.code.trim()) {
      errors.code = "Coupon code is required";
    } else if (form.code.length < 3) {
      errors.code = "Coupon code must be at least 3 characters";
    }

    if (!form.discount) {
      errors.discount = "Discount is required";
    } else if (form.discount < 1 || form.discount > 100) {
      errors.discount = "Discount must be between 1% and 100%";
    }

    if (!form.expiry) {
      errors.expiry = "Expiry date is required";
    } else if (new Date(form.expiry) <= new Date()) {
      errors.expiry = "Expiry date must be in the future";
    }

    if (form.maxUses && form.maxUses < 1) {
      errors.maxUses = "Max uses must be at least 1";
    }

    if (form.minOrder && form.minOrder < 0) {
      errors.minOrder = "Minimum order cannot be negative";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate random coupon code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm(prev => ({ ...prev, code }));
  };

  // Add new coupon
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/coupon/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          discountValue: parseInt(form.discount),
          expiryDate: form.expiry,
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          minOrderAmount: form.minOrder ? parseFloat(form.minOrder) : null
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Coupon added successfully!");
        setForm({ 
          code: "", 
          discount: "", 
          expiry: "", 
          maxUses: "", 
          minOrder: "" 
        });
        setFormErrors({});
        fetchCoupons();
      } else {
        toast.error(data?.error || "Failed to add coupon");
      }
    } catch (error) {
      console.error("Error adding coupon:", error);
      toast.error("Network error while adding coupon");
    } finally {
      setLoading(false);
    }
  };

  // Delete single coupon
  const handleDelete = async (id, code) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    try {
      const res = await fetch(`/api/coupon/delete?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`🗑️ Coupon "${code}" deleted successfully`);
        fetchCoupons();
      } else {
        toast.error(data?.error || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Network error while deleting coupon");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
  };

  // Check if coupon is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Coupon Management</h2>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Create and manage discount coupons</p>
        </div>
        {coupons.length > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={loading}
            className="bg-gradient-to-br from-red-500 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm lg:text-base"
          >
            Delete All Coupons
          </button>
        )}
      </div>

      {/* Add Coupon Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Create New Coupon</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {/* Coupon Code */}
            <div className="lg:col-span-2 xl:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="code"
                  placeholder="SUMMER25"
                  value={form.code}
                  onChange={handleChange}
                  className={`flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 transition ${
                    formErrors.code 
                      ? "border-red-500 focus:ring-red-200" 
                      : "border-gray-300 focus:ring-[#de5422] focus:ring-opacity-50"
                  }`}
                  required
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 hover:text-white transition-all duration-300 font-medium text-sm whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
              )}
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%) *
              </label>
              <input
                type="number"
                name="discount"
                placeholder="25"
                value={form.discount}
                onChange={handleChange}
                min="1"
                max="100"
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition ${
                  formErrors.discount 
                    ? "border-red-500 focus:ring-red-200" 
                    : "border-gray-300 focus:ring-[#de5422] focus:ring-opacity-50"
                }`}
                required
              />
              {formErrors.discount && (
                <p className="mt-1 text-sm text-red-600">{formErrors.discount}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <input
                type="date"
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition ${
                  formErrors.expiry 
                    ? "border-red-500 focus:ring-red-200" 
                    : "border-gray-300 focus:ring-[#de5422] focus:ring-opacity-50"
                }`}
                required
              />
              {formErrors.expiry && (
                <p className="mt-1 text-sm text-red-600">{formErrors.expiry}</p>
              )}
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Uses (Optional)
              </label>
              <input
                type="number"
                name="maxUses"
                placeholder="Unlimited"
                value={form.maxUses}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#de5422] focus:ring-opacity-50 transition"
              />
            </div>

            {/* Minimum Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Order $ (Optional)
              </label>
              <input
                type="number"
                name="minOrder"
                placeholder="No minimum"
                value={form.minOrder}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#de5422] focus:ring-opacity-50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-amber-400 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-amber-500 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Coupon...
              </span>
            ) : (
              "Create Coupon"
            )}
          </button>
        </form>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900">All Coupons</h3>
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
            {coupons.length} coupon{coupons.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading && coupons.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#de5422] mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">🎟️</div>
            <p className="text-gray-500 text-lg font-medium">No coupons available</p>
            <p className="text-gray-400 text-sm mt-2">Create your first coupon to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg border transition-all duration-300 ${
                  isExpired(coupon.expiryDate || coupon.expiry) 
                    ? "bg-red-50 border-red-200" 
                    : "bg-white border-gray-200 hover:border-[#de5422] hover:shadow-md"
                }`}
              >
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3 lg:mb-2">
                    {/* Coupon Code */}
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                      isExpired(coupon.expiryDate || coupon.expiry)
                        ? "bg-red-100 text-red-800"
                        : "bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg"
                    }`}>
                      <span className="text-lg">🎟️</span>
                      {coupon.code}
                      {isExpired(coupon.expiryDate || coupon.expiry) && (
                        <span className="ml-2 text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">EXPIRED</span>
                      )}
                    </span>
                    
                    {/* Discount */}
                    <span className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                      <span className="text-lg">💰</span>
                      {coupon.discountValue}% OFF
                    </span>

                    {/* Expiry */}
                    <span className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                      <span className="text-lg">📅</span>
                      Expires: {formatDate(coupon.expiryDate || coupon.expiry)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Max Uses */}
                    {coupon.maxUses && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                        <span className="text-sm">🔢</span>
                        Max Uses: {coupon.maxUses}
                      </span>
                    )}

                    {/* Minimum Order */}
                    {coupon.minOrderAmount && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                        <span className="text-sm">📦</span>
                        Min Order: ${coupon.minOrderAmount}
                      </span>
                    )}

                    {/* Usage Count */}
                    {coupon.usedCount !== undefined && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                        <span className="text-sm">👥</span>
                        Used {coupon.usedCount} time{coupon.usedCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 lg:flex-col lg:gap-1">
                  <button
                    onClick={() => handleDelete(coupon._id, coupon.code)}
                    disabled={loading}
                    className="flex-1 lg:flex-none bg-gradient-to-br from-red-500 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow hover:shadow-lg transform hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}