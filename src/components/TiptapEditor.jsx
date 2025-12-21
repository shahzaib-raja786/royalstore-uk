"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
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
    Loader,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";



const Toolbar = ({ editor, onUpload }) => {
    if (!editor) return null;
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const buttonClass =
        "p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2";
    const activeButtonClass =
        "p-2 rounded-lg border border-[#de5422] bg-orange-50 text-[#de5422] transition-colors duration-200 flex items-center gap-2";

    const handleImageClick = () => {
        if (onUpload) {
            fileInputRef.current?.click();
        } else {
            const url = prompt("Enter image URL:");
            if (url) editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !onUpload) return;

        setIsUploading(true);
        try {
            const url = await onUpload(file);
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            }
        } catch (error) {
            console.error("Failed to upload image:", error);
            // Optionally show toast here if we had access to it, 
            // but keeping it simple for now or let parent handle error reporting if throwing.
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-wrap gap-2 border border-gray-300 p-4 mb-4 rounded-xl bg-white shadow-sm">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? activeButtonClass : buttonClass}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? activeButtonClass : buttonClass}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive("underline") ? activeButtonClass : buttonClass}
                title="Underline"
            >
                <UnderlineIcon className="w-4 h-4" />
            </button>
            <div className="w-px bg-gray-300 h-8"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={
                    editor.isActive("heading", { level: 1 }) ? activeButtonClass : buttonClass
                }
                title="Heading 1"
            >
                <Heading1 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={
                    editor.isActive("heading", { level: 2 }) ? activeButtonClass : buttonClass
                }
                title="Heading 2"
            >
                <Heading2 className="w-4 h-4" />
            </button>
            <div className="w-px bg-gray-300 h-8"></div>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={
                    editor.isActive("bulletList") ? activeButtonClass : buttonClass
                }
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={
                    editor.isActive("orderedList") ? activeButtonClass : buttonClass
                }
                title="Ordered List"
            >
                <ListOrdered className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={
                    editor.isActive("blockquote") ? activeButtonClass : buttonClass
                }
                title="Quote"
            >
                <Quote className="w-4 h-4" />
            </button>
            <div className="w-px bg-gray-300 h-8"></div>
            <button
                type="button"
                onClick={handleImageClick}
                className={buttonClass}
                title={onUpload ? "Upload Image" : "Insert Image URL"}
                disabled={isUploading}
            >
                {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            </button>
            <button
                type="button"
                onClick={() => {
                    const url = prompt("Enter link URL:");
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                }}
                className={editor.isActive("link") ? activeButtonClass : buttonClass}
                title="Insert Link"
            >
                <LinkIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function TiptapEditor({ content, onChange, onUpload, className = "" }) {
    const editor = useEditor({
        extensions: [StarterKit, Underline, Link, Image],
        content: content || "",
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose-base max-w-none min-h-[250px] p-4 focus:outline-none ${className}`,
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    // Handle external content updates
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only set content if it's materially different to avoid cursor jumps
            // For simple cases, checking if empty might be enough, but mostly
            // we trust parent updates or initial load.
            // However, Tiptap is controlled by local state mostly.
            // If we want it fully controlled, we need better diffing.
            // For this use case (Product form), we usually load once.
            if (editor.isEmpty && content) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    return (
        <div className="border border-gray-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-[#de5422] focus-within:border-transparent transition-all duration-300">
            <div className="border-b border-gray-200">
                <Toolbar editor={editor} onUpload={onUpload} />
            </div>
            <EditorContent editor={editor} className="min-h-[250px]" />
        </div>
    );
}
