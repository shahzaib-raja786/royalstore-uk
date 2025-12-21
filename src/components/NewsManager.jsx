"use client";

import { useState, useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import ConfirmModal from "./ConfirmModal";
import toast from "react-hot-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import {
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Plus,
  Upload,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  X
} from "lucide-react";

export default function NewsManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    image: "",
    tags: "",
    category: "",
    status: "draft",
  });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);


  // ✅ ensure client only
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Tiptap Editor Instance
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link, Image],
    content: form.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, content: editor.getHTML() }));
    },
  });

  // ✅ Fetch News
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news/admin", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setBlogs(data.news || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Input
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data) {
        setForm({ ...form, image: data.url });
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Upload failed: " + data.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Save News (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `/api/news/admin/${editingId}`
        : "/api/news/admin";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "News updated successfully!" : "News created successfully!");
        resetForm();
        fetchNews();
      } else {
        toast.error(data.error || "Error saving news");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save news");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Edit News
  const handleEdit = (news) => {
    setForm({
      title: news.title,
      slug: news.slug,
      content: news.content,
      image: news.image,
      tags: news.tags.join(", "),
      category: news.category,
      status: news.status,
    });
    setEditingId(news._id);
    editor?.commands.setContent(news.content);
  };

  // ✅ Delete News
  const handleDelete = (id) => {
    setBlogToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      const res = await fetch(`/api/news/admin/${blogToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("News deleted successfully!");
        fetchNews();
      } else {
        toast.error("Error deleting news");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete news");
    } finally {
      setDeleteModalOpen(false);
      setBlogToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setBlogToDelete(null);
  };

  // ✅ Publish / Unpublish News
  const togglePublish = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/news/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus === "draft" ? "published" : "draft",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          `News ${currentStatus === "draft" ? "published" : "unpublished"} successfully!`
        );
        fetchNews();
      } else {
        toast.error("Error updating status");
      }
    } catch (err) {
      console.error("Publish error:", err);
      toast.error("Failed to update news status");
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      content: "",
      image: "",
      tags: "",
      category: "",
      status: "draft",
    });
    setEditingId(null);
    editor?.commands.clearContent();
  };

  // ✅ Filtered news
  const filteredBlogs = blogs.filter(news => {
    const matchesSearch = news.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || news.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Toolbar Buttons
  const Toolbar = () => {
    if (!editor) return null;

    const buttonClass = "p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2";
    const activeButtonClass = "p-2 rounded-lg border border-[#de5422] bg-orange-50 text-[#de5422] transition-colors duration-200 flex items-center gap-2";

    return (
      <div className="flex flex-wrap gap-2 border border-gray-300 p-4 mb-4 rounded-xl bg-white shadow-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? activeButtonClass : buttonClass}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? activeButtonClass : buttonClass}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? activeButtonClass : buttonClass}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-300 h-8"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? activeButtonClass : buttonClass}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? activeButtonClass : buttonClass}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-300 h-8"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? activeButtonClass : buttonClass}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? activeButtonClass : buttonClass}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? activeButtonClass : buttonClass}
        >
          <Quote className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-300 h-8"></div>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          className={buttonClass}
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter link URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={editor.isActive('link') ? activeButtonClass : buttonClass}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (!mounted) return null; // ✅ avoid SSR mismatch

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#de5422] mb-2">News Manager</h1>
          <p className="text-gray-600">Create and manage your news posts</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* News Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#de5422]">
                  {editingId ? "Edit News Post" : "Create New News Post"}
                </h2>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel Edit
                  </button>
                )}
              </div>

              {/* News Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter news title"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      placeholder="news-post-slug"
                      value={form.slug}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Tiptap Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <Toolbar />
                  <div className="border border-gray-300 rounded-xl min-h-[500px] p-4 focus-within:ring-2 focus-within:ring-[#de5422] focus-within:border-transparent outline-none transition duration-300 bg-white">
                    <EditorContent
                      editor={editor}
                      className="prose prose-sm sm:prose-base max-w-none min-h-[450px] outline-none [&_.ProseMirror]:min-h-[450px] [&_.ProseMirror]:outline-none"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-[#de5422] text-white px-4 py-3 rounded-xl cursor-pointer hover:bg-orange-700 transition-colors duration-300">
                      <Upload className="w-4 h-4" />
                      {uploading ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    {form.image && (
                      <div className="relative">
                        <img
                          src={form.image}
                          alt="preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: "" })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      placeholder="tech, web, development"
                      value={form.tags}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      placeholder="Technology"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-[#de5422] text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update News" : "Create News")}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* News List Section */}
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search News
                  </label>
                  <input
                    type="text"
                    placeholder="Search by title or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#de5422] focus:border-transparent outline-none transition duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>

            {/* News List */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#de5422]">
                  All News Posts
                </h3>
                <span className="bg-orange-100 text-[#de5422] px-3 py-1 rounded-full text-sm font-medium">
                  {filteredBlogs.length} posts
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#de5422]"></div>
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Edit3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No news posts found</p>
                  {searchTerm || statusFilter !== "all" ? (
                    <p className="text-sm mt-2">Try adjusting your search or filters</p>
                  ) : (
                    <p className="text-sm mt-2">Create your first news post to get started</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#de5422]/70 scrollbar-track-transparent">
                  {filteredBlogs.map((news) => (
                    <div
                      key={news._id}
                      className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{news.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${news.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {news.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span>Category: {news.category || "Uncategorized"}</span>
                            <span>•</span>
                            <span>{news.tags?.length || 0} tags</span>
                          </div>
                          {news.image && (
                            <img
                              src={news.image}
                              alt={news.title}
                              className="w-16 h-12 object-cover rounded-lg border border-gray-300"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(news)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => togglePublish(news._id, news.status)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${news.status === 'draft'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-yellow-600 hover:bg-yellow-50'
                              }`}
                            title={news.status === 'draft' ? 'Publish' : 'Unpublish'}
                          >
                            {news.status === 'draft' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(news._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        show={deleteModalOpen}
        message="Are you sure you want to delete this news?"
        onYes={confirmDelete}
        onNo={cancelDelete}
      />
    </div>
  );
}