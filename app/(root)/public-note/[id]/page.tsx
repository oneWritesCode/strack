"use client";

import PublicNoteViewer from "@/app/pages/publicNoteViewer";
import NoteViewer from "@/app/pages/NoteViewer";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Globe, AlertCircle } from "lucide-react";
import classnames from "classnames";
import { useTheme } from "@/app/context/ThemeContext";

export default function NotePage() {
  const params = useParams();
  const id = params?.id as string;
  const { theme } = useTheme();
  
  const [data, setData] = useState<{ note: any, isOwner: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/notes/public-note/${id}`)
      .then(async (res) => {
        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           throw new Error(errData.error || "Failed to fetch note");
        }
        return res.json();
      })
      .then(d => {
        setData(d);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background-color) w-full font-bubblegum text-(--text-color)">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background-color) w-full font-bubblegum text-(--text-color) p-6">
        <div className="text-center p-12 border-4 border-(--text-color) rounded-3xl shadow-[12px_12px_0_0_rgba(0,0,0,0.1)] max-w-lg w-full bg-white dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/10 rounded-full">
              <AlertCircle size={48} className="text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">Access Denied</h1>
          <p className="text-lg opacity-80 mb-6">{error}</p>
          <div className="flex justify-center flex-col items-center gap-2">
            <p className="text-sm opacity-50 mb-2 italic">Possible reason: the owner might have restricted access or the link is outdated.</p>
            <a 
              href="/"
              className="px-6 py-2 bg-(--text-color) text-(--background-color) rounded-xl font-bold uppercase transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background-color) w-full">
      {data?.isOwner ? (
        <NoteViewer id={id} />
      ) : (
        <PublicNoteViewer note={data?.note} />
      )}
    </div>
  );
}
