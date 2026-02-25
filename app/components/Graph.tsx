"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import classnames from "classnames";
import { useTheme } from "../context/ThemeContext";

type GraphData = {
  date: string;
  count: number;
};

export default function Graph() {
  const [data, setData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetch("/api/graph")
      .then((res) => res.json())
      .then((items: GraphData[]) => {
        const dataMap: Record<string, number> = {};
        items.forEach((item) => {
          dataMap[item.date] = item.count;
        });
        setData(dataMap);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch graph data", err);
        setLoading(false);
      });
  }, []);

  // Generate date array for the grid
  const days = [];
  const today = new Date();

  // Calculate start date: go back 1 year
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 365);

  // Adjust startDate to the previous Sunday
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() - 1);
  }

  // Generate days until we reach today or slightly past to fill the grid columns
  const currentDate = new Date(startDate);
  while (currentDate <= today) {
    days.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate weeks for month labels
  // We need to know which weeks start a new month
  const weeks: any[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return "bg-(--background-color) border-(--text-color)/80";
    if (count <= 2) return "bg-(--red-background)/30 border-(--text-color)/10";
    if (count <= 4) return "bg-(--red-background)/50 border-(--text-color)/20";
    if (count <= 6) return "bg-(--red-background)/70 border-(--text-color)/30";
    return "bg-(--red-background) border-(--text-color)";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMonthLabel = (weekIndex: number) => {
    // Get the first day of the week
    const weekStartDate = new Date(weeks[weekIndex][0]);
    const month = weekStartDate.toLocaleString("default", { month: "short" });

    // Check if this week starts a new month relative to the previous week
    if (weekIndex === 0) return month;

    const prevWeekStartDate = new Date(weeks[weekIndex - 1][0]);
    const prevMonth = prevWeekStartDate.toLocaleString("default", {
      month: "short",
    });

    if (month !== prevMonth) {
      return month;
    }
    return "";
  };

  if (loading) {
    return (
      <div className="w-full mt-10 p-4 border border-(--red-background) rounded-xl bg-(--red-background)/40 animate-pulse h-[200px]"></div>
    );
  }

  return (
    <div
      className={classnames(
        "w-full mt-2 md:mt-5 rounded-md md:rounded-xl backdrop-blur-sm relative overflow-hidden p-4 md:p-6 ",
      )}
    >
      <h3
        className={classnames(
          "mb-3 text-sm font-extrabold uppercase tracking-wider",
          { "text-black": theme !== "black", "text-white": theme === "black" },
        )}
      >
        Activity Graph
      </h3>

      <div className="flex gap-2">
        {/* Day Labels (Left Axis) */}
        <div
          className={classnames(
            "grid grid-rows-7 gap-1 text-[10px] font-bold h-full pt-[20px]",
            {
              "text-black": theme !== "black",
              "text-white": theme === "black",
            },
          )}
        >
          {/* pt-5 to align with the grid below the month headers */}
          <span className="h-3 mt-px flex items-center">Sun</span>
          <span className="h-3 flex items-center">Mon</span>
          <span className="h-3 flex items-center">Tue</span>
          <span className="h-3 flex items-center">Wed</span>
          <span className="h-3 flex items-center">Thu</span>
          <span className="h-3 flex items-center">Fri</span>
          <span className="h-3 flex items-center">Sat</span>
        </div>

        {/* Graph + Month Labels */}
        <div className="flex flex-col relative overflow-x-auto pb-2 scrollbar-hide [&::-webkit-scrollbar]:w-2">
          {/* Month Labels (Top Axis) */}
          <div
            className={classnames(
              "w-full flex text-[12px] mb-2 h-3 font-bold relative left-0",
              {
                "text-black": theme !== "black",
                "text-white": theme === "black",
              },
            )}
          >
            {weeks.map((week, i) => (
              <div
                key={i}
                className="min-w-3 mr-1 text-center overflow-visible whitespace-nowrap"
              >
                {getMonthLabel(i)}
              </div>
            ))}
          </div>

          {/* Github Style Grid */}
          <div className="pb-2 overflow-x-autoscrollbar-hide[&::-webkit-scrollbar]:w-2">
            <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
              {days.map((date) => {
                const count = data[date] || 0;
                return (
                  <Link href={`/day/${date}`} key={date} className="block">
                    <div
                      title={`${date}: ${count} tasks`}
                      className={`w-3 h-3 rounded-sm border ${getColor(
                        count,
                      )} transition-all duration-300 hover:scale-125 cursor-pointer`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
