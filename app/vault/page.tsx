"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage, ref, uploadBytes, getDownloadURL, collection, query, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy, updateDoc } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { OutlandiaLogo } from "../../components/OutlandiaLogo";

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
      
      setNewAsset({ name: "", type: "AUDIO", url: "", size: "0.0 MB", category: "Demo / Vocal Stems", bpm: "124", key: "Amin" });
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
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-white/20 rounded-none animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-none animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-white/60 rounded-none animate-bounce"></div>
        </div>
        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.4em] text-white/40 animate-pulse">Loading Workspace</p>
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
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 min-h-screen animate-in fade-in duration-1000">
        <header className="mb-24 flex flex-col items-center text-center">
          <OutlandiaLogo />
          <div className="w-12 h-[0.5px] bg-white/20 mb-8 mt-4" />
          <p className="text-[10px] font-medium tracking-widest text-white/20 uppercase tracking-[0.4em]">
            ASSET REPOSITORY — OUTLANDIA
          </p>
        </header>

        {/* Featured Card / Playback Hero + AI PANEL */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bento-item bg-zinc-950 relative aspect-video overflow-hidden group border border-white/5 rounded-none">
            <img 
              className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 transition-all duration-1000" 
              src="https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop" 
              alt="Digital Waveform"
            />
            {/* Visual Minimal Pulse - subtle */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${playing ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-64 h-64 border border-white/20 rounded-none animate-ping"></div>
                <div className="absolute w-32 h-32 border border-white/10 rounded-none animate-ping [animation-delay:0.5s]"></div>
            </div>

            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <span className="text-white/40 text-[9px] font-bold tracking-widest mb-4 inline-block uppercase font-inter">Selected Asset</span>
                  <h3 className="font-manrope font-bold text-4xl md:text-5xl text-white tracking-tight leading-none mb-4">
                    {featuredAsset?.name || "Untitled"}
                  </h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <p className="text-white font-inter text-[11px] uppercase tracking-widest font-bold">
                        {featuredAsset?.type === "AUDIO" ? `bpm ${featuredAsset?.bpm || featuredAsset?.metadata?.tempo || "124"}` : featuredAsset?.size || "---"}
                      </p>
                      <p className="text-white/40 font-inter text-[11px] uppercase tracking-widest font-bold">
                        {featuredAsset?.type === "AUDIO" ? `key ${featuredAsset.key || "amin"}` : ""}
                      </p>
                      <p className="text-white/40 font-inter text-[11px] uppercase tracking-widest font-bold">
                        energy {featuredAsset?.metadata?.energy || "85.0"}
                      </p>
                  </div>
                </div>
                <button 
                    onClick={() => setPlaying(!playing)}
                    className="bg-white text-black w-20 h-20 md:w-24 md:h-24 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl border-none group/btn rounded-none tap-scale"
                >
                  <span className="material-symbols-outlined text-4xl md:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {playing ? "pause" : "play_arrow"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="bento-item p-8 flex flex-col justify-between bg-zinc-950 border border-white/5 group overflow-hidden relative rounded-none">
              <div className="space-y-6 relative z-10">
                 <p className="font-inter text-[11px] font-bold uppercase tracking-[0.3em] text-white/20">Analysis</p>
                 <h4 className="font-manrope font-bold text-2xl tracking-tight text-white">Creative Insight</h4>
                 <p className="text-[12px] leading-relaxed text-white/40 font-inter tracking-wide font-medium">
                    {featuredAsset?.generatedContent ? "Strategy ready" : "Generate social hooks and rollout directions based on asset metadata."}
                 </p>
              </div>

              <button 
                  onClick={generateContent}
                  disabled={generating || !featuredAsset}
                  className={`w-full py-5 mt-8 font-inter text-[11px] font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 border tap-scale rounded-none ${generating ? 'bg-white/5 border-white/10' : 'bg-white text-black border-white hover:bg-neutral-200 shadow-lg'}`}
              >
                  {generating ? (
                      <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                  ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        {featuredAsset?.generatedContent ? "Regenerate" : "Generate Strategy"}
                      </>
                  )}
              </button>
          </div>

          {featuredAsset?.generatedContent && (
              <div className="col-span-full bento-item bg-zinc-950 border-white/5 p-8 md:p-12 animate-in slide-in-from-bottom-10 duration-700 relative group overflow-hidden rounded-none">
                  <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-white/20 rounded-none"></div>
                        <p className="font-inter text-[11px] font-bold uppercase tracking-[0.4em] text-white/40">Direction | {featuredAsset.name}</p>
                      </div>
                      <button 
                        onClick={() => {
                            navigator.clipboard.writeText(featuredAsset.generatedContent!);
                            alert("Copied to Clipboard");
                        }}
                        className="font-inter text-[10px] font-bold uppercase text-white/40 border border-white/10 px-4 py-2 hover:border-white hover:text-white transition-all flex items-center gap-2 tap-scale"
                      >
                         <span className="material-symbols-outlined text-xs">content_copy</span> Copy Strategy
                      </button>
                  </div>
                  <pre className="font-inter text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-white/80 tracking-wide font-medium relative z-10 max-h-[600px] overflow-y-auto no-scrollbar">
                      {featuredAsset.generatedContent}
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
                        className="bento-item bg-white text-black px-10 py-5 font-inter font-black text-[10px] uppercase tracking-widest flex items-center gap-4 active:scale-95 transition-all rounded-none"
                    >
                        <span className="material-symbols-outlined font-bold">add</span>
                        Upload asset
                    </button>
                    <button className="bento-item bg-transparent border-white/10 text-white/40 px-6 py-5 font-inter font-bold text-[10px] uppercase tracking-widest flex items-center gap-4 hover:border-white hover:text-white transition-all active:scale-95 rounded-none">
                        <span className="material-symbols-outlined font-bold">tune</span>
                    </button>
                </div>
            </div>
            <div className="flex-1 md:text-right">
                <p className="font-inter text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-4">Repository</p>
                <p className="font-manrope font-bold text-4xl tracking-tighter">
                    {assets.length} <span className="text-white/20">Items</span>
                </p>
            </div>
        </div>

        {/* Asset Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.length === 0 ? (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 bg-white/[0.02] rounded-none">
               <span className="material-symbols-outlined text-4xl text-white/5 mb-6">database</span>
              <p className="font-inter text-[11px] font-bold uppercase tracking-[0.4em] text-white/10">Repository Empty</p>
            </div>
          ) : (
            assets.map((asset) => (
              <div 
                key={asset.id} 
                onClick={() => setFeaturedAsset(asset)}
                className={`bento-item p-8 flex flex-col justify-between gap-8 transition-all duration-300 group cursor-pointer border tap-scale rounded-none ${featuredAsset?.id === asset.id ? "bg-white border-white text-black" : "bg-transparent border-white/5 hover:border-white/50"}`}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 flex items-center justify-center transition-all ${featuredAsset?.id === asset.id ? "bg-black text-white" : "bg-zinc-900/50 text-white/20 group-hover:bg-white group-hover:text-black"}`}>
                    <span className="material-symbols-outlined text-2xl">{getIconForType(asset.type)}</span>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 font-inter text-[9px] font-bold tracking-widest border uppercase rounded-none ${featuredAsset?.id === asset.id ? 'border-black/10 text-black/40' : 'border-white/10 text-white/40'}`}>
                        {asset.category?.toLowerCase() || asset.type.toLowerCase()}
                    </span>
                  </div>
                </div>
                
                <div>
                    <h4 className="font-manrope font-bold text-2xl tracking-tight leading-none mb-3">
                      {asset.name}
                    </h4>
                    <div className={`flex items-center gap-6 pt-6 border-t ${featuredAsset?.id === asset.id ? 'border-black/5' : 'border-white/5'}`}>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.3em] mb-1">Scale</span>
                            <span className="text-[11px] font-bold lowercase">{asset.type === "AUDIO" ? `${asset.bpm || asset.metadata?.tempo || "124"} bpm` : asset.size}</span>
                        </div>
                        <div className="flex flex-col ml-auto">
                            <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.3em] mb-1">Status</span>
                            <span className={`text-[11px] font-bold ${featuredAsset?.id === asset.id ? 'text-black' : 'text-white/40'}`}>ready</span>
                        </div>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Capacity Tracking */}
        <section className="mt-24 bento-item p-12 bg-zinc-950 border-white/5 group overflow-hidden relative rounded-none">
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
          <div className="h-1 bg-white/5 w-full overflow-hidden relative rounded-none">
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
          <form 
            onSubmit={handleAddAsset}
            className="w-full max-w-xl bg-zinc-950 border border-white/10 p-10 md:p-14 space-y-12 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden text-white rounded-none"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20"></div>
            
            <div className="flex items-center justify-between pb-8 border-b border-white/5 text-center flex-col gap-4">
              <h3 className="font-manrope font-bold tracking-tight text-3xl">New Asset</h3>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="font-inter text-[11px] font-bold uppercase tracking-[0.3em] text-white/20">Resource Name</label>
                <input 
                  autoFocus
                  placeholder="Asset Title"
                  className="w-full bg-transparent border-b border-white/10 py-5 text-2xl font-manrope font-bold uppercase tracking-tight focus:outline-none focus:border-white transition-all placeholder:text-white/5 text-white"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="font-inter text-[11px] font-bold uppercase tracking-[0.3em] text-white/20">Type</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-white/5 border border-white/10 p-5 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-white appearance-none cursor-pointer rounded-none"
                      value={newAsset.type}
                      onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as Asset["type"] })}
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
                    className="w-full bg-white/5 border border-white/10 p-5 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-white transition-all placeholder:text-white/5 text-white rounded-none"
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <label className="block text-center border-2 border-dashed border-white/5 py-12 hover:border-white/50 bg-white/[0.02] transition-all cursor-pointer group relative overflow-hidden">
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
                  <div className="space-y-5 relative z-10">
                    <div className="w-16 h-16 bg-white/5 rounded-none flex items-center justify-center mx-auto group-hover:bg-white group-hover:text-black transition-all duration-500">
                      <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                    </div>
                    <p className="font-inter text-[11px] font-bold uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-all text-center px-4">
                      {file ? file.name : "Select or Drop File"}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-white text-black py-8 font-inter font-bold uppercase tracking-[0.4em] text-[11px] hover:bg-neutral-200 transition-all disabled:opacity-30 tap-scale mt-6 rounded-none"
              disabled={uploading || (!newAsset.name && !file)}
            >
              {uploading ? "uploading..." : "add to vault"}
            </button>
            <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-full text-white/20 font-inter font-bold uppercase tracking-[0.4em] text-[9px] hover:text-white transition-all pt-4"
              >
                Cancel
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default withOnboardingGuard(VaultPage);
