"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";

type setSkillsType = {
  skillName: string;
  id: string;
};
type TaskType = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};
type SkillsFromBackendType = {
  id: string;
  skillName: string;
  userId: string;
  createdAt: any;
};

const DashboardComp = () => {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(
    new Date().getDate(),
  );
  const [events, setEvents] = useState<any[]>([]);
  const [skills, setSkills] = useState<setSkillsType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch Calendar Events
        const resEvents = await fetch("/api/calendar/events");
        if (resEvents.ok) {
          const data = await resEvents.json();
          setEvents(data);
        }

        // Fetch Skills and Tasks
        const resSkills = await fetch("/api/skills");
        console.log(resSkills);
        if (resSkills.ok) {
          const data = await resSkills.json();
          setSkills(
            data.skills.map((skill: SkillsFromBackendType) => ({
              skillName: skill.skillName,
              id: skill.id,
              userId: skill.userId,
              createdAt: skill.createdAt,
            })),
          );
          setTasks(data.tasks);
        }

        setError(null);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  const saveSkillInDB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName: inputValue }),
      });

      if (!res.ok) {
        throw new Error("Failed to save skill");
      }

      const saved = await res.json();
      setSkills((prev) => [
        {
          skillName: saved.skillName,
          id: saved.id,
        },
        ...prev,
      ]);

      setInputValue("");
      setShowInput(false);
    } catch (err) {
      console.error("Error saving skill:", err);
    }
  };

  async function deleteSkill(id: string) {
    try {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });

      if (!res.ok) {
        throw new Error("Failed to delete skill");
      }

      setSkills((prev) => prev.filter((skill) => skill.id !== id));
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  }

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
    setSelectedDay(null);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  const totalDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  // Padding for previous month
  const prevMonthDays = daysInMonth(year, month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, current: false });
  }

  // Days in current month
  for (let i = 1; i <= totalDays; i++) {
    days.push({ day: i, current: true });
  }

  // Padding for next month
  const remainingDays = 42 - days.length; // 6 rows of 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, current: false });
  }

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const filteredEvents = selectedDay
    ? events.filter((e: any) => {
        const eventDate = new Date(e.start);
        return (
          eventDate.getDate() === selectedDay &&
          eventDate.getMonth() === month &&
          eventDate.getFullYear() === year
        );
      })
    : events.filter((e: any) => new Date(e.start) >= new Date()).slice(0, 5);

  const taskCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.title] = (acc[task.title] || 0) + 1;
    return acc;
  }, {});

  const uniqueTasks = Object.entries(taskCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .map(([title, count]) => ({ title, count }));

  const maxCount = uniqueTasks.length > 0 ? uniqueTasks[0].count : 1;

  const SkeletonLoader = () => (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-1/3 bg-(--text-color)/10 rounded-md"></div>
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-24 bg-(--text-color)/10 rounded-xl"
          ></div>
        ))}
      </div>
      <div className="h-6 w-1/4 bg-(--text-color)/10 rounded-md mt-4"></div>
      <div className="h-64 flex items-end justify-around px-8 pt-2">
        {[40, 70, 45, 90, 60].map((h, i) => (
          <div
            key={i}
            className="w-6 md:w-10 bg-(--text-color)/10 rounded-t-lg"
            style={{ height: `${h}%` }}
          ></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col-reverse  lg:flex-row gap-8 w-full min-h-screen py-4 px-6 bg-(--background-color) mx-auto font-bubblegum">
      <Link
        href="/"
        className="fixed top-3 left-3 md:top-4 md:left-4 p-1 group rounded-md backdrop-blur-sm hover:bg-white/10 transition-all duration-500 cursor-pointer flex flex-col z-1000 flex-row items-center justify-center gap-1"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </Link>

      {/* Left Section: Events */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between md:justify-end items-center gap-2 md:gap-4 md:mt-24 lg:mt-0">
          <h2 className="text-lg md:text-2xl font-bold text-(--text-color)">
            {selectedDay
              ? `Events for ${monthNames[month]} ${selectedDay}`
              : "Upcoming Events"}
          </h2>
          <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-(--text-color)/40" />
        </div>

        <div className="flex flex-col gap-4">
          {error ? (
            <div className="bg-(--red-background) p-6 rounded-[2rem] flex flex-col items-center justify-center text-center gap-2">
              <p className="text-red-600 font-medium">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-red-500 underline"
              >
                Try reloading
              </button>
            </div>
          ) : loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* Things you should be learning (Skills) */}
              {(skills.length > 0 || showInput) && (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <p className="text-(--text-color)/90 font-medium capitalize">
                      things you should be learning
                    </p>
                    {!showInput && (
                      <button
                        onClick={() => setShowInput(true)}
                        className="p-1 rounded-full text-(--text-color) border border-(--text-color) hover:bg-(--text-color) hover:text-(--background-color) transition-all cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 md:gap-4 flex-wrap">
                    {skills.map((skill) => (
                      <span
                        key={skill.id}
                        className={classNames(
                          "flex gap-1 md:gap-2 xl:gap-4 items-center bg-(--red-background) p-1 px-2 rounded-md md:rounded-xl text-xs md:text-sm font-bold uppercase border-2 border-(--text-color) text-black transition-all",
                          "shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5",
                          {
                            "shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]":
                              theme === "black",
                          },
                        )}
                      >
                        {skill.skillName}
                        <button
                          onClick={() => deleteSkill(skill.id)}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-black/10"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {showInput && (
                      <form
                        onSubmit={saveSkillInDB}
                        className="flex items-center gap-2"
                      >
                        <input
                          autoFocus
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="w-32 border-2 border-(--text-color) rounded-xl px-2 py-0.5 outline-none bg-transparent text-(--text-color) text-sm"
                        />
                        <button
                          type="submit"
                          className="bg-(--text-color) text-(--background-color) rounded-xl px-3 py-0.5 uppercase cursor-pointer text-xs font-bold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowInput(false)}
                          className="p-1 text-(--text-color)"
                        >
                          <X size={14} />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Things you should be doing (Analytics Graph) */}
              <div className="flex flex-col gap-4 mt-2">
                {uniqueTasks.length > 0 ? (
                  <div className="relative h-64 w-full mt-4 flex flex-col">
                    {/* Y-axis and Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-2">
                      {[...Array(5)].map((_, i) => {
                        const val = Math.round((maxCount / 4) * (4 - i));
                        return (
                          <div
                            key={i}
                            className="w-full flex items-center gap-2"
                          >
                            <span className="text-[14px] font-bold text-(--text-color)/60 w-4 text-right">
                              {val}
                            </span>
                            <div className="flex-1 border-t border-(--text-color)/10"></div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bars Container */}
                    <div className="flex-1 flex items-end justify-around px-8 pt-2">
                      {uniqueTasks.slice(0, 6).map((task) => {
                        return (
                          <div
                            key={task.title}
                            className="flex flex-col items-center group relative h-full justify-end"
                          >
                            {/* Tooltip on hover */}
                            <div className="absolute -top-8 bg-(--text-color) text-(--background-color) text-[14px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-light   uppercase">
                              {task.title}: {task.count}
                            </div>

                            {/* The Bar */}
                            <div
                              className={classNames(
                                "w-6 md:w-10 rounded-t-lg transition-all duration-1000 relative cursor-help border-2 border-(--text-color)",
                                {
                                  "bg-white shadow-[4px_0px_0px_0px_rgba(0,0,0,0.1)]":
                                    theme !== "black",
                                  "bg-zinc-200 shadow-[4px_0px_0px_0px_rgba(255,255,255,0.1)]":
                                    theme === "black",
                                },
                              )}
                              style={{
                                height: `${(task.count / maxCount) * 100}%`,
                              }}
                            >
                              {/* Inner Glow/Highlight */}
                              <div className="absolute inset-0 bg-white/20 rounded-t-lg pointer-events-none"></div>
                            </div>

                            {/* Label */}
                            <div className="mt-2 text-[10px] md:text-[14px] font-extrabold uppercase text-(--text-color)/80 max-w-[100px] truncate text-center">
                              {task.title}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-(--red-background)/0 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-(--text-color)/20" />
                    <p className="text-(--text-color)/60 font-medium italic">
                      No tasks completed yet
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Section: Calendar & Lessons */}
      <div className="w-full lg:w-[400px] flex flex-col gap-2 md:gap-6 mt-10 md:mt-0">
        <h2 className="text-2xl font-bold md:px-2 text-(--text-color)">
          Lesson schedule
        </h2>

        <div className="bg-white/10 rounded-[1.5rem] p-4 md:p-8 shadow-sm ">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-sm md:text-xl font-bold text-(--text-color) uppercase">
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-(--text-color)/40" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-(--text-color)/40" />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2 md:mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[0.65rem] font-bold text-(--text-color)/40"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-3">
            {days.map((d, index) => {
              const isSelected = d.current && d.day === selectedDay;
              const isHighlighted =
                d.current &&
                events.some((e) => {
                  const eventDate = new Date(e.start);
                  return (
                    eventDate.getDate() === d.day &&
                    eventDate.getMonth() === month &&
                    eventDate.getFullYear() === year
                  );
                });
              const isOutside = !d.current;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center gap-1 group"
                >
                  <div
                    onClick={() => d.current && setSelectedDay(d.day)}
                    className={classNames(
                      "w-6 h-6 md:w-9 md:h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer relative",
                      {
                        "bg-(--text-color) text-(--background-color) shadow-md":
                          isSelected,
                        "bg-(--text-color)/10 text-(--text-color)":
                          isHighlighted && !isSelected,
                        "text-(--text-color)/20 border-[1.5px] border-dashed border-black/10":
                          isOutside,
                        "text-(--text-color) hover:bg-(--text-color)/5":
                          !isSelected && !isHighlighted && !isOutside,
                      },
                    )}
                  >
                    {d.day}
                  </div>
                  {/* Event Indicator Dot */}
                  {isHighlighted && !isOutside && (
                    <div
                      className={classNames("w-1 h-1 rounded-full", {
                        "bg-(--background-color)": isSelected,
                        "bg-black/40": !isSelected,
                      })}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* <div className="bg-(--text-color) py-2 text-(--background-color) rounded-xl flex justify-center items-center text-2xl font-bold cursor-pointer">Add Event +</div> */}
      </div>
    </div>
  );
};

export default DashboardComp;
