"use client";

import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ListTodo, CheckSquare, Plus, Trash2 } from "lucide-react";

export default function TaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return null;

  const tasks = [
    { text: "Finish final mix for 'Outlandia'", status: "PENDING", date: "FEB 12" },
    { text: "Call management about Spotify rollout", status: "COMPLETED", date: "FEB 10" },
    { text: "Finalize press photos (Black & White)", status: "IN_PROGRESS", date: "FEB 15" },
    { text: "Update link-in-bio for Spotify reach", status: "PENDING", date: "FEB 14" },
  ];

  return (
    <main className="p-6 md:p-12 space-y-12 animate-in fade-in duration-700">
      <header className="space-y-4 border-b border-zinc-800 pb-8">
        <div className="flex items-center space-x-2 text-zinc-500">
          <ListTodo size={16} />
          <span className="font-mono text-xs uppercase tracking-widest">MISSION_LOG</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
             TASK MANAGER<span className="text-white">.</span>
           </h1>
           <button className="bg-white hover:bg-zinc-200 text-black px-6 py-4 font-black uppercase tracking-widest text-xs transition-colors whitespace-nowrap">
             NEW ACTION+
           </button>
        </div>
      </header>

      <div className="space-y-4">
        {tasks.map((task, i) => (
          <div key={i} className={`bg-zinc-950 border border-zinc-900 p-8 flex items-center justify-between hover:border-zinc-700 transition-colors ${task.status === "COMPLETED" ? "opacity-30 line-through grayscale" : ""}`}>
            <div className="flex items-center space-x-6">
              <div className={`w-6 h-6 border flex items-center justify-center cursor-pointer transition-colors ${task.status === "COMPLETED" ? "bg-white text-black" : "border-zinc-800 hover:border-white"}`}>
                {task.status === "COMPLETED" && <CheckSquare size={14} />}
              </div>
              <div className="space-y-2">
                <p className="font-bold text-xl uppercase tracking-tight leading-tight">{task.text}</p>
                <div className="flex items-center space-x-4">
                   <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{task.status}</p>
                   <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest leading-none bg-zinc-900 px-2 py-1">{task.date}</p>
                </div>
              </div>
            </div>
            
            <Trash2 size={16} className="text-zinc-800 hover:text-red-500 cursor-pointer transition-colors" />
          </div>
        ))}
      </div>
    </main>
  );
}
