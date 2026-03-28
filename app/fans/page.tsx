"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, doc, getDoc, collection, query, onSnapshot, orderBy, limit } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { OutlandiaLogo } from "../../components/OutlandiaLogo";

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
            time: "2m ago",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
            aiSuggestion: "Berlin is on the radar. Physicals Q3."
          },
          {
            id: "2",
            username: "@elara_lux",
            message: "That acoustic snippet on the story... please tell me that's on the Vault tonight. I've replayed it 50 times.",
            time: "14m ago",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
            aiSuggestion: "Keep an eye on the Vault at midnight EST."
          },
          {
            id: "3",
            username: "VIP Fan: @mister_theory",
            message: "The bridge in 'Static' changed my life. We need the stems for a remix competition.",
            time: "1h ago",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
            aiSuggestion: "Love the remix idea. Forwarding to the EP."
          }
        ]);
        setLoading(false);
      } else {
        router.push("/");
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

      if (!response.ok) throw new Error("Broadcast Failed");
      
      const data = await response.json();
      setTransmissionResult(data);
      setSmsMessage("");
      
      // Clear success message after 5 seconds
      setTimeout(() => setTransmissionResult(null), 5000);

    } catch (err) {
      alert("Error: Unable to connect to server");
    } finally {
      setIsSendingSms(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black font-inter">
        <div className="w-12 h-1 gap-2 flex items-center">
            <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
            <div className="w-4 h-4 rounded-full bg-white/40 animate-pulse [animation-delay:0.1s]" />
            <div className="w-4 h-4 rounded-full bg-white/60 animate-pulse [animation-delay:0.2s]" />
        </div>
        <p className="mt-8 text-[10px] font-medium tracking-widest text-white/40 antialiased uppercase">
          Loading Feed
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white font-body min-h-screen pb-40">
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 min-h-screen animate-in fade-in duration-1000 slide-in-from-bottom-5">
        {/* Screen Title */}
        <header className="mb-24 flex flex-col items-center text-center">
          <OutlandiaLogo />
          <div className="w-12 h-[1px] bg-white/10 mt-8" />
        </header>

        {/* Global Stats Bento - Audience Insight Engine */}
        <section className="mb-16">
            <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-8">
                <h3 className="font-manrope font-black text-sm tracking-[0.3em] text-white">Insights</h3>
                <div className="flex gap-4 items-center">
                    <span className="font-inter text-[10px] font-black uppercase tracking-widest text-white/20">Updated: Today</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:auto-rows-[160px]">
                {/* Conversion Hero */}
                <div className="md:col-span-2 md:row-span-2 bg-zinc-950 p-10 border border-white/10 group hover:border-white transition-all relative overflow-hidden flex flex-col justify-between rounded-3xl">
                    <div>
                        <p className="font-inter text-[10px] font-black text-white/10 tracking-[0.3em] mb-2 relative z-10">Conversion</p>
                        <p className="font-inter text-xs text-white/40 font-black tracking-widest relative z-10">Engagement Efficiency</p>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <span className="font-manrope font-black text-8xl md:text-[140px] text-white leading-none tracking-tighter">12.4%</span>
                    </div>
                </div>

                {/* Audience Split */}
                <div className="md:col-span-1 md:row-span-1 bg-zinc-950 p-6 border border-white/10 group hover:border-white transition-all relative overflow-hidden flex flex-col justify-center rounded-3xl">
                    <p className="font-inter text-[10px] font-black text-white/10 tracking-[0.3em] mb-4 relative z-10">Audience</p>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 font-manrope">
                                <span className="text-white/20">Reach</span>
                                <span className="text-white/40">450K</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-white/10 w-full rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 font-manrope">
                                <span className="text-white">Active</span>
                                <span className="text-white">56K</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[12.4%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Platform Insights */}
                <div className="md:col-span-1 md:row-span-1 bg-zinc-950 p-6 border border-white/10 group transition-all relative overflow-hidden flex flex-col justify-between rounded-3xl">
                    <p className="font-inter text-[10px] font-black text-white/10 tracking-[0.3em] mb-4 relative z-10">Velocity</p>
                    <div className="grid grid-cols-4 gap-2 h-full">
                        {['TK', 'IG', 'YT', 'SP'].map((plat) => (
                            <button key={plat} className="bg-black border border-white/5 flex items-center justify-center font-black text-xs hover:border-white hover:text-white transition-all text-white/10 rounded-xl">
                                {plat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* SMS Blast Module */}
        <section className="mb-16 bg-zinc-950 border border-white/10 p-10 md:p-16 relative overflow-hidden group rounded-3xl">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold text-xs rounded-full shadow-lg">SMS</div>
                    <h3 className="font-manrope text-2xl font-bold tracking-tighter">Direct Broadcast</h3>
                </div>
                
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/10 tracking-[0.3em]">Message</label>
                        <textarea 
                            value={smsMessage}
                            onChange={(e) => setSmsMessage(e.target.value)}
                            placeholder="Type message..."
                            className="w-full bg-black border border-white/10 p-8 text-lg font-inter focus:outline-none focus:border-white min-h-[160px] resize-none leading-relaxed transition-all text-white placeholder:text-white/5 rounded-2xl"
                        />
                    </div>
                </div>

                {transmissionResult && (
                    <div className="mt-10 bg-black border border-white/20 p-8 animate-in slide-in-from-top-4 duration-500 rounded-2xl">
                        <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                            <div>
                                <h4 className="text-white font-black text-xs uppercase tracking-widest">Broadcast Sent</h4>
                                <p className="text-[10px] text-white/20 mt-1 uppercase font-black tracking-tighter">ID: {transmissionResult.transmissionId} // Time: {transmissionResult.timestamp.split('T')[1].split('.')[0]}</p>
                            </div>
                            <span className="material-symbols-outlined text-white text-4xl font-black">check_circle</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black uppercase text-white/10 tracking-widest mb-1">Recipients</p>
                                <p className="text-xl font-black">{transmissionResult.metadata.nodesReached.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black uppercase text-white/10 tracking-widest mb-1">Cost</p>
                                <p className="text-xl font-black font-manrope">${transmissionResult.metadata.costAccumulated.toFixed(2)}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black uppercase text-white/10 tracking-widest mb-1">Efficiency</p>
                                <p className="text-xl font-black">{transmissionResult.metadata.throughput}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black uppercase text-white/10 tracking-widest mb-1">Impact</p>
                                <p className="text-xl font-black text-white/40">+0.14%</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-6 mt-10 md:mt-12 items-center justify-between">
                    <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">
                        12,482 Recipients // $0.012 per message
                    </p>
                    <button 
                        onClick={handleSendSms}
                        disabled={!smsMessage || isSendingSms}
                        className={`w-full md:w-auto px-12 py-5 font-bold text-[11px] uppercase tracking-[0.6em] transition-all active:scale-95 flex items-center justify-center gap-4 rounded-full ${
                            isSendingSms ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5" : "bg-white text-black hover:bg-neutral-200 border border-transparent shadow-lg shadow-white/5"
                        }`}
                    >
                        {isSendingSms ? (
                            <>
                                <span className="w-4 h-4 border border-black/20 border-t-black animate-spin"></span>
                                Sending...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined font-black text-sm">send</span>
                                Send Broadcast
                            </>
                        )}
                    </button>
                </div>
            </div>
        </section>

        {/* Fan Feedback Direct Feed */}
        <section className="space-y-10">
          <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <h3 className="font-manrope font-black text-sm tracking-[0.3em] text-white">Live Feed</h3>
            <div className="flex gap-4 items-center">
              <span className="font-inter text-[10px] font-black uppercase tracking-widest text-white/10">Active Stream</span>
            </div>
          </div>

          <div className="space-y-8">
            {feed.map((item) => (
              <div key={item.id} className="group bg-zinc-950 transition-all border-2 border-white/5 hover:border-white/20 overflow-hidden rounded-3xl">
                <div className="flex items-start gap-8 p-10 border-b border-white/5 group-hover:border-white/10 transition-colors">
                  <div className="relative flex-none">
                    <img src={item.avatar} alt={item.username} className="w-20 h-20 object-cover grayscale group-hover:grayscale-0 transition-all duration-700 border border-white/10 rounded-full" />
                    {item.username.includes("VIP") && <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-black flex items-center justify-center border border-black text-[10px] font-black shadow-xl rounded-full">VIP</div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className={`font-manrope font-black text-lg uppercase tracking-tight ${item.username.includes("VIP") ? "text-white border-b border-white" : "text-white/60"}`}>
                        {item.username}
                      </h4>
                      <span className="font-inter text-[9px] opacity-10 uppercase font-black tracking-widest group-hover:opacity-40 transition-opacity">{item.time}</span>
                    </div>
                    <p className="font-body text-lg leading-relaxed text-white/40 group-hover:text-white transition-colors">"{item.message}"</p>
                  </div>
                </div>
                
                {/* AI Predictive Response Slot */}
                {item.aiSuggestion && (
                  <div className={`p-10 flex items-center justify-between transition-all cursor-pointer group/ai relative ${item.id === "1" ? "bg-white text-black opacity-80 hover:opacity-100 rounded-b-3xl" : "bg-zinc-800 text-white rounded-b-3xl"}`}>
                    <div className="flex items-center gap-6">
                      <span className="material-symbols-outlined text-4xl">creative_commons</span>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-2 opacity-20 font-manrope">Creative Insight</p>
                        <span className="font-inter text-sm font-black uppercase tracking-widest leading-tight">"{item.aiSuggestion}"</span>
                      </div>
                    </div>
                    <div className={`w-14 h-14 flex items-center justify-center border group-hover/ai:scale-110 transition-transform rounded-full ${item.id === "1" ? "border-black" : "border-white"}`}>
                      <span className="material-symbols-outlined font-black text-xl">north_east</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Global Loyalty Index */}
        <section className="mt-24 bg-zinc-950 p-12 border border-white/10 relative overflow-hidden group shadow-2xl rounded-3xl">
          <div className="flex justify-between items-baseline mb-10 relative z-10">
            <h2 className="font-manrope font-black text-3xl tracking-tighter text-white">Loyalty Index</h2>
            <div className="flex items-center gap-4">
              <span className="font-inter font-black text-2xl text-white">Tier 88</span>
              <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Qualified</span>
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-white w-[88%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
          </div>
          <div className="flex justify-between mt-8 relative z-10">
            <p className="font-inter text-[10px] font-black uppercase tracking-[0.4em] text-white/10">Threshold: 25.0K Reach</p>
            <p className="font-inter text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Active Growth</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default withOnboardingGuard(FanPortalPage);
