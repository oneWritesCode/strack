"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaClock, FaCalendar } from "react-icons/fa";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import DailyTodoList from "../components/DailyTodoList";
import {
  Trash2,
  Search,
  LayoutGrid,
  List,
  LayoutPanelLeft,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import classnames from "classnames";

import { DEFAULT_CARDS, type Card } from "../lib/constants";
import { syncNotesWithDatabase } from "../lib/syncNotes";

const NoteCard = ({
  card,
  preview,
  theme,
  isGrid,
  isList,
  onStarToggle,
}: {
  card: Card;
  preview?: string;
  theme: string;
  isGrid?: boolean;
  isList?: boolean;
  onStarToggle: (e: React.MouseEvent, id: string) => void;
}) => {
  return (
    <Link
      href={`/notes/${card.id}`}
      className={classnames(
        "group relative transition-all duration-400 flex flex-col items-start cursor-pointer border-2 border-(--text-color) rounded-xl md:rounded-3xl p-2 md:p-4 hover:shadow-none hover:translate-x-1 hover:translate-y-1",
        {
          "min-w-[50vw] max-w-[20vw] md:min-w-70 md:max-w-40 h-20 md:h-30 bg-(--red-background) shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]":
            !isGrid && !isList,
          "w-full h-24 md:h-32 bg-(--red-background) shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]":
            isGrid,
          "w-full h-auto py-3 md:py-4 bg-(--red-background) shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex-row items-center gap-4":
            isList,
          "text-black bg-transparent shadow-black": theme === "yellow",
          "shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] md:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]":
            theme === "black" && !isGrid && !isList,
          "shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]":
            theme === "black" && (isGrid || isList),
        },
      )}
    >
      {/* Star Icon */}
      <button
        onClick={(e) => onStarToggle(e, card.id)}
        className="absolute top-2 right-2 md:top-3 md:right-3 z-10 transition-transform active:scale-150"
      >
        <Star
          size={isList ? 20 : 24}
          className={classnames("transition-all text-black", {
            "fill-yellow-400 text-black drop-shadow-sm": card.isStarred,
          })}
        />
      </button>

      <div
        className={classnames("flex flex-col flex-1", {
          "justify-center w-full": isList,
        })}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <h3
            className={classnames(
              "font-bold text-black uppercase tracking-wider line-clamp-1 overflow-hidden max-w-[60%]",
              {
                "text-xl md:text-2xl": !isList,
                "text-lg md:text-xl": isList,
              },
            )}
          >
            {card.title}
          </h3>
          {card.category && card.category !== "none" && (
            <span className="bg-black/10 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md text-black/60">
              {card.category}
            </span>
          )}
        </div>
        {preview ? (
          <p
            className={classnames(
              "text-xs md:text-sm text-black/60 font-semibold line-clamp-2",
            )}
          >
            {preview}
          </p>
        ) : (
          <p
            className={classnames(
              "text-xs md:text-sm text-black/60 font-semibold line-clamp-2",
              { "hidden md:block": isList },
            )}
          >
            write something in {card.title}
          </p>
        )}
      </div>
    </Link>
  );
};

const AddCardBtn = ({
  onClick,
  isGrid,
  isList,
}: {
  onClick: () => void;
  isGrid?: boolean;
  isList?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      className={classnames(
        "relative bg-(--text-color) text-(--background-color) flex items-center justify-center border-2 border-(--background-color)/40 transition-all duration-300 cursor-pointer hover:shadow-none hover:translate-x-1 hover:translate-y-1",
        {
          "min-w-[50vw] md:min-w-40 h-20 md:h-30 rounded-2xl md:rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]":
            !isGrid && !isList,
          "w-full h-24 md:h-32 rounded-xl md:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]":
            isGrid,
          "w-full h-12 md:h-16 rounded-xl md:rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]":
            isList,
        },
      )}
    >
      <div className="absolute w-4 md:w-6 border-(--background-color) border-2 md:border-3 rounded-full"></div>
      <div className="absolute w-4 md:w-6 border-(--background-color) border-2 md:border-3 rounded-full rotate-90"></div>
    </button>
  );
};

function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const { data: session } = useSession();
  const [optimisticName, setOptimisticName] = useState<string | null>(null);
  const { theme, setTheme, availableThemes } = useTheme();
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [layout, setLayout] = useState<"carousel" | "grid" | "list">(
    "carousel",
  );
  const [newCardCategory, setNewCardCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showErrorWhileAddingCard, setShowErrorWhileAddingCard] = useState("");
  useEffect(() => {
    const savedName = Cookies.get("sk_user_name");
    if (savedName) setOptimisticName(savedName);
  }, []);

  useEffect(() => {
    const savedCards = localStorage.getItem("skilltracker_cards");
    const loadedCards = savedCards ? JSON.parse(savedCards) : DEFAULT_CARDS;
    setCards(loadedCards);

    // Run the sync engine
    syncNotesWithDatabase().then(() => {
      // Force refresh from localstorage when sync completes successfully
      const freshlySyncedCardsStr = localStorage.getItem("skilltracker_cards");
      if (freshlySyncedCardsStr) {
        setCards(JSON.parse(freshlySyncedCardsStr));
      }
    });

    // Load saved layout
    const savedLayout = localStorage.getItem("skilltracker_layout");
    if (
      savedLayout &&
      (savedLayout === "carousel" ||
        savedLayout === "grid" ||
        savedLayout === "list")
    ) {
      setLayout(savedLayout);
    }

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

  const addCard = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = newCardTitle.trim();

    if (!trimmedTitle) {
      setShowErrorWhileAddingCard("Title cannot be empty!");
      return;
    }

    // 1. Check for special characters (allow only alphanumeric and spaces)
    if (/[^a-zA-Z0-9\s]/.test(trimmedTitle)) {
      setShowErrorWhileAddingCard("Title cannot contain special characters!");
      return;
    }

    // 2. Check for duplicate titles (case-insensitive)
    const isDuplicate = cards.some(
      (card) => card.title.toLowerCase() === trimmedTitle.toLowerCase(),
    );

    if (isDuplicate) {
      setShowErrorWhileAddingCard("A card with this title already exists!");
      return;
    }

    setIsAdding(false);

    const newCardId = trimmedTitle.toLowerCase().replace(/\s+/g, "-");
    const newCard: Card = {
      id: newCardId,
      title: trimmedTitle,
      category: newCardCategory.trim() || "none",
      isStarred: false,
    };

    // Save to local storage Optimistically
    saveCards([...cards, newCard]);
    setNewCardTitle("");
    setNewCardCategory("");
    setShowErrorWhileAddingCard("");

    // Save to Database
    try {
      if (session?.user) {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newCardId,
            title: trimmedTitle,
            category: newCardCategory.trim() || "none",
            isStarred: false,
            isListNote: false,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to save card to database:", err);
    }
  };

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedCards = cards.map((card) =>
      card.id === id ? { ...card, isStarred: !card.isStarred } : card,
    );
    saveCards(updatedCards);
  };

  const categories = Array.from(
    new Set(
      cards
        .map((c) => c.category)
        .filter((cat): cat is string => !!cat && cat !== "none"),
    ),
  );

  const filteredCards = cards.filter((card) => {
    const matchesSearch = card.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "starred" && card.isStarred) ||
      card.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleLayout = () => {
    let nextLayout: "carousel" | "grid" | "list";
    if (layout === "carousel") nextLayout = "grid";
    else if (layout === "grid") nextLayout = "list";
    else nextLayout = "carousel";

    setLayout(nextLayout);
    localStorage.setItem("skilltracker_layout", nextLayout);
  };

  const getLayoutIcon = () => {
    if (layout === "carousel") return <LayoutPanelLeft size={20} />;
    if (layout === "grid") return <LayoutGrid size={20} />;
    return <List size={20} />;
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
        <Link href="/dashboard" title="dashboard">
          <FaCalendar size={24} className="cursor-pointer md:block hidden" />
          <FaCalendar size={18} className="cursor-pointer md:hidden block" />
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

        <div className="flex gap-4 relative w-full">
          <DailyTodoList />
          <Link
            href="/day"
            className={classnames(
              "group w-[50vw] md:w-70 relative h-25 md:h-30 border-2 border-(--text-color) rounded-3xl p-3 md:p-4 transition-all duration-400 flex flex-col items-start cursor-pointer",
              "shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
              {
                "text-black bg-transparent shadow-black": theme === "yellow",
              },
              {
                "shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] md:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]":
                  theme === "black",
              },
            )}
          >
            <h3 className="text-xl md:text-3xl font-bold text-(--text-color) uppercase tracking-wider">
              Today{" "}
            </h3>

            <p className="text-xs md:text-sm text-(--text-color)/60 font-semibold line-clamp-2">
              how's Your day? write something about it or what you have done
              today...
            </p>
          </Link>
        </div>

        {/* Search and Layout Toggle */}
        <div className="w-full flex items-center justify-between gap-2 md:gap-4 mb-4 mt-6 md:mt-8">
          <div className="relative flex-1 max-w-md group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-color)/50 group-focus-within:text-(--text-color) transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search your notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-2 border-(--text-color)/50 rounded-xl md:rounded-2xl py-1 md:py-2 pl-10 pr-4 outline-none focus:border-(--text-color)/50 transition-all text-(--text-color) placeholder:text-(--text-color)/50"
            />
          </div>
          <button
            onClick={toggleLayout}
            className="flex items-center gap-2 px-2 py-2 border-2 border-(--text-color)/50 rounded-xl text-(--text-color) hover:bg-(--text-color) hover:text-(--background-color) transition-all font-bold cursor-pointer"
            title="Change Layout"
          >
            {getLayoutIcon()}
          </button>
        </div>

        {/* Category Filters */}
        <div className="w-full flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          {["all", "starred", ...categories].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={classnames(
                "px-4 py-1.5 rounded-full border-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                {
                  "bg-(--text-color) text-(--background-color) border-(--text-color)":
                    activeFilter === filter,
                  "border-(--text-color)/20 text-(--text-color)/60 hover:border-(--text-color)/40":
                    activeFilter !== filter,
                },
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Cards Container */}
        <div className="relative w-full min-h-[140px]">
          {layout === "carousel" && (
            <>
              <div className="absolute right-0 top-0 min-w-15 md:min-w-25 h-full bg-gradient-to-l from-(--background-color) via-(--background-color)/60 to-transparent z-10 pointer-events-none"></div>
              <div className="flex relative gap-4 md:gap-6 w-full pb-4 md:pb-8 pr-10 pt-4 md:pt-6 overflow-x-auto overflow-y-hidden scrollbar-hide">
                {filteredCards.map((card) => (
                  <NoteCard
                    key={card.id}
                    card={card}
                    preview={previews[card.id]}
                    theme={theme}
                    onStarToggle={toggleStar}
                  />
                ))}
                <AddCardBtn
                  onClick={() => {
                    setNewCardTitle("");
                    setShowErrorWhileAddingCard("");
                    setIsAdding(true);
                    if (activeFilter !== "all" && activeFilter !== "starred") {
                      setNewCardCategory(activeFilter);
                    } else {
                      setNewCardCategory("");
                    }
                  }}
                />
              </div>
            </>
          )}

          {layout === "grid" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full pb-8 pt-4">
              {filteredCards.map((card) => (
                <NoteCard
                  key={card.id}
                  card={card}
                  preview={previews[card.id]}
                  theme={theme}
                  isGrid
                  onStarToggle={toggleStar}
                />
              ))}
              <AddCardBtn
                onClick={() => {
                  setNewCardTitle("");
                  setShowErrorWhileAddingCard("");
                  setIsAdding(true);
                  if (activeFilter !== "all" && activeFilter !== "starred") {
                    setNewCardCategory(activeFilter);
                  } else {
                    setNewCardCategory("");
                  }
                }}
                isGrid
              />
            </div>
          )}

          {layout === "list" && (
            <div className="flex flex-col gap-3 w-full pb-8 pt-4">
              {filteredCards.map((card) => (
                <NoteCard
                  key={card.id}
                  card={card}
                  preview={previews[card.id]}
                  theme={theme}
                  isList
                  onStarToggle={toggleStar}
                />
              ))}
              <AddCardBtn
                onClick={() => {
                  setNewCardTitle("");
                  setShowErrorWhileAddingCard("");
                  setIsAdding(true);
                  if (activeFilter !== "all" && activeFilter !== "starred") {
                    setNewCardCategory(activeFilter);
                  } else {
                    setNewCardCategory("");
                  }
                }}
                isList
              />
            </div>
          )}
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
                className="w-full border-2 border-(--text-color) p-3 rounded-xl mb-4 outline-none bg-transparent text-(--text-color) focus:bg-(--text-color)/10"
                value={newCardTitle}
                onChange={(e) => {
                  setNewCardTitle(e.target.value);
                }}
              />
              <input
                type="text"
                placeholder="Category (e.g. Work, Personal) - optional"
                className="w-full border-2 border-(--text-color) p-3 rounded-xl outline-none bg-transparent text-(--text-color) focus:bg-(--text-color)/10"
                value={newCardCategory}
                onChange={(e) => setNewCardCategory(e.target.value)}
              />
              <p className="text-center text-red-400 mb-2 mt-4">
                {showErrorWhileAddingCard}
              </p>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-(--text-color) text-(--background-color) py-2 md:py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewCardTitle("");
                    setNewCardCategory("");
                    setShowErrorWhileAddingCard("");
                  }}
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
