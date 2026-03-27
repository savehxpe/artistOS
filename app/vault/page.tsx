"use client";

import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { File, Lock, Download, MoreHorizontal } from "lucide-react";

export default function VaultPage() {
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

  const assets = [
    { name: "MASTER_ALBUM_FINAL.wav", size: "45.2 MB", type: "AUDIO", locked: false },
    { name: "YT_THUMBNAIL_V1.png", size: "2.1 MB", type: "IMAGE", locked: true },
    { name: "PRESS_KIT_2026.pdf", size: "12.8 MB", type: "DOC", locked: false },
    { name: "TIKTOK_CUT_RAW.mp4", size: "88.4 MB", type: "VIDEO", locked: true },
  ];

  return (
    <main className="p-6 md:p-12 space-y-12 animate-in fade-in duration-700">
      <header className="space-y-4 border-b border-zinc-800 pb-8">
        <div className="flex items-center space-x-2 text-zinc-500">
          <FolderLock size={16} />
          <span className="font-mono text-xs uppercase tracking-widest">CREATIVE_VAULT</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
          ASSET REPOSITORY<span className="text-white">.</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {assets.map((asset, i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-900 p-6 flex items-center justify-between hover:border-zinc-700 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <File size={18} className="text-zinc-400" />
              </div>
              <div className="space-y-1">
                <p className="font-bold uppercase tracking-tight">{asset.name}</p>
                <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{asset.type} // {asset.size}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {asset.locked ? <Lock size={14} className="text-zinc-600" /> : <Download size={14} className="text-zinc-400 cursor-pointer hover:text-white" />}
              <button className="p-2 hover:bg-zinc-900 transition-colors">
                <MoreHorizontal size={16} className="text-zinc-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

import { FolderLock } from "lucide-react";
