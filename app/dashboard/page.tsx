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

import { withOnboardingGuard } from "../../components/withOnboardingGuard";

function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ tasks: 0, vault: 0 });
  const [recentVault, setRecentVault] = useState<any[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ spotify: null, youtube: null });
  const [userSettings, setUserSettings] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "SYNCING" | "ERROR">("IDLE");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Load persistent user preferences
          const userRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userRef);
          
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setUserSettings(data);
            
            if (!data.onboardingComplete) {
              router.push("/onboarding");
              return;
            }

            // Initial Sync
            if (data.youtubeAccessToken) {
               fetchStats(data.growthLinks?.youtube || null, data.youtubeAccessToken);
            }
            if (data.growthLinks?.spotify) {
               fetchSpotify(data.growthLinks.spotify);
            }
          } else {
            router.push("/onboarding");
            return;
          }

          // Real-time Subscriptions with Error Handling
          const tasksRef = collection(db, "tasks", currentUser.uid, "items");
          const vaultRef = collection(db, "vault", currentUser.uid, "items");

          const qTasks = query(tasksRef, orderBy("completed", "asc"), orderBy("dueDate", "asc"), limit(4));
          const unsubTasks = onSnapshot(qTasks, (s) => {
            setUrgentTasks(s.docs.map(d => ({ id: d.id, ...d.data() })));
            setCounts(prev => ({ ...prev, tasks: s.size }));
          }, (err) => {
            console.error("Task Snapshot Error:", err);
          });

          const qVault = query(vaultRef, orderBy("createdAt", "desc"), limit(5));
          const unsubVault = onSnapshot(qVault, (s) => {
            setRecentVault(s.docs.map(d => ({ id: d.id, ...d.data() })));
            setCounts(prev => ({ ...prev, vault: s.size }));
          }, (err) => {
            console.error("Vault Snapshot Error:", err);
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
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchSpotify = async (artistUrl: string) => {
    try {
      const res = await fetch(`/api/spotify?artistUrl=${encodeURIComponent(artistUrl)}`);
      const data = await res.json();
      setStats((prev: any) => ({ ...prev, spotify: data }));
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
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setStats((prev: any) => ({ ...prev, youtube: data }));
      
      // If we auto-detected a channelId, persist it
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-vibrant-yellow animate-bounce" />
            <div className="w-4 h-4 bg-white animate-bounce [animation-delay:0.1s]" />
            <div className="w-4 h-4 bg-vibrant-yellow animate-bounce [animation-delay:0.2s]" />
        </div>
        <p className="mt-8 text-[11px] font-black uppercase tracking-[0.5em] text-white/40 animate-pulse font-inter italic">SYSTEM_HANDSHAKE_INITIATED</p>
      </div>
    );
  }

  const tasksProgress = counts.tasks > 0 ? Math.round((urgentTasks.filter(t => t.completed).length / counts.tasks) * 100) : 0;
  const isSyncActive = stats.youtube || syncStatus === "SYNCING";

  return (
    <div className="bg-black text-white min-h-screen font-body selection:bg-vibrant-yellow selection:text-black">
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 animate-in fade-in slide-in-from-bottom-5 duration-1000">
        
        {/* EXECUTIVE HEADER */}
        <header className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between items-start gap-12 border-b-8 border-white pb-16">
          <div className="relative">
             <div className="absolute -top-12 left-0 text-[10px] font-black tracking-[0.6em] text-vibrant-yellow uppercase italic animate-pulse">
               STATION_NODE: 0x{user.uid.slice(-6).toUpperCase()}
             </div>
             <h1 className="text-8xl md:text-[140px] font-black italic tracking-tighter uppercase leading-[0.8] font-manrope">
                COMMAND<br />
                <span className="text-white/10 group-hover:text-vibrant-yellow transition-colors duration-500">CENTER</span>
             </h1>
          </div>
          
          <div className="flex flex-col lg:items-end gap-6 text-left lg:text-right">
            <div className="space-y-2">
                <div className="flex items-center lg:justify-end gap-4">
                    <div className="w-2 h-2 bg-vibrant-yellow animate-ping"></div>
                    <p className="text-sm font-black tracking-widest uppercase">ENCRYPTED_SESSION_ACTIVE</p>
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 leading-relaxed">
                   ROLLOUT_PULSE: {new Date().toLocaleTimeString()} MSK<br/>
                   LATENCY: 14ms // STATUS: NOMINAL
                </p>
            </div>
            <div className="flex gap-4">
                <div className="bg-white text-black px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-vibrant-yellow transition-all cursor-crosshair">SYS_LOGS</div>
                <div className="border border-white/20 px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:border-white transition-all cursor-pointer">AUTH_RENEW</div>
            </div>
          </div>
        </header>

        {/* BRUTALIST BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-min">
          
          {/* 01: MISSION PROGRESS (HERO) */}
          <div className="md:col-span-8 md:row-span-2 relative group perspective-1000">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-vibrant-yellow to-transparent z-20"></div>
            <div className="bento-item bg-black border-2 border-white/20 p-12 h-full flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 p-12 pointer-events-none">
                    <p className="text-[120px] font-black text-white/[0.03] leading-none select-none tracking-tighter">PHASE_{userSettings?.phase?.split(' ')[1] || "I"}</p>
                </div>

                <div className="relative z-10">
                    <p className="text-[10px] font-black tracking-[0.6em] text-vibrant-yellow mb-10 flex items-center gap-4">
                        <span className="w-12 h-0.5 bg-vibrant-yellow"></span>
                        EXECUTIVE_PHASE_MONITOR
                    </p>
                    <h3 className="text-6xl md:text-9xl font-extrabold italic tracking-tighter uppercase mb-6 font-manrope leading-[0.9]">
                        {userSettings?.phase || "BOOT_SEQUENCER"}
                    </h3>
                    <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3">
                        <span className="w-3 h-3 bg-vibrant-yellow rounded-full animate-pulse shadow-[0_0_15px_#FFFF00]"></span>
                        <p className="text-xs font-black tracking-widest uppercase text-white/60 font-inter">OBJECTIVE: {userSettings?.objective || "PENDING_DIAGNOSTIC"}</p>
                    </div>
                </div>

                <div className="relative z-10 mt-20">
                    <div className="flex justify-between items-end mb-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30">OPERATIONAL_COMPLETION</p>
                            <p className="text-4xl font-black italic tracking-tighter text-vibrant-yellow font-manrope">{tasksProgress}%</p>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/10 mb-2 italic">MAPPING_ROLLOUT_COORDINATES...</p>
                    </div>
                    <div className="w-full h-12 border-4 border-white/10 bg-black p-1">
                        <div 
                          className="h-full bg-vibrant-yellow relative transition-all duration-1000 ease-in-out group-hover:brightness-125"
                          style={{ width: `${tasksProgress || 5}%` }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* 02: YOUTUBE MACRO GROWTH */}
          <div 
            onClick={handleConnectYouTube}
            className={`md:col-span-4 md:row-span-1 bento-item bg-zinc-950 border-2 border-white/10 p-10 group cursor-pointer transition-all duration-500 overflow-hidden relative ${isSyncActive ? 'hover:border-vibrant-yellow' : 'hover:border-white'}`}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div className="p-4 bg-white text-black group-hover:bg-vibrant-yellow transition-colors group-active:scale-95 duration-200">
                        <span className="material-symbols-outlined text-3xl font-black">bar_chart</span>
                    </div>
                    <div className={`px-4 py-1.5 border-2 text-[9px] font-black tracking-widest uppercase transition-all duration-300 ${
                        syncStatus === 'SYNCING' ? 'border-vibrant-yellow text-vibrant-yellow animate-pulse bg-vibrant-yellow/10' :
                        syncStatus === 'ERROR' ? 'border-red-500 text-red-500 bg-red-500/10' :
                        stats.youtube ? 'border-vibrant-yellow/40 text-vibrant-yellow/60 group-hover:border-vibrant-yellow group-hover:text-vibrant-yellow' : 'border-white/10 text-white/20'
                    }`}>
                        {syncStatus === 'SYNCING' ? 'SYNC_ACTIVE' : syncStatus === 'ERROR' ? 'AUTH_FAIL' : stats.youtube ? 'GROWTH_LIVE' : 'LINK_CHANNEL'}
                    </div>
                </div>

                <div className="mt-8">
                    {stats.youtube ? (
                        <div className="space-y-1">
                            <p className="text-7xl font-black italic tracking-tighter leading-none font-manrope group-hover:scale-105 transition-transform duration-500 text-vibrant-yellow">
                                {Number(stats.youtube.subscribers).toLocaleString()}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">GLOBAL_SUBSCRIBERS</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-3xl font-black uppercase tracking-tighter leading-tight font-manrope">CONNECT_YOUTUBE<br/>OAUTH_2.0</p>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">REQUIRES_GOOGLE_HANDSHAKE</p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* 03: SPOTIFY PERSPECTIVE */}
          <div 
            onClick={() => router.push("/fans")}
            className="md:col-span-4 md:row-span-1 bento-item bg-zinc-950 border-2 border-white/10 p-10 group cursor-pointer hover:bg-vibrant-yellow hover:text-black hover:border-vibrant-yellow transition-all duration-500 overflow-hidden relative"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="flex justify-between items-start">
                    <div className="p-4 bg-white/5 border border-white/10 group-hover:bg-black group-hover:text-vibrant-yellow group-hover:border-black transition-all">
                        <span className="material-symbols-outlined text-3xl font-black">hearing</span>
                    </div>
                    <span className="text-[9px] font-black tracking-widest uppercase text-white/20 group-hover:text-black/60">DSP_ANALYTICS</span>
                </div>

                <div className="mt-8">
                     {stats.spotify ? (
                        <div className="space-y-1">
                            <p className="text-7xl font-black italic tracking-tighter leading-none font-manrope">
                                {stats.spotify.followers?.total?.toLocaleString() || "---"}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">SPOTIFY_AUDIENCE</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-3xl font-black uppercase tracking-tighter leading-tight font-manrope italic">LINK_SPOTIFY_URI</p>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest group-hover:text-black/40 italic">MAPPING_FOLLOWER_GRAPH</p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* 04: URGENT_DIRECTIVES (OPERATIONAL_QUEUE) */}
          <div className="md:col-span-12 bento-item border-2 border-white/10 bg-black p-12 overflow-hidden shadow-[20px_20px_0px_rgba(255,255,0,0.02)]">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-8 h-2 bg-vibrant-yellow"></div>
                        <p className="text-[11px] font-black text-vibrant-yellow uppercase tracking-[0.6em] italic animate-pulse">CRITICAL_MISSION_QUEUE</p>
                    </div>
                    <h3 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter font-manrope leading-none">DIRECTIVES</h3>
                </div>
                <div className="flex gap-4">
                    <div className="p-4 border-2 border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                       PENDING: {counts.tasks - urgentTasks.filter(t => t.completed).length}
                    </div>
                    <button 
                        onClick={() => router.push("/tasks")}
                        className="bg-white text-black px-10 py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-vibrant-yellow transition-all hover:-translate-y-1 hover:shadow-[0_10px_0_#FFF] active:translate-y-0"
                    >
                        ACCESS_TERMINAL_V2
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {urgentTasks.length === 0 ? (
                    <div className="col-span-full py-40 text-center border-4 border-dashed border-white/5 flex flex-col items-center justify-center gap-6">
                        <span className="material-symbols-outlined text-6xl text-white/10 font-black animate-spin">cycle</span>
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">NO_PENDING_DIRECTIVES // SYSTEM_IDLE</p>
                    </div>
                ) : urgentTasks.map((task, idx) => (
                  <div 
                    key={task.id} 
                    onClick={() => router.push("/tasks")}
                    className={`group border-2 p-10 transition-all duration-500 cursor-pointer flex flex-col justify-between aspect-square relative ${
                        task.completed 
                            ? 'opacity-20 grayscale bg-white/5 border-white/10 hover:opacity-40' 
                            : 'bg-zinc-950 border-white/10 hover:border-vibrant-yellow hover:scale-[1.02] hover:-rotate-2'
                    }`}
                  >
                     {task.priority === "High" && !task.completed && (
                        <div className="absolute top-0 right-0 p-1 bg-red-600">
                           <p className="text-[8px] font-black text-white uppercase px-2">URGENT</p>
                        </div>
                     )}
                     <div>
                        <div className="flex justify-between items-start mb-8">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-vibrant-yellow transition-colors italic">PRCL_0{idx + 100}</p>
                            <span className={`w-3 h-3 ${task.completed ? 'bg-white/20' : 'bg-vibrant-yellow animate-pulse shadow-[0_0_10px_#FFFF00]'}`}></span>
                        </div>
                        <p className={`text-3xl font-black uppercase tracking-tighter font-manrope leading-[1.1] ${task.completed ? 'line-through decoration-vibrant-yellow' : 'group-hover:translate-x-2 transition-transform'}`}>{task.text}</p>
                     </div>
                     <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">{task.phase}</p>
                        <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:bg-vibrant-yellow group-hover:text-black group-hover:border-vibrant-yellow transition-all">
                             <span className="material-symbols-outlined text-xl font-black">chevron_right</span>
                        </div>
                     </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 05: ASSET_INGESTION (EXPANDED) */}
          <div className="md:col-span-12 bento-item border-2 border-white/10 bg-zinc-950 p-16 relative overflow-hidden group">
             <div className="absolute -right-32 -bottom-32 w-[600px] h-[600px] bg-vibrant-yellow/[0.02] border border-vibrant-yellow/[0.05] rounded-full blur-3xl pointer-events-none group-hover:bg-vibrant-yellow/[0.05] transition-all duration-1000"></div>
             <div className="relative z-10 flex flex-col lg:flex-row gap-20">
                <div className="lg:w-1/3 space-y-8">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white text-black flex items-center justify-center font-black text-2xl">VA</div>
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter font-manrope">ASSET_VAULT</h3>
                   </div>
                   <p className="text-sm font-black text-white/40 leading-relaxed uppercase tracking-widest italic">
                     ENCRYPTED_INGESTION_MODULE v4.2 // 
                     AUTOMATIC_META_PROFILING // 
                     WAV_FLAC_MP3_SUPPORT
                   </p>
                   <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 border border-white/10 text-center">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">CAPACITY</p>
                            <p className="text-vibrant-yellow font-black text-xl">1.2 TB</p>
                        </div>
                        <div className="bg-white/5 p-4 border border-white/10 text-center">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">UPTIME</p>
                            <p className="text-vibrant-yellow font-black text-xl">99.9%</p>
                        </div>
                   </div>
                </div>
                <div className="flex-1 h-[340px] border-l-4 border-vibrant-yellow pl-1 lg:pl-20">
                    <VaultIngestor userId={user.uid} />
                </div>
             </div>
          </div>

        </div>
      </main>

      {/* FOOTER TICKER */}
      <footer className="mt-40 border-t-2 border-white/10 py-8 bg-black">
        <div className="flex overflow-hidden whitespace-nowrap">
            <div className="animate-marquee flex gap-20">
                {Array(10).fill(0).map((_, i) => (
                    <p key={i} className="text-[11px] font-black uppercase tracking-[0.8em] text-white/10">
                        SYSTEM_OPERATIONAL // ASSET_VAULT_ACTIVE // GROWTH_SYNC_STABLE // 0xCC{i}492837
                    </p>
                ))}
            </div>
        </div>
      </footer>
    </div>
  );
}

export default withOnboardingGuard(Dashboard);
