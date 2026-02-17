"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowLeft,
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
  createdAt: any;
};
type SkillsFromBackendType = {
  id: string;
  skillName: string;
  userId: string;
  createdAt: any;
};

type ApiResponse = {
  skills: SkillsFromBackendType[];
  tasks: TaskType[];
};

const CalenderComp = () => {
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
          console.log("here you go with data", data);
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
    ? events.filter((e) => {
        const eventDate = new Date(e.start);
        return (
          eventDate.getDate() === selectedDay &&
          eventDate.getMonth() === month &&
          eventDate.getFullYear() === year
        );
      })
    : events.filter((e) => new Date(e.start) >= new Date()).slice(0, 5);

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
          ) : (
            <div className="bg-(--red-background)/0 p-12 rounded-[2rem] flex flex-col items-center justify-center text-center gap-2">
              <CalendarIcon className="w-5 h-5 md:w-8 md:h-8 text-(--text-color)/20" />
              <p className="text-(--text-color)/60 font-medium">
                {session
                  ? "No activities for this day"
                  : "Sign in to see your events"}
              </p>
              {loading && (
                <div className="text-sm text-(--text-color)/60 animate-pulse">
                  Loading data...
                </div>
              )}
            </div>
          )}

          <p className="text-(--text-color)/90 font-medium">
            things you should be doing
          </p>
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
              </span>
            ))}
          </div>
          <p className="text-(--text-color)/90 font-medium">
            things you are doing
          </p>
          <div className="flex gap-2 md:gap-4 flex-wrap">
            {tasks.map((task) => (
              <span
                key={task.id}
                className={classNames(
                  "flex gap-1 md:gap-2 xl:gap-4 items-center bg-(--red-background) p-1 px-2 rounded-md md:rounded-xl text-xs md:text-sm font-bold uppercase border-2 border-(--text-color) text-black transition-all",
                  "shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5",
                  {
                    "shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]":
                      theme === "black",
                  },
                )}
              >
                {task.title}
              </span>
            ))}
          </div>
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

export default CalenderComp;
