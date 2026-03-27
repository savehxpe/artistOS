"use client";

import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, Bell, Share2 } from "lucide-react";

export default function CalendarPage() {
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

  const drops = [
    { name: "Single Release: 'Outlandia'", type: "Spotify", date: "FEB 14", status: "PENDING" },
    { name: "Music Video Release", type: "YouTube", date: "FEB 18", status: "PENDING" },
    { name: "TikTok Campaign Live", type: "Socials", date: "FEB 10", status: "COMPLETED" },
    { name: "Merch Drop: Phase 1", type: "Web", date: "MAR 03", status: "PENDING" },
  ];

  return (
    <main className="p-6 md:p-12 space-y-12 animate-in fade-in duration-700">
      <header className="space-y-4 border-b border-zinc-800 pb-8">
        <div className="flex items-center space-x-2 text-zinc-500">
          <Calendar size={16} />
          <span className="font-mono text-xs uppercase tracking-widest">CONTENT_TIMELINE</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
          ROLLOUT CALENDAR<span className="text-white">.</span>
        </h1>
      </header>

      <div className="space-y-8">
        {drops.map((drop, i) => (
          <div key={i} className={`flex items-start md:items-center justify-between border-b border-zinc-900 pb-8 transition-opacity ${drop.status === "COMPLETED" ? "opacity-30" : "hover:opacity-75 cursor-pointer"}`}>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-12 space-y-4 md:space-y-0 flex-1">
               <div className="space-y-1">
                  <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">{drop.date}</p>
                  <p className="text-4xl font-black tracking-tighter uppercase leading-none">{drop.name}</p>
               </div>
               
               <div className="flex md:flex-col space-x-4 md:space-x-0 space-y-0 md:space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Platform</span>
                  <span className="font-bold text-lg uppercase tracking-tight">{drop.type}</span>
               </div>
            </div>
            
            <div className="flex flex-col items-end space-y-4">
               <div className="flex items-center space-x-4 text-zinc-500">
                  <Bell size={18} className="hover:text-white" />
                  <Share2 size={18} className="hover:text-white" />
                  <ChevronRight size={24} className="text-zinc-800" />
               </div>
               <span className="font-mono text-[10px] bg-zinc-900 px-2 py-1 text-zinc-500 uppercase tracking-widest">{drop.status}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
