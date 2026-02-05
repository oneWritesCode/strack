"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layout,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";

const CalenderComp = () => {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(
    new Date().getDate(),
  );
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("/api/calendar/events");

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch events");
        }

        const data = await res.json();
        setEvents(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
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

  const lessons = [
    {
      id: 1,
      title: "Real World UX | Learn User Experience & Start Your Career",
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      bgColor: "bg-[#E6F4F1]",
    },
    {
      id: 2,
      title: "User Experience (UX): The Ultimate Guide to Usability and UX",
      icon: <Layout className="w-5 h-5 text-teal-500" />,
      bgColor: "bg-[#E0F2F2]",
    },
  ];

  const filteredEvents = selectedDay
    ? events.filter((e) => {
        const eventDate = new Date(e.start);
        return (
          eventDate.getDate() === selectedDay &&
          eventDate.getMonth() === month &&
          eventDate.getFullYear() === year
        );
      })
    : events.filter((e) => new Date(e.start) >= new Date()).slice(0, 5); // Show upcoming 5 from now if no selection

  // Helper to categorize events visually
  const getEventCategory = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("workshop") || t.includes("learn") || t.includes("class"))
      return "workshop";
    if (t.includes("meeting") || t.includes("sync") || t.includes("call"))
      return "meeting";
    if (t.includes("lab") || t.includes("research") || t.includes("test"))
      return "lab";
    return "testing"; // Default
  };
  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full p-6 bg-[#F8FAFB] mx-auto">
      <div className="top-0 left-0 fixed p-8 bg-black">
        {" "}
        <Navbar />
      </div>
      {/* Left Section: Events */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedDay
              ? `Events for ${monthNames[month]} ${selectedDay}`
              : "Upcoming Events"}
          </h2>
          {loading && (
            <div className="text-sm text-gray-500 animate-pulse">
              Loading events...
            </div>
          )}
          <CalendarIcon className="w-6 h-6 text-gray-400" />
        </div>

        <div className="flex flex-col gap-4">
          {error ? (
            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex flex-col items-center justify-center text-center gap-2">
              <p className="text-red-600 font-medium">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-red-500 underline"
              >
                Try reloading
              </button>
            </div>
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const category = getEventCategory(event.title);
              return (
                <div
                  key={event.id}
                  className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col gap-3 hover:translate-y-[-4px] transition-all cursor-pointer border border-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={classNames(
                        "px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider",
                        {
                          "bg-blue-100 text-blue-600": category === "workshop",
                          "bg-purple-100 text-purple-600":
                            category === "meeting",
                          "bg-orange-100 text-orange-600": category === "lab",
                          "bg-green-100 text-green-600": category === "testing",
                        },
                      )}
                    >
                      {category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(event.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">
                    {event.title}
                  </h4>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-12 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center gap-2 border border-dashed border-gray-200">
              <CalendarIcon className="w-8 h-8 text-gray-300" />
              <p className="text-gray-500 font-medium">
                {session
                  ? "No events scheduled for this day"
                  : "Sign in to see your events"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Calendar & Lessons */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        <h2 className="text-2xl font-bold px-2 text-gray-800">
          Lesson schedule
        </h2>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-[0.65rem] font-bold text-gray-400"
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
                      "w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer relative",
                      {
                        "bg-black text-white shadow-md": isSelected,
                        "bg-[#D9EBEB] text-gray-800":
                          isHighlighted && !isSelected,
                        "text-gray-400 border-[1.5px] border-dashed border-gray-200":
                          isOutside,
                        "text-gray-800 hover:bg-gray-50":
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
                        "bg-black": isSelected,
                        "bg-teal-500": !isSelected,
                      })}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lessons Section */}
        <div className="flex flex-col gap-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={classNames(
                "p-4 rounded-[1.5rem] flex items-start gap-4 cursor-pointer hover:opacity-90 transition-opacity",
                lesson.bgColor,
              )}
            >
              <div className="bg-white p-2 rounded-xl shadow-sm">
                {lesson.icon}
              </div>
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {lesson.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalenderComp;
