"use client";

import { Trash2, MoreVertical } from "lucide-react";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEditor, EditorContent } from "@tiptap/react";
import Heading from "@tiptap/extension-heading";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { FontSize } from "@/app/extensions/FontSize";
import Image from "@tiptap/extension-image";
import { Redo, Undo, Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const storageKey = `extra_card_${id}`;

  const deleteCard = () => {
    const savedCards = localStorage.getItem("skilltracker_cards");
    if (savedCards) {
      const cards = JSON.parse(savedCards);
      const updatedCards = cards.filter((card: any) => card.id !== id);
      localStorage.setItem("skilltracker_cards", JSON.stringify(updatedCards));
    }
    localStorage.removeItem(storageKey);
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
       <strong>Write about ${id} here</strong>
       <br />
       <br />
       - Start Writing <br /> <br />  <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br />
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
  });

  useEffect(() => {
    // 1. Load card title from local cards list or fallback to DEFAULT_CARDS
    const savedCardsString = localStorage.getItem("skilltracker_cards");
    let cardTitleFromList = "";
    let defaultContentFromCard = "";

    if (savedCardsString) {
      const cards = JSON.parse(savedCardsString);
      const currentCard = cards.find((c: any) => c.id === id);
      if (currentCard) {
        cardTitleFromList = currentCard.title;
        // Prioritize contentHTML if it exists
        defaultContentFromCard =
          currentCard.contentHTML || currentCard.content || "";
      }
    }

    // If not found in localStorage cards, check DEFAULT_CARDS
    if (!cardTitleFromList) {
      const defaultCard = DEFAULT_CARDS.find((c) => c.id === id);
      if (defaultCard) {
        cardTitleFromList = defaultCard.title;
        defaultContentFromCard =
          defaultCard.contentHTML || defaultCard.content || "";
      }
    }

    setCardTitle(cardTitleFromList);

    // 2. Load editor content
    if (editor) {
      // Priority 1: Specific saved content for this note
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
    const contentText = editor.getText(); // Plain text for previews

    // Update specific note data
    const data = {
      content: contentJSON,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));

    // Update the card in the main cards list for previews
    const savedCardsString = localStorage.getItem("skilltracker_cards");
    if (savedCardsString) {
      const cards = JSON.parse(savedCardsString);
      const updatedCards = cards.map((card: any) => {
        if (card.id === id) {
          return {
            ...card,
            content: contentText, // Plain text for Home page
            contentHTML: contentHTML, // HTML for subsequent loads
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

  return (
    <div className="w-full relative bg-(--background-color) min-h-screen flex flex-col overflow-hidden font-bubblegum">
      {/* Toolbar */}
      <div className="w-full border-b border-b-black p-2 md:pt-4 md:pb-2 flex items-center justify-between pt-2 md:pt-0 gap-3 px-2 md:px-4 text-(--text-color)">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold hover:scale-105 transition-transform"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
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
            className="px-2 font-bold hover:text-(--light-background)"
          >
            B
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className="px-2 italic hover:text-(--light-background)"
          >
            I
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            className="px-2 hover:text-(--light-background)"
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
                <button
                  onClick={deleteCard}
                  className="w-full flex items-center gap-3 p-1 text-left text-xs md:text-md hover:bg-[#D73535] hover:text-white transition-colors text-(--text-color)"
                >
                  <Trash2 size={18} />
                  Delete Card
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold md:mb-8 uppercase border-b-4 border-black inline-block text-(--text-color)">
          {cardTitle || id}
        </h1>

        <div className="editorContent min-h-[50vh] prose prose-sm md:prose-lg max-w-none border-t-2 border-black/10 pt-6 text-(--text-color)">
          <EditorContent
            editor={editor}
            className="outline-none border-none cursor-text"
          />
        </div>

        <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
          <button
            onClick={saveToLocalStorage}
            disabled={isLoading}
            className={classnames(
              "px-8 py-3 rounded-full font-bold uppercase transition-all flex items-center gap-2",
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
        </div>
      </div>
    </div>
  );
}
