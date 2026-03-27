"use client";

import { useState, useEffect } from "react";
import { auth, db, doc, updateDoc, setDoc, getDocs, collection, addDoc, serverTimestamp, getDoc, deleteDoc } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ROLLOUT_TEMPLATES } from "../../lib/tasks-engine";
import { OutlandiaLogo } from "../../components/OutlandiaLogo";


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
      setErrorMsg("Invalid Spotify Link: Please use open.spotify.com/artist/ format");
      return;
    }
    if (!links.youtube || (!links.youtube.includes("youtube.com/channel/") && !links.youtube.includes("youtube.com/@"))) {
      setErrorMsg("Invalid YouTube Link: Please use youtube.com/@ format");
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
        phase: "Phase 1 Ingestion",
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
            <div className="w-4 h-4 bg-white/20 animate-pulse" />
            <div className="w-4 h-4 bg-white/40 animate-pulse [animation-delay:0.1s]" />
            <div className="w-4 h-4 bg-white/60 animate-pulse [animation-delay:0.2s]" />
        </div>
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 antialiased">
          OUTLANDIA
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center font-inter pt-24 pb-32">
        <div className="max-w-2xl w-full border border-white/10 p-8 md:p-16 relative overflow-hidden animate-in zoom-in-95 duration-500 bg-black shadow-[0_0_100px_rgba(255,255,255,0.02)] rounded-none">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20"></div>
            
            {onboardingStep === -1 && (
                <div className="animate-in fade-in slide-in-from-bottom-5">
                    <div className="mb-16 flex flex-col items-center">
                        <OutlandiaLogo />
                        <div className="w-12 h-[0.5px] bg-white/20 mb-8 mt-4" />
                    </div>

                    <form onSubmit={handleLinkSubmit} className="space-y-6">
                        {[
                          { label: "Spotify Artist Link", key: "spotify", placeholder: "https://open.spotify.com/artist/...", type: "url" },
                          { label: "YouTube Channel Link", key: "youtube", placeholder: "https://www.youtube.com/@...", type: "url" },
                          { label: "Instagram Handle", key: "instagram", placeholder: "@username", type: "text" },
                          { label: "TikTok Handle", key: "tiktok", placeholder: "@username", type: "text" },
                          { label: "Facebook Link", key: "facebook", placeholder: "https://facebook.com/...", type: "url" }
                        ].map((field) => (
                            <div key={field.key} className="space-y-2">
                                <label className="font-inter text-[9px] font-black uppercase tracking-[0.3em] text-white/20">{field.label}</label>
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={links[field.key as keyof typeof links]}
                                    onChange={(e) => setLinks({...links, [field.key]: e.target.value})}
                                    className="w-full bg-zinc-900 border-2 border-white/10 p-5 text-white uppercase font-manrope font-black text-lg outline-none focus:border-white transition-all rounded-none"
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="w-full bg-white text-black py-6 mt-12 font-inter font-black uppercase tracking-[0.5em] text-[10px] hover:bg-neutral-200 transition-all tap-scale rounded-none"
                        >
                            CONNECT
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
                                className="mb-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] hover:text-white transition-all flex items-center gap-2 tap-scale"
                            >
                                ← Back
                            </button>
                        )}
                        {onboardingStep === 0 && (
                            <button 
                                onClick={() => setOnboardingStep(-1)}
                                className="mb-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] hover:text-white transition-all flex items-center gap-2 tap-scale"
                            >
                                ← Edit Links
                            </button>
                        )}
                        <p className="text-[9px] font-bold text-white/10 tracking-[0.4em] mb-12 uppercase">{onboardingStep + 1} / 6</p>
                        <h2 className="text-4xl md:text-5xl font-manrope font-bold tracking-tighter uppercase leading-tight border-l-[1px] border-white/10 pl-8">
                            {onboardingStep === 0 && "Next Project"}
                            {onboardingStep === 1 && "Project Timeline"}
                            {onboardingStep === 2 && "Visual Direction"}
                            {onboardingStep === 3 && "Team Structure"}
                            {onboardingStep === 4 && "Strategic Focus"}
                            {onboardingStep === 5 && "Complete Setup"}
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {onboardingStep === 0 && (
                            <div className="grid grid-cols-1 gap-4">
                            {["Single", "EP", "Album"].map(opt => (
                                <button key={opt} onClick={() => { setOnboardingData({...onboardingData, projectType: opt.toUpperCase()}); setOnboardingStep(1); }} className="bg-black border border-white/10 p-8 text-left hover:bg-neutral-900 transition-all group active:scale-[0.98] rounded-none">
                                <span className="text-2xl font-manrope font-bold uppercase tracking-tight">{opt}</span>
                                </button>
                            ))}
                            </div>
                        )}

                        {onboardingStep === 1 && (
                            <div className="space-y-8">
                            <input 
                                type="range" min="2" max="24" step="1"
                                className="w-full accent-white"
                                value={onboardingData.leadTime}
                                onChange={(e) => setOnboardingData({...onboardingData, leadTime: parseInt(e.target.value)})}
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-3xl font-manrope font-bold text-white">{onboardingData.leadTime} WEEKS</span>
                                <button onClick={() => setOnboardingStep(2)} className="bg-white text-black px-10 py-4 font-bold text-[9px] uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all rounded-none">NEXT</button>
                            </div>
                            </div>
                        )}

                        {onboardingStep === 2 && (
                            <div className="grid grid-cols-1 gap-4">
                            {["Music Video", "Short-form Content"].map(opt => (
                                <button key={opt} onClick={() => { setOnboardingData({...onboardingData, visualAssets: opt.toUpperCase()}); setOnboardingStep(3); }} className="bg-black border border-white/10 p-8 text-left hover:bg-neutral-900 transition-all active:scale-[0.98] rounded-none">
                                <span className="text-2xl font-manrope font-bold uppercase tracking-tight">{opt}</span>
                                </button>
                            ))}
                            </div>
                        )}

                        {onboardingStep === 3 && (
                            <div className="grid grid-cols-1 gap-4">
                            {["Featured Artists", "Solo Project"].map(opt => (
                                <button key={opt} onClick={() => { setOnboardingData({...onboardingData, collaborators: opt.toUpperCase()}); setOnboardingStep(4); }} className="bg-black border border-white/10 p-8 text-left hover:bg-neutral-900 transition-all active:scale-[0.98] rounded-none">
                                <span className="text-2xl font-manrope font-bold uppercase tracking-tight">{opt}</span>
                                </button>
                            ))}
                            </div>
                        )}

                        {onboardingStep === 4 && (
                            <div className="grid grid-cols-1 gap-4">
                            {["TikTok Reels", "Spotify Growth", "Fan Portal"].map(opt => (
                                <button key={opt} onClick={() => { setOnboardingData({...onboardingData, marketingFocus: opt.toUpperCase()}); setOnboardingStep(5); }} className="bg-black border border-white/10 p-8 text-left hover:bg-neutral-900 transition-all active:scale-[0.98] rounded-none">
                                <span className="text-2xl font-manrope font-bold uppercase tracking-tight">{opt}</span>
                                </button>
                            ))}
                            </div>
                        )}

                        {onboardingStep === 5 && (
                            <div className="py-12 space-y-12">
                                <p className="text-[10px] font-bold text-white/20 tracking-[0.5em] uppercase leading-[2] text-center max-w-xs mx-auto">
                                    Initializing your creative workspace.<br/>
                                    Building your roadmap.
                                </p>
                                <button 
                                onClick={handleFinalSubmit}
                                disabled={initializing}
                                className="w-full bg-white text-black py-8 font-bold text-[10px] uppercase tracking-[0.6em] hover:bg-neutral-200 transition-all tap-scale shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-none"
                                >
                                {initializing ? "Synchronizing..." : "Start Journey"}
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
