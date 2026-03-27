"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, doc, getDoc, collection, query, onSnapshot, orderBy, limit } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

interface FanFeedback {
  id: string;
  username: string;
  message: string;
  time: string;
  avatar: string;
  aiSuggestion?: string;
}

import { withOnboardingGuard } from "../../components/withOnboardingGuard";

function FanPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<FanFeedback[]>([]);
  const [smsMessage, setSmsMessage] = useState("");
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [transmissionResult, setTransmissionResult] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (!userDoc.exists() || !userDoc.data()?.onboardingComplete) {
            router.push("/onboarding");
            return;
          }
        } catch (err) {
          console.error("Error checking onboarding status", err);
        }
        
        // Mocking feed for now to provide premium look immediately
        setFeed([
          {
            id: "1",
            username: "@jaxon_v01",
            message: "The visual direction for the new single is insane. Can we expect a physical drop soon? Berlin needs a pop-up.",
            time: "2M_AGO",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
            aiSuggestion: "Berlin is on the radar. Physicals Q3."
          },
          {
            id: "2",
            username: "@elara_lux",
            message: "That acoustic snippet on the story... please tell me that's on the Vault tonight. I've replayed it 50 times.",
            time: "14M_AGO",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
            aiSuggestion: "Keep an eye on the Vault at midnight EST."
          },
          {
            id: "3",
            username: "VIP_FAN: @mister_theory",
            message: "The bridge in 'Static' changed my life. We need the stems for a remix competition.",
            time: "1H_AGO",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
            aiSuggestion: "Love the remix idea. Forwarding to the EP."
          }
        ]);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  const handleSendSms = async () => {
    if (!smsMessage || isSendingSms) return;
    setIsSendingSms(true);
    setTransmissionResult(null);

    try {
      const response = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: smsMessage, targetCount: 12482 })
      });

      if (!response.ok) throw new Error("TRANSMISSION_DENIED");
      
      const data = await response.json();
      setTransmissionResult(data);
      setSmsMessage("");
      
      // Clear success message after 5 seconds
      setTimeout(() => setTransmissionResult(null), 5000);

    } catch (err) {
      alert("CRITICAL_FAILURE: UNABLE_TO_CONNECT_TO_NODE");
    } finally {
      setIsSendingSms(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black font-inter">
        <div className="w-12 h-12 border-2 border-white border-t-vibrant-yellow animate-spin shadow-[0_0_15px_#FFFF00]" />
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">CONNECTING_GLOBAL_NETWORK</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white font-body min-h-screen pb-40">
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 min-h-screen animate-in fade-in duration-1000 slide-in-from-bottom-5">
        {/* Screen Title */}
        <section className="mb-12">
          <p className="font-inter text-[10px] font-black uppercase tracking-[0.5em] text-vibrant-yellow mb-4 italic">COMMUNITY // ENGAGEMENT_PULSE</p>
          <div className="flex items-end justify-between border-b-8 border-white pb-8">
            <h2 className="font-manrope font-black text-6xl md:text-8xl tracking-tighter uppercase leading-none italic">FAN_PORTAL</h2>
            <div className="hidden md:block text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">STATUS: HYPERCONNECTED</p>
                <p className="text-vibrant-yellow font-black text-sm">NODE_ACTIVE_001</p>
            </div>
          </div>
        </section>

        {/* Global Stats Bento - AUDIENCE_SEGMENTATION_ENGINE */}
        <section className="mb-16">
            <div className="flex justify-between items-end border-b-4 border-white pb-6 mb-8">
                <h3 className="font-manrope font-black text-sm uppercase tracking-[0.5em] text-white italic">AUDIENCE_SEGMENTATION_ENGINE</h3>
                <div className="flex gap-4 items-center">
                    <span className="w-2 h-2 bg-vibrant-yellow rounded-full animate-pulse shadow-[0_0_10px_#FFFF00]"></span>
                    <span className="font-inter text-[10px] font-black uppercase tracking-widest text-white/40">SYNC_ACTIVE: MARCH 27, 2026</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:auto-rows-[160px]">
                {/* CONVERSION_HERO */}
                <div className="md:col-span-2 md:row-span-2 bg-zinc-950 p-10 border-2 border-white/10 group hover:border-vibrant-yellow transition-all relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-vibrant-yellow/[0.03] blur-3xl font-black"></div>
                    <div>
                        <p className="font-inter text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 relative z-10">CONVERSION_RATE</p>
                        <p className="font-inter text-xs text-vibrant-yellow font-black uppercase tracking-widest italic relative z-10">FOLLOWER_TO_LISTENER</p>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <span className="font-manrope font-black text-8xl md:text-[140px] text-vibrant-yellow leading-none tracking-tighter">12.4%</span>
                    </div>
                </div>

                {/* AUDIENCE_SPLIT */}
                <div className="md:col-span-1 md:row-span-1 bg-zinc-950 p-6 border-2 border-white/10 group hover:border-white transition-all relative overflow-hidden flex flex-col justify-center">
                    <p className="font-inter text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 relative z-10">SEGMENTATION</p>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest italic mb-1">
                                <span className="text-white/60">BROAD_REACH</span>
                                <span className="text-white">450K</span>
                            </div>
                            <div className="w-full h-2 bg-white/10"><div className="h-full bg-white/40 w-full"></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest italic mb-1">
                                <span className="text-vibrant-yellow border-b border-vibrant-yellow">CORE_ENGAGEMENT</span>
                                <span className="text-vibrant-yellow">56K</span>
                            </div>
                            <div className="w-full h-2 bg-white/10"><div className="h-full bg-vibrant-yellow w-[12.4%] shadow-[0_0_10px_#FFFF00]"></div></div>
                        </div>
                    </div>
                </div>

                {/* PLATFORM_INSIGHTS */}
                <div className="md:col-span-1 md:row-span-1 bg-zinc-950 p-6 border-2 border-white/10 group transition-all relative overflow-hidden flex flex-col justify-between">
                    <p className="font-inter text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 relative z-10">ENGAGEMENT_VELOCITY</p>
                    <div className="grid grid-cols-4 gap-2 h-full">
                        {['TK', 'IG', 'YT', 'SP'].map((plat) => (
                            <button key={plat} className="bg-black border-2 border-white/10 flex items-center justify-center font-black italic text-lg hover:border-vibrant-yellow hover:text-vibrant-yellow hover:shadow-[0_0_15px_#FFFF00] active:scale-95 transition-all text-white/40">
                                {plat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* SMS BLAST MODULE */}
        <section className="mb-16 bg-zinc-950 border-2 border-white/10 p-10 md:p-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-vibrant-yellow/[0.02] rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-vibrant-yellow text-black flex items-center justify-center font-black text-xl italic shadow-[0_0_15px_#FFFF00]">SMS</div>
                    <h3 className="font-manrope text-2xl font-black uppercase tracking-tighter italic">DIRECT_FAN_COMM_CHANNEL</h3>
                </div>
                
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">COMPOSE_SMS_BLAST</label>
                        <textarea 
                            value={smsMessage}
                            onChange={(e) => setSmsMessage(e.target.value)}
                            placeholder="INITIALIZE_DIRECT_TRANSMISSION..."
                            className="w-full bg-black border-2 border-white/10 p-8 text-lg font-inter focus:outline-none focus:border-vibrant-yellow min-h-[160px] resize-none leading-relaxed transition-all italic text-white placeholder:opacity-10"
                        />
                    </div>
                </div>

                {transmissionResult && (
                    <div className="mt-10 bg-black/60 border-2 border-vibrant-yellow p-8 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-between items-start mb-6 border-b border-vibrant-yellow/30 pb-4">
                            <div>
                                <h4 className="text-vibrant-yellow font-black text-xs uppercase tracking-widest italic">TRANSMISSION_REPORT: SUCCESS</h4>
                                <p className="text-[10px] text-white/40 mt-1 uppercase font-black tracking-tighter">ID: {transmissionResult.transmissionId} // T_STAMP: {transmissionResult.timestamp.split('T')[1].split('.')[0]}</p>
                            </div>
                            <span className="material-symbols-outlined text-vibrant-yellow text-4xl font-black">check_circle</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 p-4">
                                <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">NODES_REACHED</p>
                                <p className="text-xl font-black italic">{transmissionResult.metadata.nodesReached.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 p-4">
                                <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">COST_ELAPSED</p>
                                <p className="text-xl font-black italic text-vibrant-yellow font-manrope">${transmissionResult.metadata.costAccumulated.toFixed(2)}</p>
                            </div>
                            <div className="bg-white/5 p-4">
                                <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">THROUGHPUT</p>
                                <p className="text-xl font-black italic">{transmissionResult.metadata.throughput}</p>
                            </div>
                            <div className="bg-white/5 p-4">
                                <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">L_INDEX_PLUS</p>
                                <p className="text-xl font-black italic text-white/80">+0.14%</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-6 mt-10 md:mt-12 items-center justify-between">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                        TARGET: 12,482 PHONE_NUMBERS // COST: $0.012/MSG
                    </p>
                    <button 
                        onClick={handleSendSms}
                        disabled={!smsMessage || isSendingSms}
                        className={`w-full md:w-auto px-12 py-5 font-black text-[11px] uppercase tracking-[0.6em] transition-all active:scale-95 flex items-center justify-center gap-4 ${
                            isSendingSms ? "bg-white/10 text-white/40 cursor-not-allowed border-2 border-white/5" : "bg-vibrant-yellow text-black hover:bg-white shadow-[0_0_20px_#FFFF00] hover:shadow-[0_0_30px_#FFF] border-2 border-transparent"
                        }`}
                    >
                        {isSendingSms ? (
                            <>
                                <span className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin"></span>
                                TRANSMITTING_SATELLITE_FEED...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined font-black">send</span>
                                INITIALIZE_BLAST
                            </>
                        )}
                    </button>
                </div>
            </div>
        </section>

        {/* Fan Feedback Direct Feed */}
        <section className="space-y-10">
          <div className="flex justify-between items-end border-b-4 border-white pb-6">
            <h3 className="font-manrope font-black text-sm uppercase tracking-[0.5em] text-white italic">DIRECT_SATELLITE_FEED</h3>
            <div className="flex gap-4 items-center">
              <span className="w-2 h-2 bg-vibrant-yellow rounded-full animate-pulse shadow-[0_0_10px_#FFFF00]"></span>
              <span className="font-inter text-[10px] font-black uppercase tracking-widest text-white/40">LIVE_DATA_STREAM</span>
            </div>
          </div>

          <div className="space-y-8">
            {feed.map((item) => (
              <div key={item.id} className="group bg-zinc-950 transition-all border-2 border-white/5 hover:border-vibrant-yellow overflow-hidden">
                <div className="flex items-start gap-8 p-10 border-b border-white/5 group-hover:border-vibrant-yellow/20 transition-colors">
                  <div className="relative flex-none">
                    <img src={item.avatar} alt={item.username} className="w-20 h-20 object-cover grayscale group-hover:grayscale-0 transition-all duration-700 border-2 border-white/10 shadow-lg" />
                    {item.username.includes("VIP") && <div className="absolute -top-2 -right-2 w-8 h-8 bg-vibrant-yellow text-black flex items-center justify-center border-2 border-black text-[12px] font-black shadow-xl italic">VIP</div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className={`font-manrope font-black text-xl uppercase tracking-tighter ${item.username.includes("VIP") ? "text-vibrant-yellow border-b-2 border-vibrant-yellow" : "text-white"}`}>
                        {item.username}
                      </h4>
                      <span className="font-inter text-[10px] opacity-20 uppercase font-black tracking-widest group-hover:opacity-100 transition-opacity italic">{item.time}</span>
                    </div>
                    <p className="font-body text-lg leading-relaxed text-white/60 group-hover:text-white transition-colors italic">"{item.message}"</p>
                  </div>
                </div>
                
                {/* AI Predictive Response Slot */}
                {item.aiSuggestion && (
                  <div className={`p-10 flex items-center justify-between transition-all cursor-pointer group/ai relative ${item.id === "1" ? "bg-white text-black" : "bg-vibrant-yellow text-black"}`}>
                    <div className="flex items-center gap-6">
                      <span className={`material-symbols-outlined text-4xl ${item.id === "1" ? "text-black" : "text-black animate-pulse"}`}>psychology_alt</span>
                      <div>
                        <p className={`text-[9px] font-black uppercase tracking-[0.5em] mb-2 ${item.id === "1" ? "opacity-40" : "opacity-40"}`}>AI_PREDICTOR_OUTPUT</p>
                        <span className="font-inter text-sm font-black uppercase tracking-widest italic leading-tight">"{item.aiSuggestion}"</span>
                      </div>
                    </div>
                    <div className={`w-14 h-14 flex items-center justify-center border-4 group-hover/ai:scale-110 transition-transform ${item.id === "1" ? "border-black text-black" : "border-black text-black"}`}>
                      <span className="material-symbols-outlined font-black text-3xl">send</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Global Loyalty Index */}
        <section className="mt-24 bg-zinc-950 p-12 border-4 border-white relative overflow-hidden group shadow-2xl">
          <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:opacity-10 transition-all duration-[3000ms] group-hover:rotate-45">
            <span className="material-symbols-outlined text-[300px] text-white font-black">hub</span>
          </div>
          <div className="flex justify-between items-baseline mb-10 relative z-10">
            <h2 className="font-manrope font-black text-3xl tracking-tighter text-white uppercase italic">FANBASE_LOYALTY_INDEX</h2>
            <div className="flex items-center gap-4">
              <span className="font-inter font-black text-2xl text-vibrant-yellow italic">LVL_88</span>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">HYPERCONNECTED</span>
            </div>
          </div>
          <div className="w-full h-6 bg-black border-2 border-white/20 overflow-hidden relative z-10">
            <div className="h-full bg-vibrant-yellow shadow-[0_0_30px_#FFFF00] w-[88%] relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)] bg-[length:40px_40px] animate-[slide_1s_linear_infinite]"></div>
            </div>
          </div>
          <div className="flex justify-between mt-8 relative z-10">
            <p className="font-inter text-[10px] font-black uppercase tracking-[0.4em] opacity-40">THRESHOLD_02: 25.0K REACH</p>
            <p className="font-inter text-[10px] font-black uppercase tracking-[0.4em] text-vibrant-yellow italic">ENHANCED_NODE_OUTPUT</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default withOnboardingGuard(FanPortalPage);
