"use client";

import { Trash2, MoreVertical } from "lucide-react";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEditor, EditorContent } from "@tiptap/react";
import Heading from "@tiptap/extension-heading";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { FontSize } from "@/app/extensions/FontSize";
import Image from "@tiptap/extension-image";
import {
  Redo,
  Undo,
  Loader2,
  ArrowLeft,
  BookOpen,
  X,
  Lock,
  Mail,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Share2,
  Check,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import classnames from "classnames";
import { useTheme } from "../context/ThemeContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_CARDS } from "../lib/constants";

interface NoteViewerProps {
  id: string;
}

export default function NoteViewer({ id }: NoteViewerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const { data: session } = useSession();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publicPassword, setPublicPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishInBookView, setPublishInBookView] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [showShared, setShowShared] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    {
      label: "At least 1 uppercase letter",
      test: (p: string) => /[A-Z]/.test(p),
    },
    {
      label: "At least 1 lowercase letter",
      test: (p: string) => /[a-z]/.test(p),
    },
    { label: "At least 1 number", test: (p: string) => /[0-9]/.test(p) },
    {
      label: "At least 1 special character",
      test: (p: string) => /[^A-Za-z0-9]/.test(p),
    },
  ];

  const isPasswordValid = passwordRules.every((rule) =>
    rule.test(publicPassword),
  );

  const storageKey = `extra_card_${id}`;
  const bookViewKey = `bookview_${id}`;

  // Load book view preference from localStorage
  const [isBookView, setIsBookView] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(bookViewKey) === "true";
    }
    return false;
  });

  // Persist book view preference
  const toggleBookView = useCallback(() => {
    setIsBookView((prev) => {
      const next = !prev;
      localStorage.setItem(bookViewKey, String(next));
      return next;
    });
    setCurrentPage(1);
  }, [bookViewKey]);

  const deleteCard = async () => {
    const savedCards = localStorage.getItem("skilltracker_cards");
    if (savedCards) {
      const cards = JSON.parse(savedCards);
      const updatedCards = cards.filter((card: any) => card.id !== id);
      localStorage.setItem("skilltracker_cards", JSON.stringify(updatedCards));
    }
    localStorage.removeItem(storageKey);
    localStorage.removeItem(bookViewKey);

    try {
      await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete card from database:", err);
    }

    router.push("/");
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDeleteBtn(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultContent = `
       <strong>start writing from here</strong>
       <br /><br /> <br />  <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br />
    `;

  const editor: any = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Image.configure({ inline: false, allowBase64: true }),
      TextStyle,
      Highlight,
      FontSize,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
    ],
    content: defaultContent,
    editorProps: {
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.includes("image"));
        if (imageItem) {
          const file = imageItem.getAsFile();
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result;
            editor
              ?.chain()
              .focus()
              .setImage({ src, width: "300px", height: "auto" })
              .run();
          };
          reader.readAsDataURL(file!);
          return true;
        }
        return false;
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setLastUpdateTrigger(Date.now());
    },
  });

  const [lastUpdateTrigger, setLastUpdateTrigger] = useState(0);

  // Measure the container width and calculate pages
  const updatePagination = useCallback(() => {
    if (!isBookView || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cw = container.clientWidth;
    setPageWidth(cw);

    // Wait a frame so scrollWidth reflects the column layout
    requestAnimationFrame(() => {
      const sw = container.scrollWidth;
      const sl = container.scrollLeft;
      const pages = Math.max(1, Math.round(sw / cw));
      setTotalPages(pages);
      setCurrentPage(Math.min(pages, Math.round(sl / cw) + 1));
    });
  }, [isBookView]);

  // Recalculate when book view toggles or content changes
  useEffect(() => {
    if (!isBookView) return;
    // Small delay to let CSS columns render
    const t = setTimeout(updatePagination, 100);
    return () => clearTimeout(t);
  }, [isBookView, lastUpdateTrigger, updatePagination]);

  // Recalculate on window resize
  useEffect(() => {
    if (!isBookView) return;
    const handleResize = () => updatePagination();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isBookView, updatePagination]);

  // Navigate to exact page position
  const goToPage = useCallback(
    (page: number) => {
      if (!scrollContainerRef.current || !pageWidth) return;
      const target = (page - 1) * pageWidth;
      scrollContainerRef.current.scrollTo({ left: target, behavior: "smooth" });
    },
    [pageWidth],
  );

  // moving pages on pressing arrow keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // onClick={() => goToPage(currentPage - 1)}
      if (event.key === "ArrowLeft") {
        goToPage(currentPage - 1);
      } else if (event.key === "ArrowRight") {
        goToPage(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentPage, goToPage]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !pageWidth) return;
    const sl = scrollContainerRef.current.scrollLeft;
    setCurrentPage(Math.round(sl / pageWidth) + 1);
  }, [pageWidth]);

  useEffect(() => {
    if (lastUpdateTrigger === 0 || !editor) return;
    const timer = setTimeout(() => saveToLocalStorage(), 1500);
    return () => clearTimeout(timer);
  }, [lastUpdateTrigger]);

  useEffect(() => {
    const savedCardsString = localStorage.getItem("skilltracker_cards");
    let cardTitleFromList = "";
    let defaultContentFromCard = "";

    if (savedCardsString) {
      const cards = JSON.parse(savedCardsString);
      const currentCard = cards.find((c: any) => c.id === id);
      if (currentCard) {
        cardTitleFromList = currentCard.title;
        defaultContentFromCard =
          currentCard.contentHTML || currentCard.content || "";
        if (currentCard.isPublic) {
          setIsPublished(true);
        }
      }
    }

    if (!cardTitleFromList) {
      const defaultCard = DEFAULT_CARDS.find((c) => c.id === id);
      if (defaultCard) {
        cardTitleFromList = defaultCard.title;
        defaultContentFromCard =
          defaultCard.contentHTML || defaultCard.content || "";
      }
    }

    setCardTitle(cardTitleFromList);

    // Sync from DB to ensure isPublished status is fresh
    fetch(`/api/notes/public-note/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.note) {
          if (data.note.isPublic) {
            setIsPublished(true);
            setPublishInBookView(data.note.bookView || false);
          }
          if (data.note.title && !cardTitleFromList) {
            setCardTitle(data.note.title);
          }
        }
        setIsCheckingStatus(false);
      })
      .catch((err) => {
        console.error("Error syncing note info:", err);
        setIsCheckingStatus(false);
      });

    if (editor) {
      const savedNoteData = localStorage.getItem(storageKey);
      if (savedNoteData) {
        try {
          const { content } = JSON.parse(savedNoteData);
          if (content) {
            editor.commands.setContent(content);
            return;
          }
        } catch (e) {
          console.error("Error loading note content from localStorage", e);
        }
      }

      if (defaultContentFromCard) {
        editor.commands.setContent(defaultContentFromCard);
      } else {
        editor.commands.setContent(defaultContent);
      }
    }
  }, [id, editor, storageKey, defaultContent]);

  const saveToLocalStorage = () => {
    if (!editor) return;
    setIsLoading(true);

    const contentJSON = editor.getJSON();
    const contentHTML = editor.getHTML();
    const contentText = editor.getText();

    const data = {
      content: contentJSON,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));

    const savedCardsString = localStorage.getItem("skilltracker_cards");
    if (savedCardsString) {
      const cards = JSON.parse(savedCardsString);
      const updatedCards = cards.map((card: any) => {
        if (card.id === id) {
          return {
            ...card,
            content: contentText,
            contentHTML: contentHTML,
          };
        }
        return card;
      });
      localStorage.setItem("skilltracker_cards", JSON.stringify(updatedCards));
    }

    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  const makeNotePublic = async () => {
    if (!editor) return;
    setIsPublishing(true);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: cardTitle || id,
          content: editor.getText(),
          contentHTML: editor.getHTML(),
          contentJSON: JSON.stringify(editor.getJSON()),
          isPublic: true,
          password: publicPassword,
          bookView: publishInBookView,
        }),
      });

      if (res.ok) {
        const savedCardsString = localStorage.getItem("skilltracker_cards");
        if (savedCardsString) {
          const cards = JSON.parse(savedCardsString);
          const updatedCards = cards.map((card: any) => {
            if (card.id === id) {
              return { ...card, isPublic: true };
            }
            return card;
          });
          localStorage.setItem(
            "skilltracker_cards",
            JSON.stringify(updatedCards),
          );
        }

        setShowPublishModal(false);
        setPublicPassword("");
        setShowSuccess(true);
        setIsPublished(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.error("Failed to publish");
      }
    } catch (error) {
      console.error("Error publishing note:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/public-note/${id}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShowShared(true);
        setTimeout(() => setShowShared(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="w-full relative bg-(--background-color) min-h-screen flex flex-col overflow-hidden font-bubblegum">
      {/* Toolbar */}
      <div className="w-full fixed bg-(--background-color) shadow-xl shadow-(--background-color) p-2 md:pt-4 md:pb-2 flex items-center justify-between pt-2 md:pt-0 gap-3 px-2 md:px-4 text-(--text-color) z-10000">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold hover:scale-105 transition-transform"
        >
          <ArrowLeft size={20} />
          <span className="md:block hidden">Back</span>
        </Link>

        <div className="flex items-center md:gap-2">
          <div className="inline-flex items-center justify-center rounded-xl md:px-2 md:py-1">
            <button
              onClick={() => editor?.chain().focus().undo().run()}
              className="p-1 hover:bg-(--text-color)/10 rounded-full"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={() => editor?.chain().focus().redo().run()}
              className="p-1 hover:bg-(--text-color)/10 rounded-full"
            >
              <Redo size={18} />
            </button>
          </div>
          <div className="h-6 w-px bg-(--text-color)/20 mx-1" />
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className="px-2 font-bold hover:scale-105 cursor-pointer hover:bg-white/10 rounded-full transition-all"
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="strike"
            className="h-6 px-2 line-through rounded-md cursor-pointer hover:scale-105 hover:text-(--red-background) transition-all"
          >
            Strike
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className="px-2 italic hover:scale-105 cursor-pointer hover:bg-white/10 rounded-full transition-all"
          >
            I
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            className="px-2 hover:scale-105 cursor-pointer hover:bg-white/10 rounded-full transition-all"
          >
            Highlight
          </button>

          {/* More Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowDeleteBtn(!showDeleteBtn)}
              className="p-1 hover:bg-(--text-color)/10 rounded-full transition-colors cursor-pointer"
            >
              <MoreVertical size={20} />
            </button>
            {showDeleteBtn && (
              <div className="absolute top-5 md:top-8 right-2 md:right-4 mt-2 w-25 md:w-30 bg-(--background-color) border-2 border-(--text-color) rounded-lg shadow-xl z-[110] overflow-hidden">
                <div className="bg-(--text-color)/20 -1" />
                <button
                  onClick={toggleBookView}
                  title="Toggle Book View"
                  className={classnames(
                    "w-full pl-2 p-1 transition-colors cursor-pointer flex items-center gap-3 text-xs md:text-base",
                    isBookView
                      ? "bg-(--text-color) text-(--background-color)"
                      : "hover:bg-(--text-color)/10",
                  )}
                >
                  <BookOpen size={18} /> book mode
                </button>

                <button
                  onClick={deleteCard}
                  className="w-full flex items-center gap-3 pl-2 p-1 text-xs md:text-base hover:bg-[#D73535] hover:text-white transition-colors text-(--text-color)"
                >
                  <Trash2 size={18} />
                  Delete Card
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 pt-20 md:pt-26">
        <h1 className="text-4xl md:text-5xl font-bold md:mb-8 uppercase flex items-center gap-2 text-(--text-color)">
          <span className="border-b-4 border-black"> {cardTitle || id}</span>
          {isBookView && (
            <span className="text-sm opacity-70">
              Page {currentPage} / {totalPages}
            </span>
          )}
        </h1>

        {/* Book View Pagination Controls */}

        {/* Editor Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={classnames(
            "editorContent prose prose-sm md:prose-lg max-w-none border-t-2 border-black/10 pt-6 text-(--text-color)",
            {
              "min-h-[50vh] pb-32": !isBookView,
              "h-[65vh] overflow-x-auto overflow-y-hidden scroll-smooth [&::-webkit-scrollbar]:hidden":
                isBookView,
            },
          )}
          style={
            isBookView && pageWidth
              ? {
                  scrollSnapType: "x mandatory",
                }
              : undefined
          }
        >
          <div
            style={
              isBookView
                ? {
                    height: "100%",
                    columnWidth: `${pageWidth || 100}px`,
                    columnGap: "0px",
                    columnFill: "auto" as const,
                  }
                : undefined
            }
            className={isBookView ? "[&>*]:break-inside-avoid" : ""}
          >
            <EditorContent
              editor={editor}
              className="outline-none border-none cursor-text text-lg h-full"
            />
          </div>
        </div>

        {isBookView && (
          <div className="flex justify-between items-center py-2 px-3 mb-2 mt-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-1.5 font-bold text-sm rounded-md disabled:opacity-30 cursor-pointer hover:bg-(--text-color)/10 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-1.5 font-bold text-sm rounded-md disabled:opacity-30 cursor-pointer hover:bg-(--text-color)/10 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
          <button
            onClick={saveToLocalStorage}
            disabled={isLoading}
            className={classnames(
              "px-3 py-1 md:px-5 md:py-2 rounded-full font-bold uppercase transition-all flex items-center gap-2",
              "bg-(--text-color) text-(--background-color) border-2 border-(--text-color)",
              "shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
              {
                "shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]":
                  theme === "black",
              },
            )}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Saving..." : showSuccess ? "SAVED!" : "SAVE"}
          </button>

          {isCheckingStatus ? (
            <button
              disabled
              className={classnames(
                "px-3 py-1 md:px-5 md:py-2 rounded-full font-bold uppercase transition-all flex items-center gap-2",
                "bg-(--text-color)/50 text-(--background-color) border-2 border-(--text-color)/50",
                "shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]",
                {
                  "shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]":
                    theme === "black",
                },
              )}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking...
            </button>
          ) : isPublished ? (
            <button
              onClick={handleShare}
              className={classnames(
                "px-3 py-1 md:px-5 md:py-2 rounded-full font-bold uppercase transition-all flex items-center gap-2",
                "bg-(--text-color) text-(--background-color) border-2 border-(--text-color) cursor-pointer",
                "shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
                {
                  "shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]":
                    theme === "black",
                },
              )}
            >
              {showShared ? (
                <>
                  <Check className="text-(--background-color)" />
                  COPIED!
                </>
              ) : (
                <>
                  <Share2 className="text-(--background-color)" />
                  SHARE
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowPublishModal(true)}
              disabled={isPublishing}
              className={classnames(
                "px-3 py-1 md:px-5 md:py-2 rounded-full font-bold uppercase transition-all flex items-center gap-2",
                "bg-(--text-color) text-(--background-color) border-2 border-(--text-color) cursor-pointer",
                "shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
                {
                  "shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]":
                    theme === "black",
                },
              )}
            >
              {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPublishing ? "PUBLISHING..." : showSuccess ? "PUBLISHED!" : "PUBLISH"}
            </button>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPublishModal(false)}
          />

          <div className="relative bg-(--background-color) text-(--text-color) border-4 border-(--text-color) rounded-2xl md:rounded-3xl p-6 w-full max-w-md shadow-[12px_12px_0_0_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-(--text-color)/10 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Lock className="text-(--text-color)" />
              Make Note Public
            </h2>

            <p className="mb-4 opacity-80 text-sm">
              Protect your public note with a password. Share these credentials
              with others to grant them access.
            </p>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-bold mb-1 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                    size={18}
                  />
                  <input
                    type="email"
                    disabled
                    value={session?.user?.email || ""}
                    className="w-full bg-(--text-color)/5 border-2 border-(--text-color)/20 rounded-xl py-2 pl-10 pr-4 opacity-70 cursor-not-allowed font-medium"
                  />
                </div>
                <p className="text-xs mt-1 ml-1 opacity-60">
                  Your email will be visible to users.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter a secure password"
                    value={publicPassword}
                    onChange={(e) => setPublicPassword(e.target.value)}
                    className="w-full bg-transparent border-2 border-(--text-color) rounded-xl py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-(--text-color)/50 transition-all font-medium"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 p-3 bg-(--text-color)/2 rounded-xl border border-(--text-color)/10">
                  <p className="text-xs font-bold opacity-70 mb-2 uppercase tracking-wider">
                    Password Requirements:
                  </p>
                  {passwordRules.map((rule, idx) => {
                    const isValid = rule.test(publicPassword);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-1 text-sm"
                      >
                        {isValid ? (
                          <CheckCircle2 size={16} className="text-black" />
                        ) : (
                          <Circle size={16} className="opacity-30" />
                        )}
                        <span
                          className={classnames(
                            "transition-colors duration-200 leading-1 ",
                            isValid ? "opacity-100" : "opacity-50",
                          )}
                        >
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 ml-1">
                <input
                  type="checkbox"
                  id="bookViewCheck"
                  checked={publishInBookView}
                  onChange={(e) => setPublishInBookView(e.target.checked)}
                  className="w-4 h-4 -(--text-color) cursor-pointer"
                />
                <label
                  htmlFor="bookViewCheck"
                  className="text-sm font-bold cursor-pointer"
                >
                  Publish in Book View mode
                </label>
              </div>
            </div>

            <button
              onClick={makeNotePublic}
              disabled={!isPasswordValid || isPublishing}
              className="mt-8 w-full bg-(--text-color) text-(--background-color) border-2 border-(--text-color) py-3 rounded-xl font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Publishing...
                </>
              ) : (
                "Confirm & Publish"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
