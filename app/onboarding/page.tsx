"use client";

import { useState, useEffect } from "react";
import { auth, db, doc, updateDoc, setDoc, getDocs, collection, addDoc, serverTimestamp, getDoc, deleteDoc } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ROLLOUT_TEMPLATES } from "../../lib/tasks-engine";
import { OutlandiaLogo } from "../../components/OutlandiaLogo";
import { OutlandiaHeader } from "../../components/OutlandiaHeader";
import { StartRolloutButton } from "../../components/StartRolloutButton";
import { SilentSplash } from "../../components/SilentSplash";
import { TermsModal } from "../../components/TermsModal";
import { ProjectScope } from "../../components/ProjectScope";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
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
    projectType: "Single",
    leadTime: 8, // weeks
    creativeRecords: "Music Video",
    collaborators: "Yes",
    marketingFocus: ""
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check if user already completed onboarding
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const userData = userDoc.data();
          
          if (userDoc.exists() && userData?.onboardingComplete === true) {
            router.replace("/dashboard");
          } else {
            // Check if terms are accepted
            if (userData?.termsAccepted !== true) {
              setShowTerms(true);
            }
            setLoading(false);
          }
        } catch (err) {
          setLoading(false);
        }
      } else {
        router.replace("/");
      }
    });
    
    return () => unsubscribeAuth();
  }, [router]);

  const isValidHandle = (key: string, val: string) => {
    if (!val) return false;
    const clean = val.trim();
    if (key === "instagram" || key === "tiktok") {
      return clean.length >= 2; // Allow with or without '@'
    }
    // URLs for Spotify/YouTube/Facebook
    if (key === "spotify") {
      return clean.includes("open.spotify.com/artist/") || 
             clean.includes("spotify.link/") || 
             clean.startsWith("spotify:artist:");
    }
    if (key === "youtube") {
      return clean.includes("youtube.com/") || 
             clean.includes("youtu.be/");
    }
    if (key === "facebook") {
      return clean.includes("facebook.com/") || 
             clean.includes("fb.me/");
    }
    return clean.length > 3;
  };

  const sanitizeHandle = (key: string, val: string) => {
    if (!val) return "";
    if (key === "instagram" || key === "tiktok") {
        let clean = val.trim();
        if (clean.includes("/") ) {
            const parts = clean.split('?')[0].replace(/\/$/, "").split('/');
            clean = parts[parts.length - 1];
        }
        return clean.startsWith('@') ? clean : `@${clean}`;
    }
    return val.trim();
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Manual Entry: Simply sanitize and continue
    const finalLinks = {
        spotify: links.spotify,
        youtube: links.youtube,
        instagram: sanitizeHandle("instagram", links.instagram),
        tiktok: sanitizeHandle("tiktok", links.tiktok),
        facebook: links.facebook
    };

    setLinks(finalLinks);
    setErrorMsg("");
    setOnboardingStep(0); // Move to Diagnostic Phase
  };

  const handleAcceptTerms = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        termsAccepted: true,
        termsAcceptedAt: serverTimestamp()
      }, { merge: true });
      setShowTerms(false);
    } catch (err) {
      console.error("Error accepting terms:", err);
    }
  };

  const handleFinalSubmit = async () => {
    if (!user) return;
    setInitializing(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/onboarding/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          links,
          diagnosticData: onboardingData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize rollout");
      }

      // Navigate to Dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error initializing rollout:", err);
      setErrorMsg(err.message || "Failed to start rollout. Try again.");
      setInitializing(false);
    }
  };

  if (loading || !user) {
    return <SilentSplash />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-manrope overflow-x-hidden selection:bg-[#FFFF00] selection:text-black">
      <AnimatePresence mode="wait">
        {showTerms ? (
          <TermsModal key="terms" onAccept={handleAcceptTerms} />
        ) : (
          <motion.div
            key="onboarding-main"
            initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.8, ease: [0.11, 0, 0.5, 0] }} // circOut
            className="p-6 md:p-12 flex flex-col items-center justify-start pt-12 pb-32"
          >
            <div className="max-w-2xl w-full relative z-10">
              <AnimatePresence mode="wait">
                {onboardingStep === -1 ? (
                  <motion.div 
                    key="link-matrix"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center"
                  >
                    <OutlandiaHeader step="INITIALIZATION // STEP_01" className="mb-8" />
                    
                    <div className="w-full bg-zinc-900/40 p-10 md:p-16 rounded-[12px] border border-white/5 shadow-2xl backdrop-blur-md">
                      <div className="flex flex-col items-center text-center space-y-4 mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-white/90 uppercase italic">Connect Presence</h2>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-medium max-w-[280px] leading-relaxed">
                          Link your creative metadata for automatic vault synchronization
                        </p>
                      </div>

                      <form onSubmit={handleLinkSubmit} className="space-y-8">
                        {[
                          { label: "Spotify Artist Link", key: "spotify", placeholder: "https://open.spotify.com/artist/...", type: "url" },
                          { label: "YouTube Channel Link", key: "youtube", placeholder: "https://www.youtube.com/@...", type: "url" },
                          { label: "Instagram Handle", key: "instagram", placeholder: "@username", type: "text" },
                          { label: "TikTok Handle", key: "tiktok", placeholder: "@username", type: "text" },
                          { label: "Facebook Link", key: "facebook", placeholder: "https://facebook.com/...", type: "url" }
                        ].map((field) => {
                          const isValid = isValidHandle(field.key, links[field.key as keyof typeof links]);
                          return (
                            <div key={field.key} className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 ml-1">{field.label}</label>
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={links[field.key as keyof typeof links]}
                                onChange={(e) => setLinks({...links, [field.key]: e.target.value})}
                                className={`w-full bg-black/40 border ${isValid ? 'border-[#FFFF00] shadow-[0_0_25px_rgba(255,255,0,0.1)]' : 'border-white/5 shadow-none'} p-6 text-white placeholder:text-white/10 font-bold text-lg outline-none focus:border-white/20 focus:bg-zinc-900 transition-all rounded-[12px]`}
                              />
                            </div>
                          );
                        })}

                        <button
                          type="submit"
                          className="w-full bg-white text-black py-7 mt-12 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#FFFF00] transition-all active:scale-95 rounded-full outlandia-pulse shadow-2xl"
                        >
                          Continue to Parameters
                        </button>
                      </form>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="diagnostic-flow"
                    className="flex flex-col items-center w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <OutlandiaHeader step={`DIAGNOSTIC // PARAMETER 0${onboardingStep + 1}`} className="mb-8" />
                    
                    <div className="w-full max-w-2xl flex justify-between items-center mb-8 px-4">
                      <button 
                        onClick={() => setOnboardingStep(prev => prev - 1)}
                        className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] hover:text-white transition-all flex items-center gap-3 active:scale-95"
                      >
                        ← {onboardingStep === 0 ? "Edit Presence" : "Previous"}
                      </button>
                      <p className="text-[10px] font-bold text-white/10 tracking-[0.6em] uppercase">0{onboardingStep + 1} // 05</p>
                    </div>

                    <AnimatePresence mode="wait">
                      {onboardingStep === 0 && (
                        <ProjectScope 
                          key="step-0"
                          onSelect={(type) => {
                            setOnboardingData({...onboardingData, projectType: type});
                            setOnboardingStep(1);
                          }}
                          currentType={onboardingData.projectType}
                        />
                      )}

                      {onboardingStep === 1 && (
                        <motion.div 
                          key="step-1"
                          initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
                          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
                          transition={{ duration: 0.8, ease: [0.11, 0, 0.5, 0] }}
                          className="w-full space-y-16 bg-[#0A0A0A] p-10 md:p-16 rounded-[12px] border border-gray-900 shadow-2xl backdrop-blur-md"
                        >
                          <header className="mb-12">
                            <h2 className="text-[11px] text-[#FFFF00] font-inter uppercase tracking-[0.4em] mb-6 font-black">
                              DIAGNOSTIC // PARAMETER 02
                            </h2>
                            <p className="text-4xl md:text-5xl font-manrope font-bold text-white tracking-tighter leading-none italic uppercase">
                              Temporal Lead Time
                            </p>
                          </header>

                          <div className="space-y-12">
                            <div className="space-y-8">
                              <input 
                                type="range" min="2" max="24" step="1"
                                className="w-full accent-[#FFFF00] h-2 rounded-full cursor-pointer appearance-none bg-zinc-800"
                                value={onboardingData.leadTime}
                                onChange={(e) => setOnboardingData({...onboardingData, leadTime: parseInt(e.target.value)})}
                              />
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.4em] text-white/10">
                                <span>02 WEEKS (URGENT)</span>
                                <span>24 WEEKS (LONG RANGE)</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-8 border-t border-white/5">
                              <span className="text-6xl font-black text-white tracking-tighter italic">{onboardingData.leadTime} WKS</span>
                              <button 
                                onClick={() => setOnboardingStep(2)} 
                                className="bg-[#FFFF00] text-black px-16 py-6 font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white transition-all active:scale-95 rounded-full outlandia-pulse shadow-xl"
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {onboardingStep === 2 && (
                        <motion.div 
                          key="step-2"
                          initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
                          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
                          transition={{ duration: 0.8, ease: [0.11, 0, 0.5, 0] }}
                          className="w-full space-y-12 bg-[#0A0A0A] p-10 md:p-16 rounded-[12px] border border-gray-900 shadow-2xl"
                        >
                          <header className="mb-12">
                            <h2 className="text-[11px] text-[#FFFF00] font-inter uppercase tracking-[0.4em] mb-6 font-black">
                              DIAGNOSTIC // PARAMETER 03
                            </h2>
                            <p className="text-4xl md:text-5xl font-manrope font-bold text-white tracking-tighter leading-none italic uppercase">
                              Creative Assets
                            </p>
                          </header>
                          <div className="grid grid-cols-1 gap-4">
                            {["Music Video", "Short-Form Content"].map(opt => (
                              <button 
                                key={opt} 
                                onClick={() => { setOnboardingData({...onboardingData, creativeRecords: opt}); setOnboardingStep(3); }} 
                                className="group bg-zinc-900/40 border border-white/5 p-12 text-left hover:border-[#FFFF00] transition-all active:scale-[0.98] rounded-[12px] shadow-xl flex justify-between items-center"
                              >
                                <span className="text-3xl font-black text-white italic tracking-tight group-hover:text-[#FFFF00] transition-colors uppercase">{opt}</span>
                                <div className="w-8 h-8 rounded-full border border-white/10 group-hover:border-[#FFFF00] flex items-center justify-center transition-all">
                                  <div className="w-2 h-2 rounded-full bg-[#FFFF00] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {onboardingStep === 3 && (
                        <motion.div 
                          key="step-3"
                          initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
                          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
                          transition={{ duration: 0.8, ease: [0.11, 0, 0.5, 0] }}
                          className="w-full space-y-12 bg-[#0A0A0A] p-10 md:p-16 rounded-[12px] border border-gray-900 shadow-2xl"
                        >
                          <header className="mb-12">
                            <h2 className="text-[11px] text-[#FFFF00] font-inter uppercase tracking-[0.4em] mb-6 font-black">
                              DIAGNOSTIC // PARAMETER 04
                            </h2>
                            <p className="text-4xl md:text-5xl font-manrope font-bold text-white tracking-tighter leading-none italic uppercase">
                              Core Collaborators
                            </p>
                          </header>
                          <div className="grid grid-cols-1 gap-4">
                            {["Featured Artists", "Solo Project"].map(opt => (
                              <button 
                                key={opt} 
                                onClick={() => { setOnboardingData({...onboardingData, collaborators: opt}); setOnboardingStep(4); }} 
                                className="group bg-zinc-900/40 border border-white/5 p-12 text-left hover:border-[#FFFF00] transition-all active:scale-[0.98] rounded-[12px] shadow-xl flex justify-between items-center"
                              >
                                <span className="text-3xl font-black text-white italic tracking-tight group-hover:text-[#FFFF00] transition-colors uppercase">{opt}</span>
                                <div className="w-8 h-8 rounded-full border border-white/10 group-hover:border-[#FFFF00] flex items-center justify-center transition-all">
                                  <div className="w-2 h-2 rounded-full bg-[#FFFF00] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {onboardingStep === 4 && (
                        <motion.div 
                          key="step-4"
                          initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
                          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
                          transition={{ duration: 0.8, ease: [0.11, 0, 0.5, 0] }}
                          className="w-full space-y-12 bg-[#0A0A0A] p-10 md:p-16 rounded-[12px] border border-gray-900 shadow-2xl"
                        >
                          <header className="mb-12">
                            <h2 className="text-[11px] text-[#FFFF00] font-inter uppercase tracking-[0.4em] mb-6 font-black">
                              DIAGNOSTIC // PARAMETER 05
                            </h2>
                            <p className="text-4xl md:text-5xl font-manrope font-bold text-white tracking-tighter leading-none italic uppercase">
                              Growth Objective
                            </p>
                          </header>
                          <div className="grid grid-cols-1 gap-4">
                            {["TikTok Reels", "Spotify Growth", "Fan Portal"].map(opt => (
                              <button 
                                key={opt} 
                                onClick={() => setOnboardingData({...onboardingData, marketingFocus: opt})} 
                                className={`group bg-zinc-900/40 border p-12 text-left transition-all active:scale-[0.98] rounded-[12px] shadow-xl flex justify-between items-center ${
                                  onboardingData.marketingFocus === opt ? 'border-[#FFFF00] shadow-[0_0_30px_rgba(255,255,0,0.1)]' : 'border-white/5 hover:border-white/20'
                                }`}
                              >
                                <span className={`text-3xl font-black italic tracking-tight uppercase transition-colors ${
                                  onboardingData.marketingFocus === opt ? 'text-[#FFFF00]' : 'text-white'
                                }`}>{opt}</span>
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                  onboardingData.marketingFocus === opt ? 'border-[#FFFF00]' : 'border-white/10 group-hover:border-white/20'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full bg-[#FFFF00] transition-opacity ${
                                    onboardingData.marketingFocus === opt ? 'opacity-100' : 'opacity-0'
                                  }`} />
                                </div>
                              </button>
                            ))}
                          </div>

                          <AnimatePresence mode="wait">
                            {onboardingData.marketingFocus && (
                              <motion.div 
                                key="start-rollout"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="pt-24 space-y-16"
                              >
                                <div className="w-12 h-[1px] bg-[#FFFF00]/20 mx-auto" />
                                <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.4em] text-center max-w-sm mx-auto leading-relaxed antialiased">
                                  Your vault is cleared and your 54-step roadmap is prepared.
                                </p>
                                
                                <StartRolloutButton 
                                  onClick={handleFinalSubmit}
                                  disabled={initializing}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
