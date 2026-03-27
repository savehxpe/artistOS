"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, collection, query, onSnapshot, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  platforms: string[];
  status: "TODAY" | "UPCOMING" | "PAST";
  caption?: string;
  image?: string;
  createdAt: any;
}

import { withOnboardingGuard } from "../../components/withOnboardingGuard";

function CalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    time: "12:00",
    platforms: ["INSTAGRAM"] as string[],
    caption: ""
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Subscribe to calendar events
        const eventsRef = collection(db, "calendar", currentUser.uid, "items");
        const q = query(eventsRef, orderBy("date", "asc"));
        
        const unsubscribeEvents = onSnapshot(q, (snapshot) => {
          const eventsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CalendarEvent[];
          
          setEvents(eventsData);
          if (eventsData.length > 0 && !selectedEvent) {
            setSelectedEvent(eventsData[0]);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching events:", error);
          setLoading(false);
        });

        return () => unsubscribeEvents();
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  const handleLogout = () => {
    signOut(auth);
    router.push("/login");
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !user) return;

    try {
      await addDoc(collection(db, "calendar", user.uid, "items"), {
        ...newEvent,
        status: new Date(newEvent.date) < new Date() ? "PAST" : "UPCOMING",
        createdAt: serverTimestamp(),
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800&h=800"
      });
      setNewEvent({
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        time: "12:00",
        platforms: ["INSTAGRAM"],
        caption: ""
      });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding event:", err);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "calendar", user.uid, "items", eventId));
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white font-inter">
        <div className="w-12 h-12 border-2 border-black border-t-vibrant-yellow animate-spin shadow-[0_0_15px_rgba(255,255,0,0.5)]" />
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-black/40 animate-pulse">SYNCHRONIZING_CONTENT_TIMELINE</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white font-body min-h-screen">
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 min-h-screen animate-in fade-in duration-1000 slide-in-from-bottom-5">
        {/* Screen Title */}
        <section className="mb-10">
          <p className="font-inter text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">CONTENT / STRATEGY</p>
          <div className="flex items-end justify-between">
            <h2 className="font-manrope font-extrabold text-6xl tracking-tighter border-l-8 border-vibrant-yellow pl-6 uppercase text-white leading-none italic">CALENDAR</h2>
          </div>
        </section>

        {/* Selected Event Preview (Hero-style if selected) */}
        {selectedEvent && (
          <section className="mb-12 group">
            <div className="relative aspect-video bg-zinc-900 overflow-hidden border-2 border-white shadow-2xl transition-all duration-700 group-hover:shadow-vibrant-yellow/10">
              <img 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                src={selectedEvent.image || "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800"} 
                alt={selectedEvent.title} 
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-lg p-8 text-white translate-y-2 group-hover:translate-y-0 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-vibrant-yellow text-black px-3 py-1 text-[9px] font-black tracking-widest uppercase border border-black shadow-sm">{selectedEvent.status}</span>
                  <span className="font-inter text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{selectedEvent.date} @ {selectedEvent.time}</span>
                </div>
                <h3 className="font-manrope font-black text-3xl uppercase tracking-tighter mb-2 group-hover:tracking-tight transition-all">{selectedEvent.title}</h3>
                <p className="font-inter text-[11px] text-white/50 uppercase tracking-[0.1em] line-clamp-1 group-hover:line-clamp-none transition-all">{selectedEvent.description}</p>
              </div>
            </div>
            {selectedEvent.caption && (
              <div className="mt-6 p-8 bg-zinc-950 border-4 border-white border-dashed relative italic text-xs font-inter text-white/70 group shadow-md hover:shadow-xl transition-all">
                 <div className="absolute -top-4 -left-4 bg-white text-black p-2 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                    <span className="material-symbols-outlined text-lg">psychology</span>
                 </div>
                 <p className="leading-relaxed">"{selectedEvent.caption}"</p>
              </div>
            )}
          </section>
        )}

        {/* Timeline Feed */}
        <div className="space-y-8">
          <div className="flex justify-between items-end border-b-4 border-white pb-4">
            <h3 className="font-manrope font-black text-sm uppercase tracking-[0.5em] text-white">SCHEDULED_ROLLOUTS</h3>
            <div className="flex items-center gap-2">
               <span className="font-inter text-[9px] font-black uppercase tracking-widest text-white/20">ORDER: CHRONO</span>
               <button className="material-symbols-outlined text-white/20 hover:text-white active:scale-90 transition-all">sort</button>
            </div>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="py-24 text-center border-4 border-dashed border-white/[0.03] bg-zinc-950">
                <span className="material-symbols-outlined text-4xl text-white/10 mb-4 font-black">calendar_month</span>
                <p className="font-inter text-[10px] font-black uppercase tracking-[0.3em] text-white/20">NO_EVENTS_PROGRAMMED</p>
              </div>
            ) : (
              events.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`group p-8 border-2 transition-all cursor-pointer flex items-center justify-between hover:shadow-2xl ${selectedEvent?.id === event.id ? "bg-white text-black border-white shadow-2xl translate-x-2" : "bg-black border-white/5 hover:border-white shadow-sm"}`}
                >
                  <div className="flex items-center gap-8">
                    <div className={`w-16 h-16 flex flex-col items-center justify-center font-manrope font-black transition-all border-2 ${selectedEvent?.id === event.id ? "bg-black text-white border-white" : "bg-zinc-900 border-white/5 text-white/20 group-hover:bg-white group-hover:text-black"}`}>
                      <span className="text-2xl leading-none">{event.date.split('-')[2]}</span>
                      <span className="text-[10px] uppercase tracking-widest font-black">{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div>
                      <h4 className="font-manrope font-black text-xl uppercase tracking-tighter group-hover:tracking-tight transition-all">{event.title}</h4>
                      <div className="flex gap-6 mt-2">
                        <span className={`font-inter text-[10px] font-black uppercase tracking-widest ${selectedEvent?.id === event.id ? "text-black/40" : "text-white/20"}`}>{event.time}</span>
                        <div className="flex gap-2">
                          {event.platforms?.map(p => (
                            <span key={p} className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 border ${selectedEvent?.id === event.id ? "border-black/10 text-black/30" : "border-white/10 text-white/30"}`}>{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEvent(event.id);
                    }}
                    className={`material-symbols-outlined text-2xl transition-all opacity-0 group-hover:opacity-100 hover:text-red-500 scale-90 hover:scale-110`}
                  >
                    delete_sweep
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Standard FAB */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-6 w-16 h-16 bg-vibrant-yellow text-black flex items-center justify-center shadow-[0_10px_30px_rgba(255,255,0,0.3)] hover:shadow-[0_15px_40px_rgba(255,255,0,0.5)] active:scale-90 transition-all z-40 group border-2 border-white"
        >
          <span className="material-symbols-outlined text-4xl font-black group-hover:rotate-90 transition-transform duration-300">add_circle</span>
        </button>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <form 
              onSubmit={handleAddEvent}
              className="w-full max-w-xl bg-black border-4 border-white p-12 md:p-16 space-y-12 shadow-[0_30px_100px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 relative overflow-hidden text-white"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-vibrant-yellow animate-pulse shadow-[0_0_20px_#FFFF00]"></div>
              
              <div className="flex items-center justify-between pb-8 border-b-4 border-white">
                <h3 className="font-manrope font-black uppercase tracking-tighter text-4xl italic">NEW_CONTENT_RELEASE</h3>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-white/20 hover:text-white transition-all active:scale-75"
                >
                  <span className="material-symbols-outlined text-4xl font-black">close</span>
                </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="font-inter text-[10px] font-black uppercase tracking-[0.5em] text-white/20">EVENT_IDENTIFIER</label>
                  <input 
                    autoFocus
                    placeholder="E.G. MV_DROP_PHASE_01"
                    className="w-full bg-transparent border-b-4 border-white/10 py-8 px-6 text-3xl font-manrope font-black uppercase tracking-tighter focus:outline-none focus:border-vibrant-yellow transition-all placeholder:opacity-5 text-white"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="font-inter text-[10px] font-black uppercase tracking-[0.5em] text-white/20">TARGET_DATE</label>
                    <input 
                      type="date"
                      className="w-full bg-zinc-900 border-2 border-white/10 p-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-vibrant-yellow text-white"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="font-inter text-[10px] font-black uppercase tracking-[0.5em] text-white/20">UTC_WINDOW</label>
                    <input 
                      type="time"
                      className="w-full bg-zinc-900 border-2 border-white/10 p-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-vibrant-yellow text-white"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="font-inter text-[10px] font-black uppercase tracking-[0.5em] text-white/20">CREATIVE_SYNOPSIS</label>
                  <textarea 
                    placeholder="ENTER_STRATEGY_NOTES..."
                    className="w-full bg-zinc-900 border-2 border-white/10 p-6 text-xs font-inter focus:outline-none focus:border-vibrant-yellow h-32 resize-none leading-relaxed placeholder:opacity-20 text-white"
                    value={newEvent.caption}
                    onChange={(e) => setNewEvent({ ...newEvent, caption: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-vibrant-yellow text-black py-10 font-inter font-black uppercase tracking-[0.5em] text-[10px] hover:bg-white transition-all disabled:opacity-30 shadow-[0_0_50px_rgba(255,255,0,0.3)] active:scale-[0.98] mt-6"
                disabled={!newEvent.title}
              >
                INITIALIZE_ROLLOUT_CYCLE
              </button>
            </form>
          </div>
        )}
      </main>
    </div>

  );
}

export default withOnboardingGuard(CalendarPage);
