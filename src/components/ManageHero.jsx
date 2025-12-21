"use client";
import { useEffect, useState } from "react";
import { Upload, Trash2, Image as ImageIcon, Plus, Loader, X } from "lucide-react";

export default function HeroImageManager() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch all images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hero");
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Add Image
  const addImage = async () => {
    if (!file) {
      alert("Please select an image!");
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload to /api/upload
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.url) {
        alert("Image upload failed");
        setUploading(false);
        return;
      }

      // Step 2: Save URL in Hero DB
      await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadData.url }),
      });

      setFile(null);
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      fetchImages();
      alert("Hero image added successfully! ✅");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while uploading the image!");
    }
    setUploading(false);
  };

  // Delete Image
  const deleteImage = async (id) => {
    try {
      await fetch(`/api/hero/${id}`, { method: "DELETE" });
      fetchImages();
      alert("Hero image deleted successfully! 🗑️");
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
    }
    setDeleteConfirm(null);
  };

  const openDeleteConfirm = (img) => {
    setDeleteConfirm(img);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm(null);
  };

  // Mobile image card component
  const ImageCard = ({ img }) => (
    <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={img.imageUrl}
          alt="Hero slider"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300" />
      </div>

      {/* Image Info */}
      <div className="p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-600 truncate">
          {img.imageUrl.split('/').pop()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Added: {new Date(img.createdAt || Date.now()).toLocaleDateString()}
        </p>
      </div>

      {/* Delete Button - Always visible on mobile, hover on desktop */}
      <button
        onClick={() => openDeleteConfirm(img)}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg"
        title="Delete image"
      >
        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen  p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#de5422] mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            Hero Image Manager
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage the hero images displayed on your homepage</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#de5422] mb-3 sm:mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Hero Image
          </h2>

          <div className="flex flex-col gap-4">
            {/* File Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="flex items-center gap-2 bg-[#de5422] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl cursor-pointer hover:bg-orange-700 transition-colors duration-300 font-semibold text-sm sm:text-base w-full sm:w-auto justify-center">
                  <Upload className="w-4 h-4" />
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {file && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200 w-full sm:w-auto">
                    <span className="bg-green-500 text-white p-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="truncate flex-1">{file.name}</span>
                    <button
                      onClick={() => setFile(null)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPG, PNG, WEBP. Recommended size: 1920x750px
              </p>
            </div>

            {/* Upload Button */}
            <button
              onClick={addImage}
              disabled={!file || uploading}
              className="bg-[#de5422] hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-600 disabled:bg-gray-400 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2 justify-center text-sm sm:text-base"
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Image
                </>
              )}
            </button>
          </div>
        </div>

        {/* Images Grid */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#de5422] flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Current Hero Images
              <span className="bg-orange-100 text-[#de5422] px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                {images.length} images
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#de5422] border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading images...</p>
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🖼️</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Hero Images</h3>
              <p className="text-gray-500 text-sm sm:text-base">Upload your first hero image to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {images.map((img) => (
                <div key={img._id} className="group">
                  <ImageCard img={img} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md border border-orange-200 mx-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#de5422]">Delete Hero Image</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <img
                    src={deleteConfirm.imageUrl}
                    alt="To be deleted"
                    className="w-full h-28 sm:h-32 object-cover rounded-lg mb-3"
                  />
                  <p className="text-sm text-gray-600 text-center">
                    Are you sure you want to delete this hero image?
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={closeDeleteConfirm}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-300 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteImage(deleteConfirm._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Image
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