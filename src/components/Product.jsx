"use client";
import { useEffect, useState } from "react";
import TiptapEditor from "@/components/TiptapEditor";
import ConfirmModal from "./ConfirmModal";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Upload,
  Package,
  DollarSign,
  Percent,
  Image as ImageIcon,
  Tag,
  Settings,
  Save,
  Loader,
  MoreVertical,
  Eye
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userId, setUserId] = useState(null);

  /* Removed Draft.js constants */

  const emptyForm = {
    name: "",
    description: "",
    basePrice: "",
    discount: "",
    thumbnail: "",
    images: [],
    category: "",
    subcategory: "",
    customizations: [],
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/product?search=${search}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  // fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
      else if (Array.isArray(data.data)) setCategories(data.data);
      else setCategories([]);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

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

  // input change
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // customization change
  const handleCustomizationChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.customizations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, customizations: updated };
    });
  };

  // option change
  const handleOptionChange = (cIndex, oIndex, field, value) => {
    setForm((prev) => {
      const updated = [...prev.customizations];
      const options = [...updated[cIndex].options];
      options[oIndex] = { ...options[oIndex], [field]: value };
      updated[cIndex] = { ...updated[cIndex], options };
      return { ...prev, customizations: updated };
    });
  };

  // add / remove customization
  const addCustomization = () => {
    setForm((prev) => ({
      ...prev,
      customizations: [
        ...prev.customizations,
        { type: "", label: "", required: false, options: [] },
      ],
    }));
  };

  const removeCustomization = (index) => {
    setForm((prev) => {
      const updated = [...prev.customizations];
      updated.splice(index, 1);
      return { ...prev, customizations: updated };
    });
  };

  // add / remove option
  const addOption = (cIndex) => {
    setForm((prev) => {
      const updated = [...prev.customizations];
      const options = [...updated[cIndex].options, { label: "", price: 0 }];
      updated[cIndex] = { ...updated[cIndex], options };
      return { ...prev, customizations: updated };
    });
  };

  const removeOption = (cIndex, oIndex) => {
    setForm((prev) => {
      const updated = [...prev.customizations];
      const options = [...updated[cIndex].options];
      options.splice(oIndex, 1);
      updated[cIndex] = { ...updated[cIndex], options };
      return { ...prev, customizations: updated };
    });
  };

  // Upload image helper
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

  // save product
  const handleSubmit = async () => {
    // Validation
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.category) return toast.error("Category is required");

    // Subcategory validation
    const selectedCategory = categories.find(c => c._id === form.category);
    if (selectedCategory?.subcategories?.length > 0 && !form.subcategory) {
      return toast.error("Subcategory is required for this category");
    }
    if (!form.basePrice) return toast.error("Base price is required");
    if (isNaN(form.basePrice) || Number(form.basePrice) < 0) return toast.error("Base price must be a positive number");

    // Description validation
    if (!form.description || form.description === "<p></p>") return toast.error("Description is required");

    // Image validation
    if (!form.thumbnail) return toast.error("Thumbnail image is required");
    if (form.images.length === 0) return toast.error("At least one additional image is required");
    if (form.images.length > 6) return toast.error("Maximum 6 additional images allowed");

    // Customization validation
    for (const cust of form.customizations) {
      if (!cust.label.trim()) return toast.error("All customizations must have a label");
      if (cust.options.length === 0) {
        return toast.error(`Please add at least one option for customization: ${cust.label || 'Unnamed'}`);
      }
      for (const opt of cust.options) {
        if (!opt.label.trim()) return toast.error("All customization options must have a label");
      }
    }

    const payload = {
      ...form,
      description: form.description,
      basePrice: Number(form.basePrice),
      discount: Number(form.discount) || 0,
    };

    try {
      if (editingId) {
        await fetch(`/api/product/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Product updated successfully");
      } else {
        await fetch("/api/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Product created successfully");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  // delete
  const handleDelete = async (id) => {
    setUserId(id);
    setShowConfirmModal(true);
  }
  const confirmDelete = async () => {
    try {
      await fetch(`/api/product/${userId}`, { method: "DELETE" });
      fetchProducts();
      setMobileMenuOpen(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setUserId(null);
  };

  // edit
  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      basePrice: product.basePrice || "",
      discount: product.discount || 0,
      thumbnail: product.thumbnail || "",
      images: product.images || [],
      category: product.category?._id || "",
      subcategory: product.subcategory || "",
      customizations: product.customizations || [],
    });
    setShowForm(true);
    setMobileMenuOpen(null);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // Mobile product card view
  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-xl border border-orange-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {product.thumbnail && (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-14 h-14 object-cover rounded-lg border border-orange-200 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {product.name}
            </h3>
            <div className="text-xs text-gray-500 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: product.description || "No description" }} />
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-orange-100 text-[#de5422] px-2 py-1 rounded-full text-xs">
                <Tag className="w-3 h-3" />
                {product.category?.name || "Uncategorized"}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(mobileMenuOpen === product._id ? null : product._id);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen === product._id && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
              <button
                onClick={() => handleEdit(product)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(product._id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-orange-100">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-bold text-green-600 text-sm">${product.basePrice}</span>
          {product.discount > 0 && (
            <span className="text-xs text-red-600 line-through">
              -{product.discount}%
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {product.customizations?.length || 0} customization(s)
        </span>
      </div>
    </div>
  );

  const selectedCategory = categories.find(c => c._id === form.category);
  const hasSubcategories = selectedCategory?.subcategories?.length > 0;

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#de5422] mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <Package className="w-6 h-6 sm:w-8 sm:h-8" />
            Product Manager
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your product catalog and inventory</p>
        </div>

        {/* Search and Add Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search products by name..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm sm:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Add Product Button */}
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="flex items-center gap-2 bg-[#de5422] hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Product
            </button>
          </div>
        </div>

        {/* Products - Mobile Card View */}
        <div className="block sm:hidden">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#de5422] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading products...</p>
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border border-orange-200">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-base font-semibold text-gray-600 mb-1">No Products Found</h3>
              <p className="text-gray-500 text-sm">
                {search ? "Try adjusting your search terms" : "Get started by adding your first product"}
              </p>
            </div>
          )}
        </div>

        {/* Products - Desktop Table View */}
        <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#de5422] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-[#de5422]">Product</th>
                    <th className="p-4 text-left text-sm font-semibold text-[#de5422]">Price</th>
                    <th className="p-4 text-left text-sm font-semibold text-[#de5422]">Category</th>
                    <th className="p-4 text-left text-sm font-semibold text-[#de5422]">Customizations</th>
                    <th className="p-4 text-left text-sm font-semibold text-[#de5422]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr
                      key={product._id}
                      className="border-b border-orange-100 hover:bg-orange-50 transition-colors duration-200"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.thumbnail && (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg border border-orange-200"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              <div className="text-sm text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: product.description || "No description" }} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-600">${product.basePrice}</span>
                          {product.discount > 0 && (
                            <span className="text-sm text-red-600 line-through">
                              -{product.discount}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-[#de5422] px-2 py-1 rounded-full text-sm">
                          <Tag className="w-3 h-3" />
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600">
                          {product.customizations?.length || 0} customization(s)
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Products Found</h3>
              <p className="text-gray-500">
                {search ? "Try adjusting your search terms" : "Get started by adding your first product"}
              </p>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl border border-orange-200 max-h-[95vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-orange-200 bg-white z-10 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-[#de5422] rounded-lg">
                    {editingId ? <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#de5422]">
                      {editingId ? "Edit Product" : "Add New Product"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {editingId ? "Update product details" : "Fill in the product information"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                {/* Basic Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold text-[#de5422] flex items-center gap-2">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                    Basic Information
                  </h4>

                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter product name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm sm:text-base"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {hasSubcategories && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Subcategory *
                        </label>
                        <select
                          name="subcategory"
                          value={form.subcategory}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm sm:text-base"
                          disabled={!form.category}
                          required
                        >
                          <option value="">Select Subcategory</option>
                          {categories.find(c => c._id === form.category)?.subcategories?.map((sub, idx) => (
                            <option key={idx} value={sub.name}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>


                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Base Price *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          name="basePrice"
                          placeholder="0.00"
                          value={form.basePrice}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Discount (%)
                      </label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          name="discount"
                          placeholder="0"
                          value={form.discount}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Description *
                    </label>
                    <TiptapEditor
                      content={form.description}
                      onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                      onUpload={async (file) => {
                        try {
                          const url = await uploadImage(file);
                          return url;
                        } catch (error) {
                          console.error("Editor upload failed:", error);
                          throw error;
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold text-[#de5422] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Product Images
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Thumbnail Image *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        type="text"
                        name="thumbnail"
                        placeholder="Image URL or upload below"
                        value={form.thumbnail}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm sm:text-base"
                        required
                      />
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          required
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              setUploading(true);
                              try {
                                const url = await uploadImage(e.target.files[0]);
                                setForm((prev) => ({ ...prev, thumbnail: url }));
                              } catch (error) {
                                console.error("Upload failed:", error);
                              }
                              setUploading(false);
                            }
                          }}
                        />
                        <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                          {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          <span className="text-sm font-medium">Upload</span>
                        </div>
                      </label>
                    </div>
                    {form.thumbnail && (
                      <img
                        src={form.thumbnail}
                        alt="Thumbnail preview"
                        className="mt-2 w-20 h-20 object-cover rounded-lg border border-gray-300"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Additional Images * (min 1 and max 6 images)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                        type="text"
                        required
                        min={1}
                        max={6}
                        placeholder="Enter image URLs separated by commas"
                        value={form.images.join(", ")}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            images: e.target.value.split(",").map((url) => url.trim()).filter(Boolean),
                          }))
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-sm sm:text-base"
                      />
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files) {
                              setUploadingImages(true);
                              try {
                                const urls = await Promise.all(
                                  Array.from(e.target.files).map((file) => uploadImage(file))
                                );
                                setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
                              } catch (error) {
                                console.error("Upload failed:", error);
                              }
                              setUploadingImages(false);
                            }
                          }}
                        />
                        <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                          {uploadingImages ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          <span className="text-sm font-medium">Upload</span>
                        </div>
                      </label>
                    </div>
                    {form.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img}
                              alt={`Image ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== idx),
                                }))
                              }
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Customizations Section */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-semibold text-[#de5422] flex items-center gap-2">
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                      Product Customizations
                    </h4>
                    <button
                      type="button"
                      onClick={addCustomization}
                      className="flex items-center gap-1 sm:gap-2 bg-[#de5422] hover:bg-orange-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Add Customization
                    </button>
                  </div>

                  {form.customizations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      No customizations added yet. Click "Add Customization" to get started.
                    </p>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {form.customizations.map((customization, cIndex) => (
                        <div
                          key={cIndex}
                          className="border border-gray-300 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-gray-700 text-sm sm:text-base">
                              Customization {cIndex + 1}
                            </h5>
                            <button
                              type="button"
                              onClick={() => removeCustomization(cIndex)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Type *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., color, size"
                                required
                                value={customization.type}
                                onChange={(e) =>
                                  handleCustomizationChange(cIndex, "type", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-xs sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Label *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Choose Color"
                                required
                                value={customization.label}
                                onChange={(e) =>
                                  handleCustomizationChange(cIndex, "label", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-xs sm:text-sm"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={customization.required}
                              onChange={(e) =>
                                handleCustomizationChange(cIndex, "required", e.target.checked)
                              }
                              className="w-4 h-4 text-[#de5422] border-gray-300 rounded focus:ring-[#de5422]"
                            />
                            <label className="text-xs sm:text-sm text-gray-700">Required</label>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs sm:text-sm font-medium text-gray-700">
                                Options
                              </label>
                              <button
                                type="button"
                                onClick={() => addOption(cIndex)}
                                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                <Plus className="w-3 h-3" />
                                Add Option
                              </button>
                            </div>

                            {customization.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  placeholder="Option label"
                                  value={option.label}
                                  onChange={(e) =>
                                    handleOptionChange(cIndex, oIndex, "label", e.target.value)
                                  }
                                  className="flex-1 border border-gray-300 rounded px-2 sm:px-3 py-1.5 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-xs sm:text-sm"
                                />
                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={option.price}
                                  onChange={(e) =>
                                    handleOptionChange(cIndex, oIndex, "price", Number(e.target.value))
                                  }
                                  className="w-20 sm:w-24 border border-gray-300 rounded px-2 sm:px-3 py-1.5 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300 text-xs sm:text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(cIndex, oIndex)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-[#de5422] hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Confirm Delete Modal */}
      <ConfirmModal
        show={showConfirmModal}
        message="Are you sure you want to delete this product?"
        onYes={confirmDelete}
        onNo={cancelDelete}
      />
    </div>
  );
}