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
import { OutlandiaLogo } from "../../components/OutlandiaLogo";

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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black font-inter text-white">
        <div className="w-12 h-1 gap-2 flex items-center">
            <div className="w-4 h-4 rounded-none bg-white/20 animate-pulse" />
            <div className="w-4 h-4 rounded-none bg-white/40 animate-pulse [animation-delay:0.1s]" />
            <div className="w-4 h-4 rounded-none bg-white/60 animate-pulse [animation-delay:0.2s]" />
        </div>
        <p className="mt-8 text-[10px] font-medium tracking-widest text-white/40 antialiased">
          OUTLANDIA
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white font-body min-h-screen">
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 min-h-screen animate-in fade-in duration-1000 slide-in-from-bottom-5">
        {/* Screen Title */}
        <header className="mb-24 flex flex-col items-center text-center">
          <OutlandiaLogo />
          <div className="w-12 h-[1px] bg-white/10 mt-8" />
        </header>

        {/* Selected Event Preview */}
        {selectedEvent && (
          <section className="mb-12 group">
            <div className="relative aspect-video bg-zinc-950/50 overflow-hidden border border-white/5 shadow-2xl transition-all duration-700 hover:border-white/10 rounded-none">
              <img 
                className="w-full h-full object-cover transition-all duration-1000" 
                src={selectedEvent.image || "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800"} 
                alt={selectedEvent.title} 
              />
              <div className="absolute inset-x-4 bottom-4 bg-zinc-950/80 backdrop-blur-xl p-8 text-white rounded-none border border-white/5 shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-white text-black px-3 py-1 text-[9px] font-bold tracking-wider rounded-none uppercase">{selectedEvent?.status?.toLowerCase()}</span>
                  <span className="font-inter text-[10px] font-medium tracking-widest text-white/40">{selectedEvent?.date} @ {selectedEvent?.time}</span>
                </div>
                <h3 className="font-manrope font-bold text-3xl tracking-tight mb-2">{selectedEvent?.title}</h3>
                <p className="font-inter text-xs text-white/50 tracking-wide">{selectedEvent?.description}</p>
              </div>
            </div>
            {selectedEvent?.caption && (
              <div className="mt-8 p-10 bg-zinc-950 border border-white/10 relative italic text-[11px] font-inter text-white/50 group rounded-none shadow-xl">
                 <div className="absolute -top-4 -left-4 bg-white text-black w-10 h-10 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform rounded-none">
                    <span className="material-symbols-outlined text-lg">psychology</span>
                 </div>
                 <p className="leading-relaxed">"{selectedEvent?.caption}"</p>
              </div>
            )}
          </section>
        )}

        {/* Timeline Feed */}
        <div className="space-y-8">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <h3 className="font-manrope font-bold text-[10px] tracking-widest text-zinc-500 uppercase">Upcoming events</h3>
            <div className="flex items-center gap-2">
               <span className="font-inter text-[9px] font-medium tracking-widest text-zinc-600">Sort by date</span>
               <button className="material-symbols-outlined text-zinc-600 hover:text-white active:scale-90 transition-all">sort</button>
            </div>
          </div>

          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-white/5 bg-zinc-950/20 rounded-none backdrop-blur-sm">
                <span className="material-symbols-outlined text-4xl text-white/5 mb-4 font-black">calendar_month</span>
                <p className="font-inter text-[11px] font-medium tracking-widest text-zinc-600">No events scheduled</p>
              </div>
            ) : (
              events.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`group p-8 bento-item transition-all cursor-pointer flex items-center justify-between rounded-none ${selectedEvent?.id === event.id ? "bg-white text-black border-white shadow-xl scale-[1.01]" : "bg-zinc-950/30 border-white/5 hover:border-white/10 shadow-sm"}`}
                >
                  <div className="flex items-center gap-8">
                    <div className={`w-16 h-16 flex flex-col items-center justify-center font-manrope font-bold transition-all border rounded-none overflow-hidden ${selectedEvent?.id === event.id ? "bg-black text-white border-black" : "bg-zinc-900/50 border-white/5 text-zinc-400 group-hover:bg-zinc-800"}`}>
                      <span className="text-2xl leading-none">{event.date.split('-')[2]}</span>
                      <span className="text-[10px] font-semibold tracking-wider uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div>
                      <h4 className="font-manrope font-bold text-xl tracking-tight transition-all">{event.title}</h4>
                      <div className="flex gap-4 mt-2">
                        <span className={`font-inter text-[10px] font-medium tracking-widest ${selectedEvent?.id === event.id ? "text-black/40" : "text-zinc-600"}`}>{event.time}</span>
                        <div className="flex gap-2">
                          {event.platforms?.map(p => (
                            <span key={p} className={`text-[9px] font-semibold tracking-wider px-2 py-0.5 border rounded-none transition-colors ${selectedEvent?.id === event.id ? "border-black/5 text-black/30" : "border-white/5 text-zinc-500"}`}>{p?.toLowerCase()}</span>
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
                    className={`material-symbols-outlined text-sm transition-all opacity-0 group-hover:opacity-100 hover:text-red-400`}
                  >
                    delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Standard FAB */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-6 w-16 h-16 bg-white text-black flex items-center justify-center rounded-none shadow-2xl hover:scale-110 active:scale-90 transition-all z-40 group border border-black/10"
        >
          <span className="material-symbols-outlined text-2xl font-bold group-hover:rotate-90 transition-transform duration-300">add</span>
        </button>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
            <form 
              onSubmit={handleAddEvent}
              className="w-full max-w-xl bg-zinc-950 border border-white/10 p-12 md:p-16 space-y-12 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden text-white rounded-none"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20"></div>
              
              <div className="flex items-center justify-center pb-8 border-b border-white/5">
                <h3 className="font-manrope font-bold tracking-tight text-3xl">New event</h3>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="font-inter text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Title</label>
                  <input 
                    autoFocus
                    placeholder="Describe the moment..."
                    className="w-full bg-transparent border-b border-white/10 py-8 px-2 text-3xl font-manrope font-bold tracking-tight focus:outline-none focus:border-white transition-all placeholder:text-zinc-800 text-white"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="font-inter text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Date</label>
                    <input 
                      type="date"
                      className="w-full bg-zinc-900/50 border border-white/5 p-6 text-[11px] font-semibold tracking-wider focus:outline-none focus:border-white/20 text-white rounded-none transition-colors"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="font-inter text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Time</label>
                    <input 
                      type="time"
                      className="w-full bg-zinc-900/50 border border-white/5 p-6 text-[11px] font-semibold tracking-wider focus:outline-none focus:border-white/20 text-white rounded-none transition-colors"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="font-inter text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">Strategic notes</label>
                  <textarea 
                    placeholder="Add vision or context..."
                    className="w-full bg-zinc-900/50 border border-white/5 p-6 text-xs font-inter focus:outline-none focus:border-white/20 h-32 resize-none leading-relaxed placeholder:text-zinc-800 text-white rounded-none transition-colors"
                    value={newEvent.caption}
                    onChange={(e) => setNewEvent({ ...newEvent, caption: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  type="submit"
                  className="w-full bg-white text-black py-8 font-semibold tracking-widest text-[11px] hover:bg-zinc-200 transition-all disabled:opacity-30 active:scale-[0.98] rounded-none shadow-lg border border-black/10 uppercase"
                  disabled={!newEvent.title}
                >
                  Confirm event
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full text-zinc-600 font-semibold tracking-widest text-[10px] hover:text-white transition-all pt-4 uppercase"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>

  );
}

export default withOnboardingGuard(CalendarPage);
