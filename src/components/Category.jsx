"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Upload,
    Image as ImageIcon,
    FolderOpen,
    Search,
    Filter,
    MoreVertical,
    ChevronDown,
    ChevronRight,
    AlertTriangle
} from "lucide-react";

export default function CategoryManager() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: "", image: "", subcategories: [] });
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ name: "", image: "", subcategories: [] });
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
    const [newSubcategory, setNewSubcategory] = useState("");
    const [expandedCategories, setExpandedCategories] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/category");
            const data = await res.json();
            setCategories(data.data || []);
        } catch (err) {
            toast.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setMobileMenuOpen(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Upload Image to Cloudinary
    const uploadImage = async (file, callback) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                callback(data.url);
                toast.success("Image uploaded successfully!");
            } else {
                toast.error("Image upload failed");
            }
        } catch (error) {
            toast.error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    // Add category
    const handleAdd = async () => {
        if (!newCategory.name.trim()) return toast.error("Name is required");
        if (!newCategory.image) return toast.error("Image is required");


        try {
            const res = await fetch("/api/category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });

            if (res.ok) {
                toast.success("Category added successfully! ✅");
                setNewCategory({ name: "", image: "", subcategories: [] });
                fetchCategories();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to add category");
            }
        } catch {
            toast.error("Something went wrong!");
        }
    };

    // Update category
    const handleUpdate = async (id) => {
        if (!editData.name.trim()) return toast.error("Name is required");

        try {
            const res = await fetch(`/api/category/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
            });

            if (res.ok) {
                toast.success("Category updated successfully! ✅");
                setEditId(null);
                setEditData({ name: "", image: "", subcategories: [] });
                fetchCategories();
            } else {
                const err = await res.json();
                toast.error(err.error || "Update failed");
            }
        } catch {
            toast.error("Something went wrong!");
        }
    };

    // Delete category - open modal
    const handleDelete = (id) => {
        setCategoryToDelete(id);
        setDeleteModalOpen(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const res = await fetch(`/api/category/${categoryToDelete}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Category deleted successfully! 🗑️");
                fetchCategories();
                setMobileMenuOpen(null);
            } else {
                const err = await res.json();
                toast.error(err.error || "Delete failed");
            }
        } catch {
            toast.error("Something went wrong!");
        } finally {
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    // Cancel edit
    const cancelEdit = () => {
        setEditId(null);
        setEditData({ name: "", image: "", subcategories: [] });
    };

    // Add subcategory to new category
    const addSubcategoryToNew = () => {
        if (!newSubcategory.trim()) return;
        setNewCategory({
            ...newCategory,
            subcategories: [...newCategory.subcategories, { name: newSubcategory.trim() }]
        });
        setNewSubcategory("");
    };

    // Remove subcategory from new category
    const removeSubcategoryFromNew = (index) => {
        const updated = [...newCategory.subcategories];
        updated.splice(index, 1);
        setNewCategory({ ...newCategory, subcategories: updated });
    };

    // Add subcategory to edit data
    const addSubcategoryToEdit = () => {
        if (!newSubcategory.trim()) return;
        setEditData({
            ...editData,
            subcategories: [...(editData.subcategories || []), { name: newSubcategory.trim() }]
        });
        setNewSubcategory("");
    };

    // Remove subcategory from edit data
    const removeSubcategoryFromEdit = (index) => {
        const updated = [...editData.subcategories];
        updated.splice(index, 1);
        setEditData({ ...editData, subcategories: updated });
    };

    // Toggle category expansion
    const toggleExpand = (id) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Filter categories based on search
    const filteredCategories = categories.filter(cat =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get category name for delete modal
    const getCategoryName = () => {
        const category = categories.find(cat => cat._id === categoryToDelete);
        return category?.name || "this category";
    };

    // Mobile category card component
    const CategoryCard = ({ category }) => (
        <div className="bg-white rounded-xl p-4 hover:shadow-md transition-all duration-300 border border-gray-100">
            {editId === category._id ? (
                // Edit Mode - Mobile
                <div className="space-y-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) =>
                                    setEditData({ ...editData, name: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm"
                            />
                        </div>

                        {/* Subcategories Edit - Mobile */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subcategories
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Add subcategory"
                                    value={newSubcategory}
                                    onChange={(e) => setNewSubcategory(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategoryToEdit())}
                                    className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#de5422] outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={addSubcategoryToEdit}
                                    className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {editData.subcategories?.map((sub, idx) => (
                                    <span key={idx} className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-orange-100">
                                        {sub.name}
                                        <button type="button" onClick={() => removeSubcategoryFromEdit(idx)} className="hover:text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image
                            </label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <label className="flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-300 text-sm w-full sm:w-auto justify-center">
                                    <Upload className="w-4 h-4" />
                                    Change Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                uploadImage(file, (url) =>
                                                    setEditData((prev) => ({ ...prev, image: url }))
                                                );
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {editData.image && (
                        <div className="flex items-center gap-3">
                            <img
                                src={editData.image}
                                alt="Preview"
                                className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                            />
                            <span className="text-xs text-gray-600">New image preview</span>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => handleUpdate(category._id)}
                            disabled={!editData.name.trim() || uploading}
                            className="flex-1 flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 text-sm justify-center"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="flex-1 flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-sm justify-center"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                // View Mode - Mobile
                <div>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                            {category.image ? (
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-12 h-12 object-cover rounded-lg border border-gray-300 flex-shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm leading-tight flex items-center gap-2">
                                    {category.name}
                                    {category.subcategories?.length > 0 && (
                                        <button type="button" onClick={() => toggleExpand(category._id)} className="text-gray-400">
                                            {expandedCategories[category._id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                    )}
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                    {category.subcategories?.length || 0} subcategories
                                </p>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMobileMenuOpen(mobileMenuOpen === category._id ? null : category._id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Mobile Dropdown Menu */}
                            {mobileMenuOpen === category._id && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditId(category._id);
                                            setEditData({
                                                name: category.name,
                                                image: category.image,
                                                subcategories: category.subcategories || []
                                            });
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(category._id)}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subcategories List - Mobile */}
                    {expandedCategories[category._id] && category.subcategories?.length > 0 && (
                        <div className="mt-3 pl-14 space-y-1">
                            {category.subcategories.map((sub, idx) => (
                                <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                    {sub.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen  p-3 sm:p-4 lg:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#de5422] mb-2 flex items-center justify-center gap-2 sm:gap-3">
                        <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8" />
                        Category Manager
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">Manage your product categories and subcategories</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {/* Add Category Card */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6 h-fit">
                        <h2 className="text-lg sm:text-xl font-bold text-[#de5422] mb-4 sm:mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add New Category
                        </h2>

                        <div className="space-y-3 sm:space-y-4">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter category name"
                                    value={newCategory.name}
                                    onChange={(e) =>
                                        setNewCategory({ ...newCategory, name: e.target.value })
                                    }
                                    className="w-full border border-gray-300 rounded-lg sm:rounded-xl p-2.5 sm:p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm sm:text-base"
                                />
                            </div>

                            {/* Subcategories Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                    Subcategories
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Add subcategory"
                                        value={newSubcategory}
                                        onChange={(e) => setNewSubcategory(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategoryToNew())}
                                        className="flex-1 border border-gray-300 rounded-lg sm:rounded-xl p-2.5 sm:p-3 focus:ring-2 focus:ring-[#de5422] outline-none text-sm sm:text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSubcategoryToNew}
                                        className="bg-gray-100 text-gray-600 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {newCategory.subcategories.map((sub, idx) => (
                                        <span key={idx} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-sm flex items-center gap-2 border border-orange-100">
                                            {sub.name}
                                            <button type="button" onClick={() => removeSubcategoryFromNew(idx)} className="hover:text-red-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                    Category Image *
                                </label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <label className="flex items-center gap-2 bg-[#de5422] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl cursor-pointer hover:bg-orange-700 transition-colors duration-300 text-sm sm:text-base w-full sm:w-auto justify-center">
                                        <Upload className="w-4 h-4" />
                                        {uploading ? "Uploading..." : "Upload Image"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    uploadImage(file, (url) =>
                                                        setNewCategory((prev) => ({ ...prev, image: url }))
                                                    );
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </label>

                                    {newCategory.image && (
                                        <div className="relative">
                                            <img
                                                src={newCategory.image}
                                                alt="Preview"
                                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setNewCategory({ ...newCategory, image: "" })}
                                                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-0.5 sm:p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add Button */}
                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={!newCategory.name.trim() || !newCategory.image || uploading}
                                className="w-full flex items-center justify-center gap-2 bg-[#de5422] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                            >
                                <Plus className="w-4 h-4" />
                                Add Category
                            </button>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-bold text-[#de5422] flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5" />
                                    Existing Categories
                                </h2>
                                <span className="bg-orange-100 text-[#de5422] px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                                    {filteredCategories.length}
                                </span>
                            </div>

                            {/* Search */}
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-64 pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8 sm:py-12">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#de5422]"></div>
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="text-center py-8 sm:py-12 text-gray-500">
                                <FolderOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                                <p className="text-sm sm:text-base">No categories found</p>
                                {searchTerm && (
                                    <p className="text-xs sm:text-sm mt-1 sm:mt-2">Try adjusting your search</p>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Mobile View - Cards */}
                                <div className="block sm:hidden space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#de5422]/70 scrollbar-track-transparent">
                                    {filteredCategories.map((cat) => (
                                        <CategoryCard key={cat._id} category={cat} />
                                    ))}
                                </div>

                                {/* Desktop View - List */}
                                <div className="hidden sm:block space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#de5422]/70 scrollbar-track-transparent">
                                    {filteredCategories.map((cat) => (
                                        <div
                                            key={cat._id}
                                            className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50"
                                        >
                                            {editId === cat._id ? (
                                                // Edit Mode - Desktop
                                                <div className="space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={editData.name}
                                                                    onChange={(e) =>
                                                                        setEditData({ ...editData, name: e.target.value })
                                                                    }
                                                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300"
                                                                />
                                                            </div>

                                                            {/* Subcategories Edit - Desktop */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Subcategories
                                                                </label>
                                                                <div className="flex gap-2 mb-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Add subcategory"
                                                                        value={newSubcategory}
                                                                        onChange={(e) => setNewSubcategory(e.target.value)}
                                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubcategoryToEdit())}
                                                                        className="flex-1 border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-[#de5422] outline-none"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={addSubcategoryToEdit}
                                                                        className="bg-gray-100 text-gray-600 p-2 rounded-xl hover:bg-gray-200"
                                                                    >
                                                                        <Plus className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {editData.subcategories?.map((sub, idx) => (
                                                                        <span key={idx} className="bg-white text-orange-700 px-2 py-1 rounded-lg text-sm flex items-center gap-1 border border-orange-100 shadow-sm">
                                                                            {sub.name}
                                                                            <button type="button" onClick={() => removeSubcategoryFromEdit(idx)} className="hover:text-red-500">
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Image
                                                            </label>
                                                            <div className="flex items-center gap-2">
                                                                <label className="flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors duration-300">
                                                                    <Upload className="w-4 h-4" />
                                                                    Change
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files[0];
                                                                            if (file) {
                                                                                uploadImage(file, (url) =>
                                                                                    setEditData((prev) => ({ ...prev, image: url }))
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="hidden"
                                                                    />
                                                                </label>
                                                            </div>

                                                            {editData.image && (
                                                                <div className="mt-4 flex items-center gap-4">
                                                                    <img
                                                                        src={editData.image}
                                                                        alt="Preview"
                                                                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                                                    />
                                                                    <span className="text-sm text-gray-600">New image preview</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdate(cat._id)}
                                                            disabled={!editData.name.trim() || uploading}
                                                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                            Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={cancelEdit}
                                                            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // View Mode - Desktop
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            {cat.image ? (
                                                                <img
                                                                    src={cat.image}
                                                                    alt={cat.name}
                                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-16 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                                                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                                                                    {cat.name}
                                                                    {cat.subcategories?.length > 0 && (
                                                                        <button type="button" onClick={() => toggleExpand(cat._id)} className="text-gray-400 hover:text-gray-600">
                                                                            {expandedCategories[cat._id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                                                        </button>
                                                                    )}
                                                                </h3>
                                                                <p className="text-sm text-gray-600">
                                                                    {cat.subcategories?.length || 0} subcategories
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditId(cat._id);
                                                                    setEditData({
                                                                        name: cat.name,
                                                                        image: cat.image,
                                                                        subcategories: cat.subcategories || []
                                                                    });
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(cat._id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Subcategories List - Desktop */}
                                                    {expandedCategories[cat._id] && cat.subcategories?.length > 0 && (
                                                        <div className="mt-4 ml-20 pl-4 border-l-2 border-orange-100">
                                                            <div className="flex flex-wrap gap-2">
                                                                {cat.subcategories.map((sub, idx) => (
                                                                    <span key={idx} className="bg-white text-gray-600 px-3 py-1 rounded-full text-sm border border-gray-100 shadow-sm">
                                                                        {sub.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Custom Delete Confirmation Modal */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100 border border-gray-100">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Category</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Are you sure you want to delete <span className="font-semibold text-gray-700">{getCategoryName()}</span>? This action cannot be undone and will permanently remove this category and all its subcategories.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={cancelDelete}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#de5422]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmDelete}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Delete Category
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
