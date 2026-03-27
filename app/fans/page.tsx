"use client";

import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Users, TrendingUp, TrendingDown, Search, ArrowRight } from "lucide-react";

export default function FanPortalPage() {
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

  const segments = [
    { label: "CORE FANS", count: "142,520", trend: "+12.4%", status: "UP" },
    { label: "CASUAL LISTENERS", count: "892,100", trend: "-2.1%", status: "DOWN" },
    { label: "PLAYLIST REACH", count: "4,210,000", trend: "+45.2%", status: "UP" },
    { label: "ENGAGEMENT RATE", count: "8.4%", trend: "+1.2%", status: "UP" },
  ];

  return (
    <main className="p-6 md:p-12 space-y-12 animate-in fade-in duration-700">
      <header className="space-y-4 border-b border-zinc-800 pb-8">
        <div className="flex items-center space-x-2 text-zinc-500">
          <Users size={16} />
          <span className="font-mono text-xs uppercase tracking-widest">AUDIENCE_METRICS</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
          FAN PORTAL<span className="text-white">.</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {segments.map((segment, i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-900 p-8 space-y-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{segment.label}</span>
              {segment.status === "UP" ? <TrendingUp size={14} className="text-white" /> : <TrendingDown size={14} className="text-zinc-700" />}
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black tracking-tighter uppercase leading-none">{segment.count}</p>
              <p className={`font-mono text-xs uppercase tracking-widest ${segment.status === "UP" ? "text-white" : "text-zinc-700"}`}>
                {segment.trend} THIS WEEK
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-6 pt-12 border-t border-zinc-900">
         <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight">TOP REGIONS</h2>
            <button className="flex items-center space-x-2 text-zinc-600 hover:text-white transition-colors group">
               <span className="font-mono text-xs uppercase tracking-widest">VIEW HEATMAP</span>
               <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
         
         <div className="grid grid-cols-1 gap-1">
            {["NEW YORK", "LONDON", "LOS ANGELES", "BERLIN", "TOKYO"].map((city, i) => (
               <div key={i} className="bg-zinc-950 border border-transparent p-6 flex items-center justify-between hover:bg-zinc-900 transition-colors">
                  <span className="text-zinc-400 font-mono text-xs">{i+1}.</span>
                  <span className="font-bold text-xl uppercase tracking-tighter flex-1 ml-6">{city}</span>
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-600">CONNECTED</span>
               </div>
            ))}
         </div>
      </section>
    </main>
  );
}
