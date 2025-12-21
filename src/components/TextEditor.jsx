"use client";
import React, { useState, useRef } from "react";
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from "draft-js";
import "draft-js/dist/Draft.css";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Palette,
  Highlighter
} from "lucide-react";

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [editorState, setEditorState] = useState(() => {
    if (value) {
      try {
        const content = convertFromRaw(value);
        return EditorState.createWithContent(content);
      } catch {
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  const handleChange = (state) => {
    setEditorState(state);
    if (onChange) {
      const contentState = state.getCurrentContent();
      const raw = convertToRaw(contentState);
      onChange(raw);
    }
  };

  const handleKeyCommand = (command, state) => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (newState) {
      handleChange(newState);
      return "handled";
    }
    return "not-handled";
  };

  const toggleInlineStyle = (inlineStyle) => {
    handleChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const toggleBlockType = (blockType) => {
    handleChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  // Check if current block type is active
  const isBlockActive = (blockType) => {
    const selection = editorState.getSelection();
    const block = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey());
    return block.getType() === blockType;
  };

  // Check if inline style is active
  const isInlineActive = (inlineStyle) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    return currentStyle.has(inlineStyle);
  };

  // Undo and Redo functionality
  const undo = () => {
    handleChange(EditorState.undo(editorState));
  };

  const redo = () => {
    handleChange(EditorState.redo(editorState));
  };

  const canUndo = editorState.getUndoStack().size > 0;
  const canRedo = editorState.getRedoStack().size > 0;

  return (
    <div className="border border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 mr-2 border-r border-gray-300 pr-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-lg transition-all duration-200 ${
              canUndo
                ? "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
                : "text-gray-400 cursor-not-allowed"
            }`}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-lg transition-all duration-200 ${
              canRedo
                ? "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
                : "text-gray-400 cursor-not-allowed"
            }`}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => toggleBlockType("header-one")}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-1 ${
              isBlockActive("header-one")
                ? "bg-[#de5422] text-white shadow-sm"
                : "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleBlockType("header-two")}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-1 ${
              isBlockActive("header-two")
                ? "bg-[#de5422] text-white shadow-sm"
                : "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
        </div>

        {/* Text Styles */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => toggleInlineStyle("BOLD")}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isInlineActive("BOLD")
                ? "bg-[#de5422] text-white shadow-sm"
                : "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleInlineStyle("ITALIC")}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isInlineActive("ITALIC")
                ? "bg-[#de5422] text-white shadow-sm"
                : "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleInlineStyle("UNDERLINE")}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isInlineActive("UNDERLINE")
                ? "bg-[#de5422] text-white shadow-sm"
                : "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
            }`}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => toggleBlockType("unordered-list-item")}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isBlockActive("unordered-list-item")
                ? "bg-[#de5422] text-white shadow-sm"
                : "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleBlockType("ordered-list-item")}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isBlockActive("ordered-list-item")
                ? "bg-[#de5422] text-white shadow-sm"
                : "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Block Elements */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleBlockType("blockquote")}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isBlockActive("blockquote")
                ? "bg-[#de5422] text-white shadow-sm"
                : "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleBlockType("code-block")}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isBlockActive("code-block")
                ? "bg-[#de5422] text-white shadow-sm"
                : "text-gray-700 hover:bg-white hover:shadow-sm hover:text-[#de5422]"
            }`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        className="min-h-[250px] p-4 focus:outline-none cursor-text bg-white"
        onClick={focusEditor}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={handleChange}
          handleKeyCommand={handleKeyCommand}
          placeholder="Start writing your content here..."
        />
      </div>

      {/* Character Count */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        {editorState.getCurrentContent().getPlainText().length} characters
      </div>
    </div>
  );
}