"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage, ref, uploadBytes, getDownloadURL, collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy, updateDoc } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Asset {
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

import { withOnboardingGuard } from "../../components/withOnboardingGuard";

function VaultPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [featuredAsset, setFeaturedAsset] = useState<Asset | null>(null);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  
  const [newAsset, setNewAsset] = useState({
    name: "",
    type: "AUDIO" as Asset["type"],
    url: "",
    size: "0.0 MB",
    category: "DEMO / VOCAL STEMS",
    bpm: "124",
    key: "AMIN"
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const assetsRef = collection(db, "vault", currentUser.uid, "items");
        const q = query(assetsRef, orderBy("createdAt", "desc"));
        
        const unsubscribeAssets = onSnapshot(q, (snapshot) => {
          const assetsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Asset[];
          setAssets(assetsData);
          if (assetsData.length > 0 && !featuredAsset) {
            setFeaturedAsset(assetsData[0]);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching assets:", error);
          setLoading(false);
        });

        return () => unsubscribeAssets();
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [router, featuredAsset]);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newAsset.name && !file) || !user) return;

    setUploading(true);
    try {
      let finalUrl = newAsset.url;
      let finalSize = newAsset.size;
      let finalName = newAsset.name || (file ? file.name : "UNTITLED_ASSET");

      if (file) {
        const storageRef = ref(storage, `vault/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        finalUrl = await getDownloadURL(snapshot.ref);
        finalSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        if (!newAsset.name) finalName = file.name;
      }

      await addDoc(collection(db, "vault", user.uid, "items"), {
        name: finalName.toUpperCase(),
        type: newAsset.type,
        url: finalUrl,
        size: finalSize,
        category: newAsset.category.toUpperCase(),
        bpm: newAsset.bpm,
        key: newAsset.key.toUpperCase(),
        locked: false,
        createdAt: serverTimestamp(),
        metadata: {
            tempo: parseInt(newAsset.bpm),
            energy: (Math.random() * (100 - 70) + 70).toFixed(1),
            danceability: (Math.random() * (100 - 60) + 60).toFixed(1)
        }
      });
      
      setNewAsset({ name: "", type: "AUDIO", url: "", size: "0.0 MB", category: "DEMO / VOCAL STEMS", bpm: "124", key: "AMIN" });
      setFile(null);
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding asset:", err);
    } finally {
      setUploading(false);
    }
  };

  const generateContent = async () => {
      if (!featuredAsset || !user) return;
      setGenerating(true);
      
      const prompt = `Act as an elite social media strategist for a high-profile artist. 
      Generate a comprehensive social media rollout plan for an asset called "${featuredAsset.name}".
      METRICS: BPM ${featuredAsset.bpm || featuredAsset.metadata?.tempo || "124"}, Key ${featuredAsset.key || "UNKNOWN"}, Energy ${featuredAsset.metadata?.energy || "High"}.
      CATEGORY: ${featuredAsset.category}.
      
      Output MUST include:
      1. PHASE: TEASE (5 TikTok/Reels hooks focused on ${featuredAsset.metadata?.energy || "high"} energy vibes)
      2. PHASE: DROP (5 TikTok/Reels hooks focused on lyrics/empathy)
      3. PHASE: POST-DROP (5 TikTok/Reels hooks for long-term growth)
      4. 3 Twitter/X high-engagement threads outlines.
      5. 3 Aesthetic Instagram Caption variants (Brutalist, Minimal, Poetic).
      
      Style: Bold, direct, aggressive, and trend-focused. Structure with uppercase headers and technical numbering.`;

      try {
          const res = await fetch("/api/ai", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt })
          });
          const data = await res.json();
          if (data.output) {
              await updateDoc(doc(db, "vault", user.uid, "items", featuredAsset.id), {
                  generatedContent: data.output
              });
              setFeaturedAsset({...featuredAsset, generatedContent: data.output});
          }
      } catch (err) {
          console.error("AI Generation failed:", err);
      } finally {
          setGenerating(false);
      }
  };

  const deleteAsset = async (assetId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "vault", user.uid, "items", assetId));
    } catch (err) {
      console.error("Error deleting asset:", err);
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
        <div className="w-12 h-1 gap-2 flex items-center">
            <div className="w-4 h-4 bg-vibrant-yellow animate-bounce" />
            <div className="w-4 h-4 bg-white animate-bounce [animation-delay:0.1s]" />
            <div className="w-4 h-4 bg-vibrant-yellow animate-bounce [animation-delay:0.2s]" />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">INDEXING_VAULT_ASSETS</p>
      </div>
    );
  }

  const totalSizeGB = assets.reduce((acc, curr) => {
    const size = parseFloat(curr.size) || 0;
    return acc + (curr.size.includes('MB') ? size / 1024 : size);
  }, 0);
  const capacityPercent = Math.min(100, (totalSizeGB / 100) * 100);

  return (
    <div className="bg-black text-white font-inter min-h-screen">
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 min-h-screen animate-in fade-in duration-1000 slide-in-from-bottom-5">
        {/* Screen Title */}
        <section className="mb-10">
          <p className="font-inter text-[10px] font-black uppercase tracking-[0.3em] text-vibrant-yellow mb-2">STORAGE / REPOSITORY</p>
          <h2 className="font-manrope font-black text-6xl md:text-8xl tracking-tighter border-l-8 border-vibrant-yellow pl-6 uppercase text-white leading-none italic">VAULT</h2>
        </section>

        {/* Featured Card / Playback Hero + AI PANEL */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bento-item bg-black relative aspect-video overflow-hidden group shadow-2xl">
            <img 
              className="w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-1000" 
              src="https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop" 
              alt="Digital Waveform"
            />
            {/* Visual Pulse Grid */}
            <div className={`absolute inset-0 flex items-center justify-around px-8 pointer-events-none transition-all duration-500 ${playing ? 'opacity-100' : 'opacity-20'}`}>
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i}
                        className={`w-1 bg-vibrant-yellow/40 transition-all duration-100 ${playing ? 'animate-pulse' : ''}`}
                        style={{ 
                            height: playing ? `${Math.random() * 80 + 10}%` : '5%',
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: `${0.8 + Math.random() * 0.4}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-black/20 to-transparent">
              <div className="flex items-end justify-between">
                <div>
                  <span className="bg-vibrant-yellow text-black px-2 py-0.5 text-[9px] font-black tracking-widest mb-3 inline-block uppercase font-inter shadow-sm">MASTER_STREAM_V1</span>
                  <h3 className="font-manrope font-black text-4xl text-white tracking-tighter leading-none mb-2 uppercase">
                    {featuredAsset?.name || "ID_UNTITLED_01"}
                  </h3>
                  <div className="flex gap-4">
                      <p className="text-vibrant-yellow font-inter text-[10px] uppercase tracking-[0.2em] font-black">
                        {featuredAsset?.type === "AUDIO" ? `BPM: ${featuredAsset.bpm || featuredAsset.metadata?.tempo || "124"}` : featuredAsset?.size || "NO_METRICS"}
                      </p>
                      <p className="text-white/40 font-inter text-[10px] uppercase tracking-[0.2em] font-black">
                        {featuredAsset?.type === "AUDIO" ? `KEY: ${featuredAsset.key || "AMIN"}` : ""}
                      </p>
                      <p className="text-white/40 font-inter text-[10px] uppercase tracking-[0.2em] font-black ml-4">
                        ENERGY: {featuredAsset?.metadata?.energy || "85.0"}
                      </p>
                  </div>
                </div>
                <button 
                    onClick={() => setPlaying(!playing)}
                    className="bg-vibrant-yellow text-black w-24 h-24 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-[0_0_40px_rgba(255,255,0,0.5)] border-4 border-black group/btn"
                >
                  <span className="material-symbols-outlined text-6xl group-hover/btn:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {playing ? "pause" : "play_arrow"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="bento-item p-6 md:p-8 flex flex-col justify-between bg-zinc-950 border-white/10 group overflow-hidden relative">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-vibrant-yellow/10 rounded-full blur-2xl group-hover:bg-vibrant-yellow/20 transition-all duration-700"></div>
              
              <div className="space-y-4 relative z-10">
                 <p className="font-inter text-[10px] font-black uppercase tracking-[0.3em] text-vibrant-yellow">AI_CONTENT_COPILOT</p>
                 <h4 className="font-manrope font-black text-xl uppercase tracking-tighter text-white italic">GENERATE_SOCIAL_FUEL</h4>
                 <p className="text-[10px] leading-relaxed text-white/40 font-inter font-black uppercase tracking-widest italic">
                    {featuredAsset?.generatedContent ? "CALIBRATION_READY // ASSETS_SYNCED" : "SYNTHESIZE_STRATEGIC_HOOKS_BASED_ON_ACOUSTIC_INTELLIGENCE"}
                 </p>
              </div>

              <button 
                  onClick={generateContent}
                  disabled={generating || !featuredAsset}
                  className={`w-full py-4 mt-8 font-inter text-[10px] font-black uppercase tracking-[0.5em] transition-all active:scale-[0.95] flex items-center justify-center gap-3 border-2 relative z-10 ${generating ? 'bg-white/5 border-white/10' : 'bg-vibrant-yellow text-black border-vibrant-yellow hover:bg-white hover:border-white shadow-[0_0_25px_rgba(255,255,0,0.3)]'}`}
              >
                  {generating ? (
                      <span className="animate-spin material-symbols-outlined">sync</span>
                  ) : (
                      <>
                        <span className="material-symbols-outlined font-black">bolt</span>
                        {featuredAsset?.generatedContent ? "RE_SYNTHESIZE" : "EXECUTE_AI_ENGINE"}
                      </>
                  )}
              </button>
          </div>

          {featuredAsset?.generatedContent && (
              <div className="col-span-full bento-item bg-zinc-950 border-vibrant-yellow/20 p-8 md:p-12 animate-in slide-in-from-bottom-10 duration-700 relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-9xl font-black">bolt</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-vibrant-yellow animate-ping"></div>
                        <p className="font-inter text-[10px] font-black uppercase tracking-[0.5em] text-vibrant-yellow">AI_OUTPUT_STREAM // {featuredAsset.name}</p>
                      </div>
                      <button 
                        onClick={() => {
                            navigator.clipboard.writeText(featuredAsset.generatedContent!);
                            alert("COPIED TO CLIPBOARD");
                        }}
                        className="font-inter text-[10px] font-black uppercase text-vibrant-yellow border border-vibrant-yellow px-4 py-2 hover:bg-vibrant-yellow hover:text-black transition-all flex items-center gap-2"
                      >
                         <span className="material-symbols-outlined text-xs">content_copy</span> COPY_ALL_LOGS
                      </button>
                  </div>
                  <pre className="font-inter text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-white/90 uppercase tracking-widest font-black relative z-10 max-h-[600px] overflow-y-auto no-scrollbar">
                      {featuredAsset.generatedContent}
                  </pre>
              </div>
          )}
        </section>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 border-y-2 border-white/5 py-12">
            <div className="flex-1">
                <p className="font-inter text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">INGESTION_CONTROLS</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bento-item bg-vibrant-yellow text-black px-10 py-5 font-inter font-black text-[10px] uppercase tracking-widest flex items-center gap-4 active:scale-95 transition-all shadow-[0_0_30px_#FFFF00]"
                    >
                        <span className="material-symbols-outlined font-black">upload_file</span>
                        UPLOAD_NEW_ASSET
                    </button>
                    <button className="bento-item bg-transparent border-white/10 text-white/40 px-6 py-5 font-inter font-black text-[10px] uppercase tracking-widest flex items-center gap-4 hover:border-white hover:text-white transition-all active:scale-95">
                        <span className="material-symbols-outlined font-black">sort</span>
                    </button>
                </div>
            </div>
            <div className="flex-1 md:text-right">
                <p className="font-inter text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">REPOSITORY_DATA</p>
                <p className="font-manrope font-black text-3xl uppercase tracking-tighter italic">
                    {assets.length} <span className="text-white/20">OBJECTS_INDEXED</span>
                </p>
            </div>
        </div>

        {/* Asset Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.length === 0 ? (
            <div className="col-span-full py-24 text-center border-4 border-dashed border-white/5 bg-white/2 overflow-hidden relative group">
               <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle at 10% 10%, #FFFF00 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
               <span className="material-symbols-outlined text-4xl text-white/5 mb-4 font-black">database</span>
              <p className="font-inter text-[10px] font-black uppercase tracking-[0.4em] text-white/20">VAULT_REPOSITORY_READY_FOR_INGESTION</p>
            </div>
          ) : (
            assets.map((asset) => (
              <div 
                key={asset.id} 
                onClick={() => setFeaturedAsset(asset)}
                className={`bento-item p-6 flex flex-col justify-between gap-6 transition-all duration-300 group cursor-pointer ${featuredAsset?.id === asset.id ? "bg-white !border-white text-black translate-y--2 scale-[1.02]" : "bg-transparent border-white/5 hover:border-vibrant-yellow"}`}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 flex items-center justify-center transition-all ${featuredAsset?.id === asset.id ? "bg-black text-vibrant-yellow shadow-[0_0_15px_#000000]" : "bg-zinc-900 text-white/20 group-hover:bg-vibrant-yellow group-hover:text-black"}`}>
                    <span className="material-symbols-outlined text-2xl font-black">{getIconForType(asset.type)}</span>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 font-inter text-[8px] font-black tracking-widest border uppercase ${featuredAsset?.id === asset.id ? 'border-black/10 text-black/40' : 'border-white/10 text-white/40'}`}>
                        {asset.category || asset.type}
                    </span>
                  </div>
                </div>
                
                <div>
                    <h4 className="font-manrope font-black text-2xl tracking-tighter uppercase leading-none mb-2">
                      {asset.name}
                    </h4>
                    <div className={`flex items-center gap-4 pt-4 border-t ${featuredAsset?.id === asset.id ? 'border-black/10' : 'border-white/5'}`}>
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black opacity-30 uppercase tracking-[0.3em]">METRICS</span>
                            <span className="text-[10px] font-black">{asset.type === "AUDIO" ? `${asset.bpm || asset.metadata?.tempo || "124"} BPM` : asset.size}</span>
                        </div>
                        <div className="flex flex-col ml-auto">
                            <span className="text-[7px] font-black opacity-30 uppercase tracking-[0.3em]">PROTECTION</span>
                            <span className={`text-[10px] font-black ${featuredAsset?.id === asset.id ? 'text-black' : 'text-vibrant-yellow'}`}>ENCRYPTED</span>
                        </div>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Capacity Tracking */}
        <section className="mt-20 bento-item p-10 bg-zinc-950 border-white/10 group overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-vibrant-yellow/5 rounded-full blur-3xl group-hover:bg-vibrant-yellow/10 transition-all duration-1000"></div>
          
          <div className="flex justify-between items-end mb-8 relative z-10">
            <div>
              <p className="font-inter text-[10px] font-black text-vibrant-yellow uppercase tracking-[0.5em] mb-4">INFRASTRUCTURE_STATUS</p>
              <h5 className="font-manrope font-black text-4xl md:text-5xl text-white tracking-tighter uppercase leading-none italic">
                {totalSizeGB.toFixed(2)} GB <span className="text-white/10 italic">/</span> 100 GB
              </h5>
            </div>
            <button className="font-inter text-[10px] font-black text-white hover:text-vibrant-yellow uppercase tracking-widest border-b-2 border-white hover:border-vibrant-yellow pb-2 transition-all">
              EXPAND_ALLOCATION
            </button>
          </div>
          <div className="h-4 bg-white/5 w-full overflow-hidden border border-white/10 relative">
            <div 
              className="h-full bg-vibrant-yellow shadow-[0_0_30px_#FFFF00] transition-all duration-1000 ease-out relative overflow-hidden" 
              style={{ width: `${capacityPercent}%` }}
            >
               <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300 font-inter">
          <form 
            onSubmit={handleAddAsset}
            className="w-full max-w-xl bg-black border-4 border-white p-12 md:p-16 space-y-12 shadow-[0_0_100px_rgba(255,255,0,0.1)] animate-in zoom-in-95 duration-300 relative overflow-hidden text-white"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-vibrant-yellow animate-pulse shadow-[0_0_20px_#FFFF00]"></div>
            
            <div className="flex items-center justify-between pb-8 border-b-4 border-white">
              <h3 className="font-manrope font-black uppercase tracking-tighter text-4xl italic">INGEST_SIGNAL</h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/20 hover:text-vibrant-yellow transition-all active:scale-75"
              >
                <span className="material-symbols-outlined text-4xl font-black">close</span>
              </button>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="font-inter text-[10px] font-black uppercase tracking-[0.5em] text-white/20">IDENTIFICATION_STRING</label>
                <input 
                  autoFocus
                  placeholder="ID_ALBUM_ROOT_V1"
                  className="w-full bg-zinc-900 border-b-4 border-white/10 py-6 px-4 text-3xl font-manrope font-black uppercase tracking-tighter focus:outline-none focus:border-vibrant-yellow transition-all placeholder:opacity-5 text-vibrant-yellow"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="font-inter text-[10px] font-black uppercase tracking-[0.5em] text-white/20">VECTOR_TYPE</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-zinc-900 border-2 border-white/10 p-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-vibrant-yellow appearance-none cursor-pointer"
                      value={newAsset.type}
                      onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as Asset["type"] })}
                    >
                      <option value="AUDIO">AUDIO_STREAM</option>
                      <option value="IMAGE">IMAGE_MATRIX</option>
                      <option value="VIDEO">VIDEO_BUFFER</option>
                      <option value="DOC">DOCUMENT_SCHEMA</option>
                      <option value="LINK">EXTERNAL_NODE</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-2xl">expand_more</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="font-inter text-[10px] font-black uppercase tracking-[0.5em] text-white/20">CLASSIFICATION</label>
                  <input 
                    placeholder="E.G. VOCAL_STEMS"
                    className="w-full bg-zinc-900 border-2 border-white/10 p-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-vibrant-yellow transition-all placeholder:opacity-20 text-white"
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <label className="block text-center border-4 border-dashed border-white/10 py-16 hover:border-vibrant-yellow bg-zinc-900 transition-all cursor-pointer group relative overflow-hidden">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0]);
                        if (!newAsset.name) setNewAsset(prev => ({ ...prev, name: e.target.files![0].name }));
                      }
                    }} 
                  />
                  <div className="space-y-6 relative z-10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto group-hover:bg-vibrant-yellow group-hover:text-black transition-all duration-500">
                      <span className="material-symbols-outlined text-4xl font-black transition-all">cloud_upload</span>
                    </div>
                    <p className="font-inter text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-vibrant-yellow transition-all text-center px-4">
                      {file ? file.name : "DRAG_ASSET_HERE / CLICK_TO_BROWSE"}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-vibrant-yellow text-black py-10 font-inter font-black uppercase tracking-[0.5em] text-[10px] hover:bg-white transition-all disabled:opacity-30 shadow-[0_0_50px_rgba(255,255,0,0.3)] active:scale-[0.98] mt-6"
              disabled={uploading || (!newAsset.name && !file)}
            >
              {uploading ? "TRANSMITTING_SIGNAL..." : "EXECUTE_VAULT_COMMIT"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default withOnboardingGuard(VaultPage);
