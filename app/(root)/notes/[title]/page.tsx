"use client";

import NoteViewer from "@/app/pages/NoteViewer";
import { usePathname } from "next/navigation";

export default function ExtraPage() {
  const pathname = usePathname();
  const id = pathname?.split("/").pop() || "";

  return (
    <div className="min-h-screen bg-(--background-color) w-full">
      <NoteViewer id={id} />
    </div>
  );
}
