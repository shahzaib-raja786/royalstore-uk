"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Save, Building2, Upload, Loader, Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export default function CompanyProfileManager() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        email: "",
        phone: "",
        logo: "",
        socialLinks: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
            youtube: "",
        },
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/company-profile");
            const data = await res.json();
            if (data.success && data.profile) {
                setForm({
                    name: data.profile.name || "",
                    description: data.profile.description || "",
                    address: data.profile.address || "",
                    email: data.profile.email || "",
                    phone: data.profile.phone || "",
                    logo: data.profile.logo || "",
                    socialLinks: {
                        facebook: data.profile.socialLinks?.facebook || "",
                        twitter: data.profile.socialLinks?.twitter || "",
                        instagram: data.profile.socialLinks?.instagram || "",
                        linkedin: data.profile.socialLinks?.linkedin || "",
                        youtube: data.profile.socialLinks?.youtube || "",
                    },
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to load company profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("social_")) {
            const socialKey = name.replace("social_", "");
            setForm(prev => ({
                ...prev,
                socialLinks: {
                    ...prev.socialLinks,
                    [socialKey]: value
                }
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return data.url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        if (!form.name.trim()) {
            toast.error("Company Name is required");
            setSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/company-profile", {
                method: "POST", // Upsert logic
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Company profile updated successfully");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin text-[#de5422]" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-[#de5422]" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Company Profile</h1>
                    <p className="text-sm text-gray-500">Manage your company details and global settings</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Info Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-400" />
                        General Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                                placeholder="e.g. Furniture Logistics UK"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                                placeholder="Brief description of your company..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email Address</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                                placeholder="contact@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Phone Number</span>
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                                placeholder="+44 123 456 789"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                                placeholder="123 Business St, London, UK"
                            />
                        </div>
                    </div>
                </div>

                {/* Branding Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-gray-400" />
                        Branding & Logo
                    </h2>

                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            {form.logo ? (
                                <div className="relative group">
                                    <img
                                        src={form.logo}
                                        alt="Company Logo"
                                        className="w-32 h-32 object-contain border border-gray-200 rounded-lg bg-gray-50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, logo: "" }))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Loader className={`w-4 h-4 ${uploading ? 'animate-spin' : 'hidden'}`} />
                                        <span className={uploading ? 'hidden' : ''}>×</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                    <Upload className="w-8 h-8 mb-2" />
                                    <span className="text-xs">No Logo</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    name="logo"
                                    value={form.logo}
                                    onChange={handleChange}
                                    placeholder="Enter image URL"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                                />
                                <label className="relative cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                setUploading(true);
                                                try {
                                                    const url = await uploadImage(e.target.files[0]);
                                                    setForm(prev => ({ ...prev, logo: url }));
                                                } catch (error) {
                                                    toast.error("Failed to upload image");
                                                } finally {
                                                    setUploading(false);
                                                }
                                            }
                                        }}
                                    />
                                    {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    <span>Upload</span>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Recommended size: 200x200px. PNG or JPG.</p>
                        </div>
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-400" />
                        Social Media Links
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="social_facebook"
                                value={form.socialLinks.facebook}
                                onChange={handleChange}
                                placeholder="Facebook URL"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="social_twitter"
                                value={form.socialLinks.twitter}
                                onChange={handleChange}
                                placeholder="Twitter URL"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="social_instagram"
                                value={form.socialLinks.instagram}
                                onChange={handleChange}
                                placeholder="Instagram URL"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="social_linkedin"
                                value={form.socialLinks.linkedin}
                                onChange={handleChange}
                                placeholder="LinkedIn URL"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="social_youtube"
                                value={form.socialLinks.youtube}
                                onChange={handleChange}
                                placeholder="YouTube URL"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-[#de5422] hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
