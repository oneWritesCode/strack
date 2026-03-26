"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import Heading from "@tiptap/extension-heading";
import { FontSize } from "@/app/extensions/FontSize";
import { ArrowLeft, BookOpen, Loader2, Lock, Eye, EyeOff, Save, Edit3, X, Check } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import classnames from "classnames";
import { useTheme } from "../context/ThemeContext";
import Link from "next/link";

interface PublicNoteViewerProps {
  note: any;
}

export default function PublicNoteViewer({ note }: PublicNoteViewerProps) {
  const [passwordInput, setPasswordInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const [isBookView, setIsBookView] = useState(note.bookView || false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Image.configure({ inline: false, allowBase64: true }),
      TextStyle,
      Highlight,
      FontSize,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
    ],
    content: note.contentHTML || note.contentJSON || "",
    editable: false,
    immediatelyRender: false,
  });

  const handleStartEditing = () => {
    if (!note.password) {
      setIsEditing(true);
      editor?.setEditable(true);
      return;
    }
    setShowPasswordModal(true);
  };

  const verifyPasswordAndUnlock = () => {
    if (passwordInput === note.password) {
      setIsEditing(true);
      editor?.setEditable(true);
      setShowPasswordModal(false);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // const handleSavePublicly = async () => {
  //   if (!editor) return;
  //   setIsSaving(true);
  //   try {
  //     const res = await fetch(`/api/notes/public-note/${note.id}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         content: editor.getText(),
  //         contentHTML: editor.getHTML(),
  //         contentJSON: JSON.stringify(editor.getJSON()),
  //         password: passwordInput, // Send password to verify update
  //       }),
  //     });

  //     if (res.ok) {
  //       setSaveSuccess(true);
  //       setIsEditing(false);
  //       editor?.setEditable(false);
  //       setTimeout(() => setSaveSuccess(false), 3000);
  //     } else {
  //       const d = await res.json();
  //       alert(d.error || "Failed to save changes");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error saving note");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const updatePagination = useCallback(() => {
    if (!isBookView || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cw = container.clientWidth;
    setPageWidth(cw);
    
    requestAnimationFrame(() => {
      const sw = container.scrollWidth;
      const sl = container.scrollLeft;
      const pages = Math.max(1, Math.round(sw / cw));
      setTotalPages(pages);
      setCurrentPage(Math.min(pages, Math.round(sl / cw) + 1));
    });
  }, [isBookView]);

  useEffect(() => {
    if (!isBookView) return;
    const t = setTimeout(updatePagination, 100);
    return () => clearTimeout(t);
  }, [isBookView, updatePagination]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !pageWidth) return;
    const sl = scrollContainerRef.current.scrollLeft;
    setCurrentPage(Math.round(sl / pageWidth) + 1);
  }, [pageWidth]);

  const goToPage = (page: number) => {
    if (!scrollContainerRef.current || !pageWidth) return;
    const target = (page - 1) * pageWidth;
    scrollContainerRef.current.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <div className="w-full relative bg-(--background-color) min-h-screen flex flex-col overflow-hidden font-bubblegum">
      <div className="w-full fixed top-0 left-0 bg-(--background-color) shadow-xl p-4 flex items-center justify-between z-50">
        <Link href="/" className="flex items-center gap-2 font-bold hover:scale-105 transition-transform">
          <ArrowLeft size={20} />
          <span className="md:block hidden">Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-(--text-color)/5 rounded-xl border border-(--text-color)/10 text-xs font-bold uppercase tracking-widest opacity-70">
            {isEditing ? <Edit3 size={14} className="text-orange-500" /> : <Lock size={14} />}
            <span>{isEditing ? "Editing Mode" : "Public View Only"}</span>
          </div>
          
          {/* {isEditing ? (
            <button 
              onClick={handleSavePublicly}
              disabled={isSaving}
              className="bg-(--text-color) text-(--background-color) px-4 py-1.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all cursor-pointer shadow-lg"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <button 
              onClick={handleStartEditing}
              className="bg-(--text-color) text-(--background-color) px-4 py-1.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
            >
              <Edit3 size={16} />
              Edit Note
            </button>
          )} */}
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 pt-24 md:pt-32">
        <h1 className="text-4xl md:text-6xl font-black mb-8 uppercase flex items-center justify-between gap-4 text-(--text-color)">
          <span className="border-b-8 border-(--text-color)/10 pb-2"> {note.title}</span>
          {isBookView && (
            <span className="text-sm font-bold bg-(--text-color)/5 px-3 py-1 rounded-full opacity-60">
              {currentPage} / {totalPages}
            </span>
          )}
        </h1>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={classnames(
            "editorContent prose prose-sm md:prose-lg max-w-none pt-6 text-(--text-color)",
            {
              "min-h-[60vh] pb-32": !isBookView,
              "h-[65vh] overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]:hidden": isBookView,
              "cursor-text": isEditing,
              "cursor-default": !isEditing
            }
          )}
          style={isBookView && pageWidth ? { scrollSnapType: "x mandatory" } : undefined}
        >
          <div
            style={isBookView ? {
              height: "100%",
              columnWidth: `${pageWidth || 100}px`,
              columnGap: "0px",
              columnFill: "auto" as const,
            } : undefined}
            className={classnames(isBookView ? "[&>*]:break-inside-avoid" : "")}
          >
            <EditorContent editor={editor} className="outline-none border-none text-lg h-full" />
          </div>
        </div>

        {isBookView && (
          <div className="flex justify-between items-center py-6 mt-8 border-t-2 border-(--text-color)/5">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-6 py-2 font-black text-sm uppercase rounded-xl disabled:opacity-20 cursor-pointer hover:bg-(--text-color)/5 border-2 border-transparent active:scale-95 transition-all"
            >
              ← Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <div 
                  key={i} 
                  className={classnames("w-2 h-2 rounded-full transition-all duration-300", 
                    currentPage === i + 1 ? "bg-(--text-color) w-6" : "bg-(--text-color)/20")
                  }
                />
              ))}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-6 py-2 font-black text-sm uppercase rounded-xl disabled:opacity-20 cursor-pointer hover:bg-(--text-color)/5 border-2 border-transparent active:scale-95 transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>
      
      {/* Toast Success Notification */}
      {saveSuccess && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom duration-300">
           <div className="bg-green-500 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3">
             <Check size={20} />
             CHANGES SAVED SUCCESSFULLY!
           </div>
        </div>
      )}

      {/* Editing Status Badge */}
      {/* <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className={classnames(
          "px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 transition-colors duration-500",
          isEditing ? "bg-orange-500 text-white" : "bg-(--text-color) text-(--background-color)"
        )}>
          <div className={classnames("w-2 h-2 rounded-full animate-pulse", isEditing ? "bg-white" : "bg-green-500")} />
          {isEditing ? "EDITING MODE ACTIVE" : "VIEWING SHARED NOTE"}
        </div>
      </div> */}

      {/* Password Modal for Editing */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
          <div className="relative bg-(--background-color) border-4 border-(--text-color) p-8 rounded-3xl shadow-[12px_12px_0_0_rgba(0,0,0,0.1)] w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-(--text-color)/10 rounded-full transition-colors opacity-50 cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-orange-500/10 rounded-full">
                <Lock size={40} className="text-orange-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Edit Protected Note</h2>
            <p className="text-center opacity-70 mb-6 text-sm">Please enter the note's password to enable editing.</p>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Note Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && verifyPasswordAndUnlock()}
                  className={classnames(
                    "w-full bg-transparent border-2 rounded-2xl py-3 px-4 focus:outline-none transition-all font-medium",
                    passwordError ? "border-red-500" : "border-(--text-color)"
                  )}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs text-center font-bold">Incorrect password. Only authorized editors can modify this note.</p>
              )}
              <button
                onClick={verifyPasswordAndUnlock}
                className="w-full bg-orange-500 text-white py-3 rounded-2xl font-bold uppercase hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer"
              >
                Unlock & Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
