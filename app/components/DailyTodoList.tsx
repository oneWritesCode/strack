"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Trash2, Maximize2, Minimize2 } from "lucide-react";
import classnames from "classnames";
import { useTheme } from "../context/ThemeContext";

type Task = {
  id?: string;
  title: string;
  completed: boolean;
};

export default function DailyTodoList() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [journalContent, setJournalContent] = useState<string | null>(null);
  const { theme } = useTheme();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`/api/journal/${today}`);
        const data = await res.json();
        if (data.exists) {
          setTasks(data.journal.tasks || []);
          setJournalContent(data.journal.journalContent);
        } else {
          setJournalContent(
            JSON.stringify({
              type: "doc",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "you haven't written anything about your day yet !!",
                    },
                  ],
                },
              ],
            }),
          );
        }
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      }
    };
    fetchTasks();
  }, [today]);

  const saveJournal = async (updatedTasks: Task[]) => {
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalContent: journalContent || "",
          tasks: updatedTasks,
          date: today,
        }),
      });
    } catch (error) {
      console.error("Failed to save journal", error);
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const updatedTasks = [{ title: newTask, completed: false }, ...tasks];
    setTasks(updatedTasks);
    setNewTask("");
    saveJournal(updatedTasks);
  };

  const toggleTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
    saveJournal(updatedTasks);
  };

  const deleteTask = (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveJournal(updatedTasks);
  };

  return (
    <div
      className={classnames({
        // "w-full min-h-screen   flex items-center justify-center z-1000000 fixed top-0 bg-black/60 backdrop-blur-2xl": isExpanded,
      })}
    >
      <div
        className={classnames(
          "relative transition-all duration-500 ease-in-out border-2 border-(--text-color) rounded-3xl p-3 md:p-4 overflow-hidden",
          "w-[50vw] md:w-70",
          "shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
          {
            "min-h-auto md:w-70": isExpanded,
            "min-h-50 max-h-100": !isExpanded,
            "bg-(--red-background)": theme !== "yellow" || "black",
            "bg-transparent text-white": theme === "black",
            "bg-transparent text-black shadow-black": theme === "yellow",
            "shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] md:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]":
              theme === "black",
          },
        )}
      >
        <div className="flex justify-between items-start mb-1">
          <div
            className={` ${tasks.length > 0 ? "flex items-center gap-2" : ""} overflow-hidden`}
          >
            <h3 className="text-xl md:text-3xl font-bold uppercase tracking-wider">
              Tasks
            </h3>
            <p className="text-xs md:text-sm text-(--text-color)/60 font-semibold line-clamp-1">
              {tasks.length > 0
                ? `${tasks.filter((t) => t.completed).length}/${tasks.length} done`
                : "What's the plan?"}
            </p>
          </div>
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            title={`${isExpanded ? "collapse" : "expand"}`}
            className="p-1 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <Minimize2 size={20} className="text-(--text-color)" />
            ) : (
              <Maximize2 size={20} className="text-(--text-color)" />
            )}
          </button> */}
        </div>

        <div
          className={classnames(
            "flex flex-col gap-2 transition-all duration-300",
            {
              "overflow-y-auto pr-1": isExpanded,
              "overflow-hidden": !isExpanded,
            },
          )}
        >
          <ul className="flex flex-col">
            {tasks.map((task, idx) => (
              <li key={idx} className="flex items-center gap-2 group">
                <button
                  onClick={() => toggleTask(idx)}
                  className={classnames(
                    "flex-1 flex items-center gap-2 p-1 rounded-lg transition-all text-left",
                    {
                      "text-(--text-color)/40": task.completed,
                      "text-(--text-color) hover:bg-black/10": !task.completed,
                      "": !isExpanded,
                    },
                  )}
                >
                  <div
                    className={classnames(
                      "w-4 h-4 md:w-4 md:h-4 rounded-md border-2 border-(--text-color)/60 flex items-center justify-center transition-all",
                    )}
                  >
                    {task.completed && (
                      <Check size={12} className="text-(--text-color)" />
                    )}
                  </div>
                  <span
                    className={classnames(
                      "flex-1 text-sm font-semibold truncate",
                      { "line-through": task.completed },
                    )}
                  >
                    {task.title}
                  </span>
                </button>
                {isExpanded && (
                  <button
                    onClick={() => deleteTask(idx)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-(--text-color)/40 hover:text-(--text-color) transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
            {tasks.length === 0 && (
              <p className="text-(--text-color)/30 text-center text-xs py-2">
                No tasks yet.
              </p>
            )}
          </ul>
        </div>

        {isExpanded && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <form onSubmit={addTask} className="flex items-center gap-1 md:gap-2 mt-2 w-full">
              <input
                autoFocus
                type="text"
                placeholder="Add todo..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="w-[60%] flex-1 bg-(--text-color)/10 border border-(--text-color)/60 rounded-xl px-2 md:px-3 py-0.5 md:py-1 text-sm text-(--text-color) placeholder:text-(--text-color)/30 outline-none focus:border transition-all"
              />
              <button
                type="submit"
                className="bg-(--text-color)/10 text-(--text-color) p-1 md:p-2 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={20} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
