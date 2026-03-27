"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db, doc, setDoc, getDoc, signOut } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import SpotifyInput from "../../components/SpotifyInput";
import YouTubeInput from "../../components/YouTubeInput";
import ArtistStats from "../../components/ArtistStats";
import AICaptionComponent from "../../components/AICaptionComponent";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [spotify, setSpotify] = useState<any>(null);
  const [youtube, setYoutube] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load initial data
        try {
          const userDoc = await getDoc(doc(db, "analytics", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.spotify) setSpotify(data.spotify);
            if (data.youtube) setYoutube(data.youtube);
          }
        } catch (error) {
          console.error("Error fetching analytics:", error);
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const saveStats = async (key: string, data: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "analytics", user.uid), {
        [key]: data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Error saving to Firebase", err);
    }
  };

  const handleSpotifyData = (data: any) => {
    setSpotify(data);
    saveStats("spotify", data);
  };

  const handleYouTubeData = (data: any) => {
    setYoutube(data);
    saveStats("youtube", data);
  };

  const handleLogout = () => {
    signOut(auth);
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 border-4 border-white border-t-transparent animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">INITIALIZING SYSTEM...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 md:p-12 space-y-12 animate-in slide-in-from-bottom duration-700 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-12">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="font-mono text-sm uppercase tracking-widest">LIVE_DASHBOARD</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none break-all">
            {spotify?.name || "ARTIST"} <span className="text-white">OS.</span>
          </h1>
        </div>
        <button 
          onClick={handleLogout}
          className="text-zinc-500 hover:text-white transition-colors uppercase font-mono tracking-widest text-sm text-left"
        >
          [ LOGOUT ]
        </button>
      </header>

      <section className="space-y-6">
         <h2 className="font-black uppercase tracking-tight text-xl">DATA SYNC</h2>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpotifyInput onData={handleSpotifyData} />
            <YouTubeInput onData={handleYouTubeData} />
         </div>
      </section>

      <section className="space-y-6 pt-6 border-t border-zinc-800">
         <h2 className="font-black uppercase tracking-tight text-xl">ARTIST VITALS</h2>
         <ArtistStats spotify={spotify} youtube={youtube} />
      </section>
      
      {(spotify || youtube) && (
        <section className="space-y-6 pt-6 border-t border-zinc-800 max-w-2xl mx-auto">
            <AICaptionComponent spotify={spotify} youtube={youtube} />
        </section>
      )}

      <div className="pt-12 border-t border-zinc-800 text-center opacity-20">
        <p className="font-mono text-xs uppercase tracking-widest leading-none">
          SYSTEM_ID: {user?.uid?.slice(0, 8)} // OUTLANDIA // ALL RIGHTS RESERVED
        </p>
      </div>
    </main>
  );
}
