"use client";

import { useEffect, useState } from "react";
import parse from "html-react-parser";
import Image from "next/image";
import { use } from "react"; // 👈 yeh zaroori hai

export default function BlogDetails({ params }) {
  // ✅ unwrap params Promise
  const { id } = use(params);

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/news/admin/${id}`);
        if (!res.ok) throw new Error("Failed to fetch blog");
        const data = await res.json();
        setBlog(data.news);
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return <p className="text-center py-10">Loading news...</p>;
  }

  if (!blog) {
    return <p className="text-center py-10">News not found.</p>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>

      <p className="text-gray-500 text-sm mb-6">
        {new Date(blog.createdAt).toLocaleDateString()} |{" "}
        <span className="capitalize">{blog.category}</span>
      </p>

      {blog.image && (
        <Image
          width={800}
          height={400}
          src={blog.image}
          alt={blog.title}
          className="w-full max-h-[400px] object-cover rounded-lg mb-6"
        />
      )}

      <div className="prose max-w-none">{parse(blog.content || "")}</div>

      {blog.tags?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold">Tags:</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {blog.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-gray-200 text-sm px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
