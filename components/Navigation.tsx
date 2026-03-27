"use client";

import { useRouter, usePathname } from "next/navigation";
import { auth, signOut } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

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
    { name: "OS", icon: "grid_view", path: "/dashboard" },
    { name: "VAULT", icon: "inventory_2", path: "/vault" },
    { name: "ROLLOUT", icon: "calendar_today", path: "/calendar" },
    { name: "FANS", icon: "hub", path: "/fans" },
    { name: "TASKS", icon: "checklist", path: "/tasks" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-2xl border-b-2 border-white/10 h-20 flex items-center shadow-2xl">
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center h-full">
        {/* Logo / App Name */}
        <div className="flex items-center gap-6 cursor-pointer group" onClick={() => router.push("/dashboard")}>
          <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black text-xl italic group-hover:bg-vibrant-yellow transition-all duration-300">A</div>
          <div className="hidden lg:block">
            <h1 className="font-manrope font-black text-2xl tracking-tighter text-white leading-none uppercase italic border-b-4 border-vibrant-yellow">ARTIST_OS</h1>
            <p className="font-inter text-[8px] font-black uppercase tracking-[0.4em] text-white/30 pt-1">EXECUTIVE_CMND_CENTER</p>
          </div>
        </div>

        {/* Global Navigation - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button 
                key={item.path}
                onClick={() => router.push(item.path)} 
                className={`flex items-center gap-3 px-6 py-2 transition-all group relative ${isActive ? "text-vibrant-yellow" : "text-white/40 hover:text-white"}`}
              >
                <span 
                  className={`material-symbols-outlined transition-all text-xl ${isActive ? "scale-110" : "group-hover:translate-y-[-2px]"}`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 900" : "'FILL' 0, 'wght' 500" }}
                >
                  {item.icon}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? "opacity-100 italic" : "opacity-100 group-hover:opacity-100"}`}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute bottom-[-14px] left-0 w-full h-1 bg-vibrant-yellow shadow-[0_4px_15px_#FFFF00] animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* User Context Area */}
        <div className="flex items-center gap-8">
            <div className="hidden sm:flex flex-col items-end">
                <span className="font-manrope uppercase tracking-[0.3em] text-[10px] font-black bg-vibrant-yellow text-black px-4 py-1.5 italic shadow-[0_0_15px_#FFFF00] scale-90">SR_ARTIST_DIRECTOR</span>
                <span className="text-[10px] font-black uppercase text-white/20 pt-1 tracking-widest">{user?.email?.split('@')[0] || "GUEST_USER"}</span>
            </div>
            
            <button 
                onClick={handleLogout} 
                className="group flex flex-col items-center gap-1 transition-all active:scale-90"
            >
                <span className="material-symbols-outlined text-white/30 group-hover:text-vibrant-yellow transition-colors text-2xl">logout</span>
                <span className="text-[8px] font-black text-white/10 uppercase group-hover:text-vibrant-yellow transition-colors tracking-widest">EXIT</span>
            </button>
        </div>
      </div>
    </nav>
  );
}
