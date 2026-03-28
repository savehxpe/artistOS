"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage, ref, uploadBytes, getDownloadURL, collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy, updateDoc } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { OutlandiaLogo } from "../../components/OutlandiaLogo";
import { VaultEmptyState } from "../../components/VaultEmptyState";
import { IngestProgress } from "../../components/IngestProgress";
import { MasterSignatureModal } from "../../components/MasterSignatureModal";

export interface VaultRecord {
  id: string;
  name: string;
  size: string;
  type: "AUDIO" | "IMAGE" | "VIDEO" | "DOC" | "LINK";
  url: string;
  locked: boolean;
  createdAt: any;
  category?: string;
  bpm?: string;
  key?: string;
  metadata?: {
    tempo?: number;
    energy?: string | number;
    danceability?: string | number;
  };
  generatedContent?: string;
}

const SYSTEM_DATE = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

import { withOnboardingGuard } from "../../components/withOnboardingGuard";

function VaultPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<VaultRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [featuredRecord, setFeaturedRecord] = useState<VaultRecord | null>(null);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  
  const [newRecord, setNewRecord] = useState({
    name: "",
    type: "AUDIO" as VaultRecord["type"],
    url: "",
    size: "0.0 MB",
    category: "Demo / Vocal Stems",
    bpm: "124",
    key: "A Minor"
  });
  const [file, setFile] = useState<File | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const recordsRef = collection(db, "users", currentUser.uid, "vault");
        const q = query(recordsRef, orderBy("createdAt", "desc"));
        
        const unsubscribeRecords = onSnapshot(q, (snapshot) => {
          const recordsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as VaultRecord[];
          setRecords(recordsData);
          if (recordsData.length > 0 && !featuredRecord) {
            setFeaturedRecord(recordsData[0]);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching records:", error);
          setLoading(false);
        });

        return () => unsubscribeRecords();
      } else {
        router.push("/");
      }
    });
    return () => unsubscribeAuth();
  }, [router, featuredRecord]);

  const handleIngestRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newRecord.name && !file) || !user) return;
    
    // Authorization check
    if (!showSignatureModal && !ingesting) {
        setShowSignatureModal(true);
        return;
    }
    
    setShowSignatureModal(false);
    setIngesting(true);
    try {
      let finalUrl = newRecord.url;
      let finalSize = newRecord.size;
      let finalName = newRecord.name || (file ? file.name : "Untitled Record");

      if (file) {
        const storageRef = ref(storage, `vault/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        finalUrl = await getDownloadURL(snapshot.ref);
        finalSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        if (!newRecord.name) finalName = file.name;
      }

      await addDoc(collection(db, "users", user.uid, "vault"), {
        name: finalName,
        type: newRecord.type,
        url: finalUrl,
        size: finalSize,
        category: newRecord.category,
        bpm: newRecord.bpm,
        key: newRecord.key,
        locked: false,

        createdAt: serverTimestamp(),
        metadata: {
            tempo: parseInt(newRecord.bpm),
            energy: (Math.random() * (100 - 70) + 70).toFixed(1),
            danceability: (Math.random() * (100 - 60) + 60).toFixed(1)
        }
      });
      
      setNewRecord({ name: "", type: "AUDIO", url: "", size: "0.0 MB", category: "Demo / Vocal Stems", bpm: "124", key: "Amin" });
      setFile(null);
      
      // Simulate progress for UI feedback as per Ingestion_Progress_Bar directive
      setIngesting(true);
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 30;
        if (p >= 100) {
            setIngestProgress(100);
            clearInterval(interval);
            setTimeout(() => {
                setIngesting(false);
                setIngestProgress(0);
                setShowAddModal(false);
            }, 1000);
        } else {
            setIngestProgress(Math.floor(p));
        }
      }, 300);

    } catch (err) {
      console.error("Error ingesting record:", err);
      setIngesting(false);
    }
  };

  const generateContent = async () => {
      if (!featuredRecord || !user) return;
      setGenerating(true);
      
      const prompt = `Act as an elite social media strategist for a high-profile artist. 
      Generate a comprehensive social media rollout plan for a record called "${featuredRecord.name}".
      METRICS: BPM ${featuredRecord.bpm || featuredRecord.metadata?.tempo || "124"}, Key ${featuredRecord.key || "UNKNOWN"}, Energy ${featuredRecord.metadata?.energy || "High"}.
      CATEGORY: ${featuredRecord.category}.
      
      Output MUST include:
      1. PHASE: TEASE (5 TikTok/Reels hooks focused on ${featuredRecord.metadata?.energy || "high"} energy vibes)
      2. PHASE: DROP (5 TikTok/Reels hooks focused on lyrics/empathy)
      3. PHASE: POST-DROP (5 TikTok/Reels hooks for long-term growth)
      4. 3 Twitter/X high-engagement threads outlines.
      5. 3 Aesthetic Instagram Caption variants (Brutalist, Minimal, Poetic).
      
      Style: Bold, direct, and trend-focused. Structure with clear, professional headers and human-friendly spacing. Avoid technical technical codenames or all-caps formatting unless necessary for branding.`;


      try {
          const res = await fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt })
          });
          const data = await res.json();
          if (data.output) {
              await updateDoc(doc(db, "users", user.uid, "vault", featuredRecord.id), {
                  generatedContent: data.output
              });
              setFeaturedRecord({...featuredRecord, generatedContent: data.output});
          }
      } catch (err) {
          console.error("AI Generation failed:", err);
      } finally {
          setGenerating(false);
      }
  };

  const deleteRecord = async (recordId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "vault", recordId));
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "AUDIO": return "music_note";
      case "IMAGE": return "image";
      case "VIDEO": return "videocam";
      case "DOC": return "description";
      case "LINK": return "link";
      default: return "inventory_2";
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black font-inter">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
        </div>
        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.4em] text-white/40 animate-pulse">Loading Workspace</p>
      </div>
    );
  }

  const totalSizeGB = records.reduce((acc, curr) => {
    const size = parseFloat(curr.size) || 0;
    return acc + (curr.size.includes('MB') ? size / 1024 : size);
  }, 0);
  const capacityPercent = Math.min(100, (totalSizeGB / 100) * 100);

  return (
    <div className="bg-black text-white font-inter min-h-screen">
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 min-h-screen animate-in fade-in duration-1000">
        <header className="mb-24 flex flex-col items-center text-center">
          <OutlandiaLogo />
          <div className="w-12 h-[0.5px] bg-white/20 mb-8 mt-4" />
          <p className="text-[10px] font-medium tracking-widest text-[#FFFF00] uppercase tracking-[0.4em]">
            Record Vault
          </p>
        </header>

        {/* Featured Card / Playback Hero + AI PANEL */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bento-item bg-zinc-950 relative aspect-video overflow-hidden group border border-white/5 rounded-3xl">
            <img 
              className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-1000" 
              src="https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop" 
              alt="Digital Waveform"
            />
            {/* Visual Minimal Pulse - subtle */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${playing ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-64 h-64 border border-white/20 rounded-full animate-ping"></div>
                <div className="absolute w-32 h-32 border border-white/10 rounded-full animate-ping [animation-delay:0.5s]"></div>
            </div>

            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <span className="text-white/40 text-[9px] font-bold tracking-widest mb-4 inline-block uppercase font-inter">Selected Record</span>
                   <h3 className="font-manrope font-bold text-4xl md:text-5xl text-white tracking-tight leading-none mb-4">
                    {featuredRecord?.name || "Untitled"}
                  </h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <p className="text-white font-inter text-[11px] uppercase tracking-widest font-bold">
                        {featuredRecord?.type === "AUDIO" ? `bpm ${featuredRecord?.bpm || featuredRecord?.metadata?.tempo || "124"}` : featuredRecord?.size || "---"}
                      </p>
                      <p className="text-white/40 font-inter text-[11px] uppercase tracking-widest font-bold">
                        {featuredRecord?.type === "AUDIO" ? `key ${featuredRecord.key || "amin"}` : ""}
                      </p>
                      <p className="text-white/40 font-inter text-[11px] uppercase tracking-widest font-bold">
                        energy {featuredRecord?.metadata?.energy || "85.0"}
                      </p>
                  </div>
                </div>
                <button 
                    onClick={() => setPlaying(!playing)}
                    className="bg-white text-black w-20 h-20 md:w-24 md:h-24 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl border-none group/btn rounded-full tap-scale"
                >
                  <span className="material-symbols-outlined text-4xl md:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {playing ? "pause" : "play_arrow"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="bento-item p-8 flex flex-col justify-between bg-zinc-950 border border-white/5 group overflow-hidden relative rounded-3xl">
              <div className="space-y-6 relative z-10">
                 <p className="font-inter text-[11px] font-bold uppercase tracking-[0.3em] text-white/20">Analysis</p>
                 <h4 className="font-manrope font-bold text-2xl tracking-tight text-white">Creative Insight</h4>
                 <p className="text-[12px] leading-relaxed text-white/40 font-inter tracking-wide font-medium">
                    {featuredRecord?.generatedContent ? "Strategy ready" : "Generate social hooks and rollout directions based on record metadata."}
                 </p>
              </div>

              <button 
                  onClick={generateContent}
                  disabled={generating || !featuredRecord}
                  className={`w-full py-5 mt-8 font-inter text-[11px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 border tap-scale rounded-full ${generating ? 'bg-white/5 border-white/10' : 'bg-white text-black border-white hover:bg-neutral-200 shadow-lg'}`}
              >
                  {generating ? (
                      <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                  ) : (
                      <>
                         <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        {featuredRecord?.generatedContent ? "Regenerate" : "Generate Strategy"}
                      </>
                    )}
                </button>
            </div>

           {featuredRecord?.generatedContent && (
              <div className="col-span-full bento-item bg-zinc-950 border-white/5 p-8 md:p-12 animate-in slide-in-from-bottom-10 duration-700 relative group overflow-hidden rounded-3xl">
                  <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                        <p className="font-inter text-[11px] font-bold uppercase tracking-[0.4em] text-white/40">Direction | {featuredRecord.name}</p>
                      </div>
                      <button 
                        onClick={() => {
                            navigator.clipboard.writeText(featuredRecord.generatedContent!);
                            alert("Copied to Clipboard");
                        }}
                        className="font-inter text-[10px] font-bold uppercase text-white/40 border border-white/10 px-4 py-2 hover:border-white hover:text-white transition-all flex items-center gap-2 tap-scale"
                      >
                         <span className="material-symbols-outlined text-xs">content_copy</span> Copy Strategy
                      </button>
                  </div>
                  <pre className="font-inter text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-white/80 tracking-wide font-medium relative z-10 max-h-[600px] overflow-y-auto no-scrollbar">
                      {featuredRecord.generatedContent}
                  </pre>
              </div>
          )}
        </section>

        {/* Actions Bar */}
         <div className="flex flex-col md:flex-row gap-6 mb-8 border-y border-white/5 py-12">
            <div className="flex-1">
                <p className="font-inter text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-4">Controls</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bento-item bg-white text-black px-10 py-5 font-inter font-black text-[10px] uppercase tracking-widest flex items-center gap-4 active:scale-95 transition-all rounded-full"
                    >
                        <span className="material-symbols-outlined font-bold">add</span>
                        Ingest Record
                    </button>
                    <button className="bento-item bg-transparent border-white/10 text-white/40 px-6 py-5 font-inter font-bold text-[10px] uppercase tracking-widest flex items-center gap-4 hover:border-white hover:text-white transition-all active:scale-95 rounded-full">
                        <span className="material-symbols-outlined font-bold">tune</span>
                    </button>
                </div>
            </div>
            <div className="flex-1 md:text-right">
                <p className="font-inter text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-4">Repository</p>
                <p className="font-manrope font-bold text-4xl tracking-tighter">
                    {records.length} <span className="text-white/20">Items</span>
                </p>
            </div>
        </div>

        {/* Record Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.length === 0 ? (
            <div className="col-span-full">
              <VaultEmptyState onIngest={() => setShowAddModal(true)} />
            </div>
          ) : (
            records.map((record) => (
              <div 
                key={record.id} 
                onClick={() => setFeaturedRecord(record)}
                className={`bento-item p-8 flex flex-col justify-between gap-8 transition-all duration-300 group cursor-pointer border tap-scale rounded-2xl ${featuredRecord?.id === record.id ? "bg-white border-white text-black" : "bg-transparent border-white/5 hover:border-white/50"}`}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 flex items-center justify-center transition-all rounded-xl ${featuredRecord?.id === record.id ? "bg-black text-white" : "bg-zinc-900/50 text-white/20 group-hover:bg-white group-hover:text-black"}`}>
                    <span className="material-symbols-outlined text-2xl">{getIconForType(record.type)}</span>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 font-inter text-[9px] font-bold tracking-widest border uppercase rounded-full ${featuredRecord?.id === record.id ? 'border-black/10 text-black/40' : 'border-white/10 text-white/40'}`}>
                        {record.category?.toLowerCase() || record.type.toLowerCase()}
                    </span>
                  </div>
                </div>
                
                <div>
                    <h4 className="font-manrope font-bold text-2xl tracking-tight leading-none mb-3">
                      {record.name}
                    </h4>
                    <div className={`flex items-center gap-6 pt-6 border-t ${featuredRecord?.id === record.id ? 'border-black/5' : 'border-white/5'}`}>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.3em] mb-1">Scale</span>
                            <span className="text-[11px] font-bold lowercase">{record.type === "AUDIO" ? `${record.bpm || record.metadata?.tempo || "124"} bpm` : record.size}</span>
                        </div>
                        <div className="flex flex-col ml-auto">
                            <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.3em] mb-1">Status</span>
                            <span className={`text-[11px] font-bold ${featuredRecord?.id === record.id ? 'text-black' : 'text-white/40'}`}>ready</span>
                        </div>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Capacity Tracking */}
        <section className="mt-24 bento-item p-12 bg-zinc-950 border-white/5 group overflow-hidden relative rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 relative z-10 gap-6">
            <div>
              <p className="font-inter text-[11px] font-bold text-white/20 uppercase tracking-[0.5em] mb-4">Storage Allocation</p>
              <h5 className="font-manrope font-bold text-4xl md:text-5xl text-white tracking-tighter leading-none">
                {totalSizeGB.toFixed(2)} GB <span className="text-white/10">|</span> 100 GB
              </h5>
            </div>
            <button className="font-inter text-[11px] font-bold text-white/40 hover:text-white uppercase tracking-widest border-b border-white/10 hover:border-white pb-2 transition-all tap-scale">
              Upgrade
            </button>
          </div>
          <div className="h-1 bg-white/5 w-full overflow-hidden relative rounded-full">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-out relative" 
              style={{ width: `${capacityPercent}%` }}
            >
            </div>
          </div>
        </section>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500 font-inter">
           {showSignatureModal ? (
             <MasterSignatureModal 
                documentName={newRecord.name || (file ? file.name : "New Record")}
                onSign={() => handleIngestRecord({ preventDefault: () => {} } as any)}
                onCancel={() => setShowSignatureModal(false)}
             />
           ) : (
             <form 
              onSubmit={handleIngestRecord}
              className="w-full max-w-xl bg-zinc-950 border border-white/10 p-10 md:p-14 space-y-12 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden text-white rounded-3xl"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20"></div>
              
              <div className="flex items-center justify-between pb-8 border-b border-white/5 text-center flex-col gap-4">
                <h3 className="font-manrope font-bold tracking-tight text-3xl italic uppercase">Ingest Record</h3>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="font-inter text-[11px] font-bold uppercase tracking-[0.3em] text-white/20">Resource Name</label>
                  <input 
                    autoFocus
                    placeholder="Record Title"
                    className="w-full bg-transparent border-b border-white/10 py-5 text-2xl font-manrope font-bold uppercase tracking-tight focus:outline-none focus:border-white transition-all placeholder:text-white/5 text-white"
                    value={newRecord.name}
                    onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="font-inter text-[11px] font-bold uppercase tracking-[0.3em] text-white/20">Type</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-white/5 border border-white/10 p-5 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-white appearance-none cursor-pointer rounded-xl"
                        value={newRecord.type}
                        onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as VaultRecord["type"] })}
                      >
                        <option value="AUDIO">Audio</option>
                        <option value="IMAGE">Image</option>
                        <option value="VIDEO">Video</option>
                        <option value="DOC">Document</option>
                        <option value="LINK">Link</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-xl">expand_more</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="font-inter text-[11px] font-bold uppercase tracking-[0.3em] text-white/20">Classification</label>
                    <input 
                      placeholder="DEMO / STEMS"
                      className="w-full bg-white/5 border border-white/10 p-5 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-white transition-all placeholder:text-white/5 text-white rounded-xl"
                      value={newRecord.category}
                      onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="block text-center border-2 border-dashed border-white/5 py-12 hover:border-white/50 bg-white/[0.02] transition-all cursor-pointer group relative overflow-hidden rounded-2xl">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFile(e.target.files[0]);
                          if (!newRecord.name) setNewRecord(prev => ({ ...prev, name: e.target.files![0].name }));
                        }
                      }} 
                    />
                    <div className="space-y-5 relative z-10">
                      <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mx-auto group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                      </div>
                      <p className="font-inter text-[11px] font-bold uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-all text-center px-4">
                        {file ? file.name : "Select or Drop File"}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {ingesting ? (
                  <div className="py-6 flex justify-center">
                      <IngestProgress fileName={file?.name || "New Record"} progress={ingestProgress} />
                  </div>
              ) : (
                  <>
                      <button 
                      type="submit"
                      className="w-full bg-white text-black py-8 font-inter font-bold uppercase tracking-[0.4em] text-[11px] hover:bg-neutral-200 transition-all disabled:opacity-30 tap-scale mt-6 rounded-full"
                      disabled={ingesting || (!newRecord.name && !file)}
                      >
                          authorize & Ingest
                      </button>
                      <button 
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="w-full text-white/20 font-inter font-bold uppercase tracking-[0.4em] text-[9px] hover:text-white transition-all pt-4"
                      >
                          Cancel
                      </button>
                  </>
              )}
            </form>
           )}
        </div>
      )}

    </div>
  );
}

export default withOnboardingGuard(VaultPage);
