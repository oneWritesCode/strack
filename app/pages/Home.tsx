"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaClock, FaCalendar } from "react-icons/fa";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import classnames from "classnames";

import { DEFAULT_CARDS, type Card } from "../lib/constants";

function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const { data: session } = useSession();
  const [optimisticName, setOptimisticName] = useState<string | null>(null);
  const { theme, setTheme, availableThemes } = useTheme();
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedName = Cookies.get("sk_user_name");
    if (savedName) setOptimisticName(savedName);
  }, []);

  useEffect(() => {
    const savedCards = localStorage.getItem("skilltracker_cards");
    const loadedCards = savedCards ? JSON.parse(savedCards) : DEFAULT_CARDS;
    setCards(loadedCards);

    // Load previews for all cards
    const newPreviews: Record<string, string> = {};
    loadedCards.forEach((card: Card) => {
      // Priority 1: Use card.content directly if it exists (now saved as plain text)
      if (card.content) {
        newPreviews[card.id] =
          card.content.slice(0, 80).trim() +
          (card.content.length > 80 ? "..." : "");
      } else {
        // Fallback: Try to extract from saved JSON data if card.content is missing
        const savedData = localStorage.getItem(`extra_card_${card.id}`);
        if (savedData) {
          try {
            const { content } = JSON.parse(savedData);
            newPreviews[card.id] = extractTextFromContent(content);
          } catch (e) {
            console.error("Error parsing card data", e);
          }
        }
      }
    });
    setPreviews(newPreviews);
  }, []);

  const extractTextFromContent = (content: any): string => {
    if (!content) return "";

    let text = "";
    if (typeof content === "string") {
      // It's HTML, strip tags
      text = content.replace(/<[^>]*>/g, " ");
    } else if (content.content) {
      // It's Tiptap JSON
      const getText = (nodes: any[]): string => {
        return nodes
          .map((node) => {
            if (node.type === "text") return node.text;
            if (node.content) return getText(node.content);
            return "";
          })
          .join(" ");
      };
      text = getText(content.content);
    }

    return text.replace(/\s+/g, " ").slice(0, 80).trim() + "...";
  };

  const saveCards = (updatedCards: Card[]) => {
    setCards(updatedCards);
    localStorage.setItem("skilltracker_cards", JSON.stringify(updatedCards));
  };

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    const newCard = {
      id: newCardTitle.toLowerCase().replace(/\s+/g, "-"),
      title: newCardTitle.trim(),
    };
    saveCards([...cards, newCard]);
    setNewCardTitle("");
    setIsAdding(false);
  };

  return (
    <div className="w-full relative bg-(--background-color) flex items-center min-h-screen justify-start flex-col overflow-hidden font-bubblegum">
      <Navbar />

      {/* Top Header Actions */}
      <div className="w-full relative top-0 p-2 pt-4 md:pb-2 flex items-center justify-end overflow-x-auto z-10 scrollbar-hide gap-2 md:gap-3 px-2 md:px-4 text-(--text-color)">
        <div className="flex gap-1 md:gap-2 pr-1">
          {availableThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{ backgroundColor: t.color }}
              className={classnames(
                "w-4 h-4 md:w-6 md:h-6 rounded-full border-2 transition-all cursor-pointer",
                {
                  "border-(--text-color) scale-120": theme === t.id,
                  "border-transparent": theme !== t.id,
                },
              )}
              title={t.name}
            ></button>
          ))}
        </div>
        <Link href="/calender" title="Calender">
          <FaCalendar size={24} className="cursor-pointer md:block hidden" />
          <FaCalendar size={18} className="cursor-pointer md:hidden block" />
        </Link>
        <Link href="/clock" title="Clock">
          <FaClock size={24} className="cursor-pointer md:block hidden" />
          <FaClock size={18} className="cursor-pointer md:hidden block" />
        </Link>
      </div>

      <div className="w-full flex flex-col items-center justify-center pt-5 md:pt-4 px-4">
        {/* Welcome Section */}
        <div className="w-full mb-6 md:mb-10">
          <h1 className="text-3xl md:text-6xl font-medium text-(--text-color)">
            Hi {session?.user?.name || optimisticName || "there"},
          </h1>
          <p className="max-w-lg pb-2 text-(--text-color)/80">
            how's your day?
          </p>
        </div>

        {/* Cards Carousel Container */}
        <div className="relative w-full">
          <div className="absolute right-0 top-0 min-w-15 md:min-w-25 h-full bg-gradient-to-l from-(--background-color) via-(--background-color)/60 to-transparent z-10 pointer-events-none"></div>

          <div className="flex relative gap-4 md:gap-6 w-full pb-8 pr-10 overflow-x-auto overflow-y-hidden scrollbar-hide">
            {cards.map((card) => (
              <Link
                key={card.id}
                href={`/notes/${card.id}`}
                className={classnames(
                  "group min-w-[60vw] md:min-w-75 relative h-24 md:h-40 bg-(--red-background) border-2 border-(--text-color) rounded-xl md:rounded-3xl p-2 md:p-6 transition-all duration-400 flex flex-col items-start cursor-pointer",
                  "shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
                  {
                    "text-black bg-transparent shadow-black":
                      theme === "yellow",
                  },
                  {
                    "shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] md:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]":
                      theme === "black",
                  },
                )}
              >
                <h3 className="text-xl md:text-3xl font-bold text-black uppercase tracking-wider">
                  {card.title}
                </h3>
                {previews[card.id] ? (
                  <p className="text-xs md:text-sm text-black/60 font-semibold line-clamp-2">
                    {previews[card.id]}
                  </p>
                ) : (
                  <p className="text-xs md:text-sm text-black/60 font-semibold line-clamp-2">
                    write something in {card.title}
                  </p>
                )}
              </Link>
            ))}

            {/* Add Card Button */}
            <button
              onClick={() => setIsAdding(true)}
              className={classnames(
                "relative min-w-40 md:min-w-75 h-24 md:h-40 bg-(--text-color) text-(--background-color) rounded-2xl md:rounded-3xl flex items-center justify-center border-2 border-(--background-color)/40 transition-all duration-300 cursor-pointer",
                "shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
              )}
            >
              <div className="absolute w-4 md:w-6 border-(--background-color) border-2 rounded-full"></div>
              <div className="absolute w-4 md:w-6 border-(--background-color) border-2 rounded-full rotate-90"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-(--background-color) border-2 md:border-4 border-(--text-color) p-4 md:p-8 rounded-3xl w-full max-w-md shadow-[10px_10px_0px_0px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-bold mb-4 text-(--text-color)">
              Add New Card
            </h2>
            <form onSubmit={addCard}>
              <input
                autoFocus
                type="text"
                placeholder="Title (e.g. Gym, Poems...)"
                className="w-full border-2 border-(--text-color) p-3 rounded-xl mb-6 outline-none bg-transparent text-(--text-color) focus:bg-(--text-color)/10"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-(--text-color) text-(--background-color) py-2 md:py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 border-2 border-(--text-color) text-(--text-color) py-2 md:py-3 rounded-xl font-bold hover:bg-(--text-color)/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
