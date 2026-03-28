"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  auth, db, googleProvider, 
  signInWithPopup, doc, getDoc, setDoc, updateDoc, 
  collection, onSnapshot, query, orderBy, limit 
} from "../../lib/firebase";
import { onAuthStateChanged, GoogleAuthProvider } from "firebase/auth";
import VaultIngestor from "../../components/VaultIngestor";
import { OutlandiaLogo } from "../../components/OutlandiaLogo";
import { SilentSplash } from "../../components/SilentSplash";
import { withOnboardingGuard } from "../../components/withOnboardingGuard";
import { Task, VaultItem, UserSettings, UserStats, SpotifyStats, YouTubeStats } from "../../lib/types";

function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // Firebase User type is complex, often 'any' in simple setups
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ tasks: 0, vault: 0 });
  const [recentVault, setRecentVault] = useState<VaultItem[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<UserStats>({ spotify: null, youtube: null });
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "SYNCING" | "ERROR">("IDLE");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userRef);
          
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setUserSettings(data);
            
            if (data.onboardingComplete !== true) {
              router.replace("/onboarding");
              return;
            }

            if (data.youtubeAccessToken) {
               fetchStats(data.growthLinks?.youtube || null, data.youtubeAccessToken);
            }
            if (data.growthLinks?.spotify) {
               fetchSpotify(data.growthLinks.spotify);
            }
          } else {
            router.replace("/onboarding");
            return;
          }

          const tasksRef = collection(db, "users", currentUser.uid, "tasks");
          const vaultRef = collection(db, "users", currentUser.uid, "vault");

          const qTasks = query(tasksRef, orderBy("completed", "asc"), orderBy("dueDate", "asc"), limit(4));
          const unsubTasks = onSnapshot(qTasks, (s) => {
            setUrgentTasks(s.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
            setCounts(prev => ({ ...prev, tasks: s.size }));
          });

          const qVault = query(vaultRef, orderBy("createdAt", "desc"), limit(5));
          const unsubVault = onSnapshot(qVault, (s) => {
            setRecentVault(s.docs.map(d => ({ id: d.id, ...d.data() } as VaultItem)));
            setCounts(prev => ({ ...prev, vault: s.size }));
          });

          setLoading(false);
          return () => {
            unsubTasks();
            unsubVault();
          };
        } catch (err) {
          console.error("Dashboard Init Error:", err);
          setLoading(false);
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchSpotify = async (artistUrl: string) => {
    try {
      const res = await fetch(`/api/spotify?artistUrl=${encodeURIComponent(artistUrl)}`);
      const data: SpotifyStats = await res.json();
      setStats((prev) => ({ ...prev, spotify: data }));
    } catch (err) {
      console.error("Spotify Sync Error:", err);
    }
  };

  const fetchStats = async (channelId: string | null, accessToken: string) => {
    setSyncStatus("SYNCING");
    try {
      const url = channelId 
        ? `/api/youtube?channelId=${channelId}&accessToken=${accessToken}`
        : `/api/youtube?accessToken=${accessToken}`;
        
      const res = await fetch(url);
      const data: YouTubeStats = await res.json();
      if ((data as any).error) throw new Error((data as any).error);
      
      setStats((prev) => ({ ...prev, youtube: data }));
      
      if (!channelId && data.id && user) {
        await updateDoc(doc(db, "users", user.uid), {
          "growthLinks.youtube": data.id
        });
      }
      
      setSyncStatus("IDLE");
    } catch (err) {
      console.error("YouTube Sync Error:", err);
      setSyncStatus("ERROR");
    }
  };

  const handleConnectYouTube = async () => {
    if (!user) return;
    try {
      setSyncStatus("SYNCING");
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token) {
        await updateDoc(doc(db, "users", user.uid), {
          youtubeAccessToken: token
        });
        fetchStats(userSettings?.growthLinks?.youtube || null, token);
      }
    } catch (error) {
      console.error("YouTube Auth Error:", error);
      setSyncStatus("ERROR");
    }
  };

  if (loading || !user) {
    return <SilentSplash />;
  }

  const tasksProgress = counts.tasks > 0 ? Math.round((urgentTasks.filter(t => t.completed).length / counts.tasks) * 100) : 0;
  const isSyncActive = stats.youtube || syncStatus === "SYNCING";

  return (
    <div className="bg-black text-white min-h-screen font-inter selection:bg-white selection:text-black">
      <main className="max-w-[1200px] mx-auto px-6 pt-24 pb-32 animate-in fade-in duration-1000">
        
        <header className="mb-24 flex flex-col items-center text-center">
          <OutlandiaLogo />
          <div className="w-12 h-[1px] bg-white/10 mb-8 mt-4" />
        </header>

        {/* REFINED BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
          
          {/* Phase & Progress */}
          {/* Phase & Progress */}
          <div className="md:col-span-8 md:row-span-2 bento-item p-12 flex flex-col justify-between border border-white/5 bg-zinc-950/50 backdrop-blur-xl rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl">auto_awesome</span>
            </div>
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">Current Milestone</p>
              <h3 className="text-5xl md:text-6xl font-manrope font-bold tracking-tight leading-none">
                {userSettings?.phase || "Phase 01"}
              </h3>
            </div>

            <div className="mt-24 space-y-6">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">Roadmap</p>
                <p className="text-3xl font-manrope font-bold">{tasksProgress}%</p>
              </div>
              <div className="w-full h-1.5 bg-white/5 overflow-hidden rounded-full">
                <div 
                  className="h-full bg-white transition-all duration-1000 ease-in-out"
                  style={{ width: `${tasksProgress || 2}%` }}
                />
              </div>
            </div>
          </div>

          {/* Audience: YouTube */}
          <div 
            onClick={handleConnectYouTube}
            className="md:col-span-4 bento-item p-8 tap-scale cursor-pointer border border-white/5 bg-zinc-950/30 hover:bg-zinc-950/50 hover:border-white/20 transition-all rounded-3xl shadow-sm"
          >
            <div className="flex justify-between items-start mb-12">
              <span className="material-symbols-outlined text-xl opacity-40">play_circle</span>
              <div className={`px-2 py-0.5 border text-[9px] font-medium tracking-wider transition-all duration-300 rounded-lg ${
                syncStatus === 'SYNCING' ? 'border-accent text-accent' : 'border-white/10 text-white/30'
              }`}>
                {syncStatus === 'SYNCING' ? 'Syncing...' : 'YouTube'}
              </div>
            </div>

            {stats.youtube ? (
              <div>
                <p className="text-5xl font-manrope font-bold tracking-tighter leading-none">
                  {Number(stats.youtube.subscribers).toLocaleString()}
                </p>
                <p className="text-[10px] font-bold tracking-[0.2em] text-white/20 mt-2 uppercase">YouTube Reach</p>
              </div>
            ) : (
              <p className="text-xl font-manrope font-bold tracking-tight">Connect Channel</p>
            )}
          </div>

          {/* Audience: Spotify */}
          <div 
            onClick={() => router.push("/fans")}
            className="md:col-span-4 bento-item p-8 tap-scale cursor-pointer border border-white/5 bg-zinc-950/30 hover:bg-zinc-950/50 hover:border-white/20 transition-all rounded-3xl shadow-sm"
          >
            <div className="flex justify-between items-start mb-12">
              <span className="material-symbols-outlined text-xl opacity-40">sensors</span>
              <div className="px-2 py-0.5 border border-white/10 text-[9px] font-medium tracking-wider text-white/30 rounded-lg">
                Spotify
              </div>
            </div>

            {stats.spotify ? (
              <div className="space-y-1">
                <p className="text-5xl font-manrope font-bold tracking-tighter leading-none">
                  {stats.spotify.followers?.total?.toLocaleString() || "---"}
                </p>
                <p className="text-[10px] font-bold tracking-[0.2em] text-white/20 mt-2 uppercase">Spotify Reach</p>
              </div>
            ) : (
              <p className="text-xl font-manrope font-bold tracking-tight">Link Artist</p>
            )}
          </div>

          {/* Directives (Tasks) */}
          <div className="md:col-span-12 bento-item p-12 pt-16 rounded-3xl border border-white/5 bg-zinc-950/20">
            <div className="flex justify-between items-end mb-16 px-2">
              <h3 className="text-4xl font-manrope font-bold tracking-tight">Active Tasks</h3>
              <button 
                onClick={() => router.push("/tasks")}
                className="text-[10px] font-semibold tracking-widest text-white/40 hover:text-white transition-colors pb-1 border-b border-white/10"
              >
                Access all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {urgentTasks.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-10">
                  <p className="text-[11px] font-medium tracking-wider">No active tasks</p>
                </div>
              ) : (
                urgentTasks.map((task, idx) => (
                  <div 
                    key={task.id} 
                    onClick={() => router.push("/tasks")}
                    className={`p-6 flex flex-col justify-between aspect-square tap-scale cursor-pointer rounded-2xl transition-all ${
                      task.completed ? 'opacity-20 translate-y-2' : 'border border-white/5 bg-zinc-900/50 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-bold text-white/10">0{idx + 1}</p>
                      {!task.completed && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />}
                    </div>
                    <p className={`text-xl font-manrope font-bold tracking-tight leading-tight ${task.completed ? 'line-through' : ''}`}>{task.text}</p>
                    <p className="text-[10px] font-bold text-white/10 tracking-[0.2em] uppercase">{task.phase}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vault Preview */}
          <div className="md:col-span-12 bento-item p-12 bg-zinc-950/30 tap-scale cursor-pointer border border-white/5 hover:border-white/20 transition-all rounded-3xl shadow-sm" onClick={() => router.push("/vault")}>
             <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="md:w-1/3 space-y-4 text-center md:text-left">
                   <h3 className="text-4xl font-manrope font-bold tracking-tight">Vault</h3>
                   <p className="text-[11px] font-medium text-white/20 tracking-widest leading-relaxed">
                     Creative records & media
                   </p>
                </div>
                <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-5 gap-4 opacity-20">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="aspect-square border border-white/5 bg-black rounded-lg"></div>
                    ))}
                </div>
             </div>
          </div>

        </div>
      </main>

      <footer className="mt-32 pb-12 opacity-10">
        <div className="flex overflow-hidden whitespace-nowrap">
            <div className="animate-marquee flex gap-20">
                {Array(10).fill(0).map((_, i) => (
                    <p key={i} className="text-[9px] font-medium tracking-widest">
                        OUTLANDIA // ARTIST WORKSPACE // 2026 // VERSION 1.0.2
                    </p>
                ))}
            </div>
        </div>
      </footer>
    </div>
  );
}

export default withOnboardingGuard(Dashboard);
