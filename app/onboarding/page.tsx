"use client";

import { useState, useEffect } from "react";
import { auth, db, doc, updateDoc, setDoc, getDocs, collection, addDoc, serverTimestamp, getDoc, deleteDoc } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ROLLOUT_TEMPLATES } from "../../lib/tasks-engine";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Link Matrix State
  const [onboardingStep, setOnboardingStep] = useState(-1);
  const [links, setLinks] = useState({
    spotify: "",
    youtube: "",
    instagram: "",
    tiktok: "",
    facebook: ""
  });

  // Diagnostic State
  const [onboardingData, setOnboardingData] = useState({
    projectType: "SINGLE",
    leadTime: 8, // weeks
    visualAssets: "MUSIC_VIDEO",
    collaborators: "YES",
    marketingFocus: "TIKTOK_REELS"
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check if user already completed onboarding
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data()?.onboardingComplete) {
            router.push("/dashboard");
          } else {
            setLoading(false);
          }
        } catch (err) {
          setLoading(false);
        }
      } else {
        router.push("/login");
      }
    });
    
    return () => unsubscribeAuth();
  }, [router]);

  const sanitizeHandle = (val: string) => {
    if (!val) return "";
    let clean = val.split('?')[0];
    clean = clean.replace(/\/$/, "");
    const parts = clean.split('/');
    let handle = parts[parts.length - 1];
    return handle.startsWith('@') ? handle : `@${handle}`;
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!links.spotify || (!links.spotify.includes("open.spotify.com/artist/") && !links.spotify.startsWith("spotify:artist:"))) {
      setErrorMsg("INVALID_SPOTIFY_LINK: MUST_MATCH open.spotify.com/artist/ OR spotify:artist:");
      return;
    }
    if (!links.youtube || (!links.youtube.includes("youtube.com/channel/") && !links.youtube.includes("youtube.com/@"))) {
      setErrorMsg("INVALID_YOUTUBE_LINK: MUST_MATCH youtube.com/channel/ OR youtube.com/@");
      return;
    }

    setLinks(prev => ({
      ...prev,
      instagram: sanitizeHandle(prev.instagram),
      tiktok: sanitizeHandle(prev.tiktok)
    }));

    setErrorMsg("");
    setOnboardingStep(0); // Move to First Diagnostic Question
  };

  const handleFinalSubmit = async () => {
    if (!user) return;
    setInitializing(true);

    try {
      // Wipe tasks, vault, calendar
      const tasksSnap = await getDocs(collection(db, "tasks", user.uid, "items"));
      let batchDeletes: Promise<void>[] = [];
      tasksSnap.forEach((d) => batchDeletes.push(deleteDoc(d.ref)));

      const vaultSnap = await getDocs(collection(db, "vault", user.uid, "items"));
      vaultSnap.forEach((d) => batchDeletes.push(deleteDoc(d.ref)));

      const calSnap = await getDocs(collection(db, "calendar", user.uid, "items"));
      calSnap.forEach((d) => batchDeletes.push(deleteDoc(d.ref)));

      await Promise.all(batchDeletes);

      // Initialize 54-Item Master Stack based on Diagnostic
      const batchCreates = ROLLOUT_TEMPLATES.map(async (template) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + template.daysOffset);
        
        await addDoc(collection(db, "tasks", user.uid, "items"), {
          text: template.text,
          phase: template.phase,
          priority: template.priority,
          category: template.category,
          dueDate: dueDate.toISOString(),
          completed: false,
          createdAt: serverTimestamp()
        });
      });
      
      await Promise.all(batchCreates);

      // Save user data & links, and mark onboarding check
      await setDoc(doc(db, "users", user.uid), {
        onboardingComplete: true,
        links: {
            spotify: links.spotify,
            youtube: links.youtube,
            instagram: links.instagram,
            tiktok: links.tiktok,
            facebook: links.facebook
        },
        diagnostic: onboardingData,
        phase: "PHASE_1 INGESTION",
        objective: "UPLOAD PRIMARY MASTER ASSETS"
      }, { merge: true });

      // Navigate to Dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error initializing rollout:", err);
    } finally {
      setInitializing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black font-inter text-white">
        <div className="w-12 h-1 gap-2 flex items-center">
            <div className="w-4 h-4 bg-vibrant-yellow animate-bounce" />
            <div className="w-4 h-4 bg-white animate-bounce [animation-delay:0.1s]" />
            <div className="w-4 h-4 bg-vibrant-yellow animate-bounce [animation-delay:0.2s]" />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">CHECKING_CLEARANCE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center font-inter pt-24 pb-32">
        <div className="max-w-2xl w-full border-4 border-white p-8 md:p-16 relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute top-0 left-0 w-full h-2 bg-vibrant-yellow shadow-[0_0_20px_#FFFF00]"></div>
            
            {onboardingStep === -1 && (
                <div className="animate-in fade-in slide-in-from-bottom-5">
                    <div className="mb-12">
                        <p className="text-[10px] font-black text-vibrant-yellow tracking-[0.5em] mb-4 uppercase italic">INITIALIZATION_REQUIRED</p>
                        <h2 className="text-4xl md:text-6xl font-manrope font-black italic tracking-tighter uppercase leading-none border-l-8 border-white pl-6">
                            THE_LINK_MATRIX
                        </h2>
                        <p className="font-inter text-xs text-white/40 mt-4 tracking-widest uppercase mb-8">
                            SYSTEM_DATE: MARCH 27, 2026<br/>
                            PROVIDE_SOURCE_OF_TRUTH_COORDINATES
                        </p>
                    </div>

                    <form onSubmit={handleLinkSubmit} className="space-y-6">
                        {[
                          { label: "SPOTIFY_ARTIST_LINK", key: "spotify", placeholder: "https://open.spotify.com/artist/...", type: "url" },
                          { label: "YOUTUBE_CHANNEL_LINK", key: "youtube", placeholder: "https://www.youtube.com/@...", type: "url" },
                          { label: "INSTAGRAM_HANDLE", key: "instagram", placeholder: "@username", type: "text" },
                          { label: "TIKTOK_HANDLE", key: "tiktok", placeholder: "@username", type: "text" },
                          { label: "FACEBOOK_LINK", key: "facebook", placeholder: "https://facebook.com/...", type: "url" }
                        ].map((field) => (
                            <div key={field.key} className="space-y-2">
                                <label className="font-inter text-[9px] font-black uppercase tracking-widest text-white/40">{field.label}</label>
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={links[field.key as keyof typeof links]}
                                    onChange={(e) => setLinks({...links, [field.key]: e.target.value})}
                                    className="w-full bg-zinc-900 border-2 border-white/10 p-5 text-white uppercase font-manrope font-black text-lg outline-none focus:border-vibrant-yellow transition-all"
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="w-full bg-white text-black py-8 mt-12 font-inter font-black uppercase tracking-[0.4em] text-xs hover:bg-vibrant-yellow transition-all shadow-2xl active:scale-[0.98]"
                        >
                            INITIALIZE_DATA_SYNC
                        </button>
                        {errorMsg && (
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center mt-4">
                                {errorMsg}
                            </p>
                        )}
                    </form>
                </div>
            )}

            {onboardingStep >= 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-5">
                    <div className="mb-12">
                        {onboardingStep > 0 && (
                            <button 
                                onClick={() => setOnboardingStep(prev => prev - 1)}
                                className="mb-8 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
                            >
                                ← RETURN
                            </button>
                        )}
                        {onboardingStep === 0 && (
                            <button 
                                onClick={() => setOnboardingStep(-1)}
                                className="mb-8 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
                            >
                                ← EDIT_LINKS
                            </button>
                        )}
                        <p className="text-[10px] font-black text-vibrant-yellow tracking-[0.5em] mb-4 uppercase italic">MISSION_DIAGNOSTIC // STEP_0{onboardingStep + 1}</p>
                        <h2 className="text-5xl md:text-7xl font-manrope font-black italic tracking-tighter uppercase leading-none border-l-8 border-white pl-6">
                            {onboardingStep === 0 && "PROJECT_TYPE"}
                            {onboardingStep === 1 && "LEAD_TIME"}
                            {onboardingStep === 2 && "VISUAL_ASSETS"}
                            {onboardingStep === 3 && "COLLABORATORS"}
                            {onboardingStep === 4 && "MARKETING_FOCUS"}
                            {onboardingStep === 5 && "CALIBRATION_READY"}
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {onboardingStep === 0 && (
                            <div className="grid grid-cols-1 gap-4">
                            {["SINGLE", "EP", "ALBUM"].map(opt => (
                                <button key={opt} onClick={() => { setOnboardingData({...onboardingData, projectType: opt}); setOnboardingStep(1); }} className="bg-black border-2 border-white/20 p-8 text-left hover:bg-white hover:text-black transition-all group active:scale-95">
                                <span className="text-3xl font-manrope font-black italic uppercase tracking-tighter">{opt}</span>
                                </button>
                            ))}
                            </div>
                        )}

                        {onboardingStep === 1 && (
                            <div className="space-y-8">
                            <input 
                                type="range" min="2" max="24" step="1"
                                className="w-full accent-vibrant-yellow"
                                value={onboardingData.leadTime}
                                onChange={(e) => setOnboardingData({...onboardingData, leadTime: parseInt(e.target.value)})}
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-4xl font-manrope font-black italic text-white">{onboardingData.leadTime} WEEKS</span>
                                <button onClick={() => setOnboardingStep(2)} className="bg-white text-black px-10 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-vibrant-yellow transition-all">NEXT_STEP</button>
                            </div>
                            </div>
                        )}

                        {onboardingStep === 2 && (
                            <div className="grid grid-cols-1 gap-4">
                            {["MUSIC VIDEO", "BTS / SHORT-FORM"].map(opt => (
                                <button key={opt} onClick={() => { setOnboardingData({...onboardingData, visualAssets: opt}); setOnboardingStep(3); }} className="bg-black border-2 border-white/20 p-8 text-left hover:bg-white hover:text-black transition-all active:scale-95">
                                <span className="text-3xl font-manrope font-black italic uppercase tracking-tighter">{opt}</span>
                                </button>
                            ))}
                            </div>
                        )}

                        {onboardingStep === 3 && (
                            <div className="grid grid-cols-1 gap-4">
                            {["YES (FEATURED ARTISTS)", "NO (SOLO PROJECT)"].map(opt => (
                                <button key={opt} onClick={() => { setOnboardingData({...onboardingData, collaborators: opt}); setOnboardingStep(4); }} className="bg-black border-2 border-white/20 p-8 text-left hover:bg-white hover:text-black transition-all active:scale-95">
                                <span className="text-3xl font-manrope font-black italic uppercase tracking-tighter">{opt}</span>
                                </button>
                            ))}
                            </div>
                        )}

                        {onboardingStep === 4 && (
                            <div className="grid grid-cols-1 gap-4">
                            {["TIKTOK / REELS", "SPOTIFY GROWTH", "FAN PORTAL"].map(opt => (
                                <button key={opt} onClick={() => { setOnboardingData({...onboardingData, marketingFocus: opt}); setOnboardingStep(5); }} className="bg-black border-2 border-white/20 p-8 text-left hover:bg-white hover:text-black transition-all active:scale-95">
                                <span className="text-3xl font-manrope font-black italic uppercase tracking-tighter">{opt}</span>
                                </button>
                            ))}
                            </div>
                        )}

                        {onboardingStep === 5 && (
                            <div className="text-center py-12 space-y-12">
                                <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase leading-relaxed">
                                    THE_PURGE_PROTOCOL_INITIALIZED.<br/>
                                    WIPING_VAULT+TASK_DATA.<br/>
                                    54_TASK_ROLLOUT_ENGINE_READY.
                                </p>
                                <button 
                                onClick={handleFinalSubmit}
                                disabled={initializing}
                                className="w-full bg-[#FFFF00] text-black py-10 font-black text-xs uppercase tracking-[0.8em] shadow-[0_0_50px_rgba(255,255,0,0.5)] hover:bg-white transition-all active:scale-95"
                                >
                                {initializing ? "SYNCING_CORE_DATA..." : "START ROLLOUT"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
