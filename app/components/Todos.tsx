"use client";

import { X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import classnames from "classnames";
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
  createdAt: string;
};

type ApiResponse = {
  skills: SkillsFromBackendType[];
  tasks: TaskType[];
};

export default function skills() {
  const [skills, setSkills] = useState<setSkillsType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { theme } = useTheme();
  // const { isTodoOpen } = useOpenTodo();

  const fetchedSkills = async () => {
    const res = await fetch("/api/skills");
    const data: ApiResponse = await res.json();
    console.log("here you go with the data", data);
    setSkills(
      data.skills.map((skill: SkillsFromBackendType) => ({
        skillName: skill.skillName,
        id: skill.id,
      })),
    );
    setTasks(data.tasks);
  };

  async function deleteSkill(id: any) {
    const res = await fetch(`api/skills/${id}`, { method: "DELETE" });

    if (!res.ok) {
      console.error("Failed to delete");
      return;
    }

    setSkills((prev) => prev.filter((skill) => skill.id !== id));
  }

  useEffect(() => {
    fetchedSkills();
  }, []);

  const saveSkillInDB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const res = await fetch("api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillName: inputValue }),
    });

    if (!res.ok) {
      console.error("Failed to delete");
      return;
    }

    const saved = await res.json();
    setSkills((prev) => [
      { skillName: saved.skillName, id: saved.id },
      ...prev,
    ]);

    setInputValue("");
    setShowInput(false);
  };

  // const addSkill = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!inputValue.trim()) return;

  //   saveSkillInDB();

  //   setInputValue("");
  //   setShowInput(false);
  // };

  return (
    <div
      className={`w-full my-3 capitalize font-medium text-sm text-(--text-color)`}
    >
      <div className="flex justify-between items-center mb-1">
        <span>skills you are learning:</span>
      </div>
      <div>
        <div className="mt-2 flex gap-2 md:gap-4 flex-wrap">
          {skills.map((skill) => (
            <span
              key={skill.id}
              className={classnames(
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
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs cursor-pointer p-1 hover:bg-white/20`}
              >
                x
              </button>
            </span>
          ))}
          {showInput ? (
            <form onSubmit={saveSkillInDB} className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-32 ring-2 ring-(--text-color)/50 shadow-sm shadow-(--text-color)/20 rounded-xl px-2 py-0.5 outline-none bg-transparent text-(--text-color) text-sm m-1"
              />
              <button
                type="button"
                onClick={saveSkillInDB}
                className="bg-(--text-color) text-(--background-color) rounded-xl px-3 py-0.5 uppercase cursor-pointer text-sm font-bold transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowInput(false)}
                className="p-0.5 rounded-full text-(--text-color) transition-colors cursor-pointer hover:bg-(--text-color) hover:text-(--background-color)"
              >
                <X size={16} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="p-1.5 rounded-full text-(--text-color) transition-colors cursor-pointer border border-(--text-color) hover:bg-(--text-color) hover:text-(--background-color)"
            >
              <Plus size={16} fontWeight={"bold"} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
