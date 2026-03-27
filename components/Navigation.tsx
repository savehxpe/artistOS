"use client";

import { useRouter, usePathname } from "next/navigation";
import { auth, signOut } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { OutlandiaLogo } from "./OutlandiaLogo";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Hide on specific screens
  if (pathname === "/login" || pathname === "/onboarding") return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: "grid_view", path: "/dashboard" },
    { name: "Vault", icon: "inventory_2", path: "/vault" },
    { name: "Calendar", icon: "calendar_today", path: "/calendar" },
    { name: "Fans", icon: "hub", path: "/fans" },
    { name: "Tasks", icon: "checklist", path: "/tasks" },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-black/90 backdrop-blur-3xl border-t border-white/10 h-24 flex items-center">
      <div className="w-full max-w-[1400px] mx-auto px-6 flex justify-between items-center h-full">
        {/* Global Navigation - Standardized 5-Item Bottom Bar */}
        <div className="flex flex-1 items-center justify-around md:justify-center md:gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button 
                key={item.path}
                onClick={() => router.push(item.path)} 
                className={`flex flex-col md:flex-row items-center gap-2 md:gap-4 px-4 md:px-8 py-3 transition-all group relative ${isActive ? "text-black bg-[#FFFF00]" : "text-white/40 hover:text-white"}`}
              >
                <span 
                  className={`material-symbols-outlined text-2xl transition-all ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"}`}
                >
                  {item.icon}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? "opacity-100" : "opacity-0 md:opacity-40 group-hover:opacity-100"}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-black md:hidden" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Context Area - Hidden on mobile if needed, but keeping for now */}
        <div className="hidden md:flex items-center gap-8 ml-8 border-l border-white/10 pl-8">
            <button 
                onClick={handleLogout} 
                className="group flex items-center gap-3 transition-all active:scale-95 px-5 py-2.5 bg-zinc-900 border border-white/5 hover:border-[#FFFF00]/50"
            >
                <span className="material-symbols-outlined text-white/40 group-hover:text-[#FFFF00] transition-colors text-lg">logout</span>
                <span className="text-[9px] font-bold text-white/40 group-hover:text-[#FFFF00] transition-colors tracking-widest uppercase">Terminate</span>
            </button>
        </div>
      </div>
    </nav>
  );
}

