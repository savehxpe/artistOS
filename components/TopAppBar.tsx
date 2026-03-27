"use client";

import { useRouter, usePathname } from "next/navigation";
import { auth, signOut } from "../lib/firebase";

export default function TopAppBar() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on specific screens
  if (pathname === "/login" || pathname === "/onboarding") return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 h-16 flex items-center">
      <div className="w-full max-w-2xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-black dark:text-white cursor-pointer active:scale-95 transition-transform font-bold" onClick={() => router.push("/dashboard")}>grid_view</span>
          <h1 className="font-manrope font-black text-xl tracking-tighter text-black dark:text-white uppercase leading-none">ARTIST_OS</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-manrope uppercase tracking-widest text-[10px] font-bold border border-black/10 dark:border-white/10 px-3 py-1 bg-vibrant-yellow text-black shadow-sm">ROLE: ARTIST</span>
          <button onClick={handleLogout} className="material-symbols-outlined text-black/30 hover:text-black transition-colors focus:outline-none text-xl active:scale-90">logout</button>
        </div>
      </div>
    </header>
  );
}
