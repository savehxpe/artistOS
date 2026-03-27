"use client";

import { useState, useCallback } from "react";
import { db, auth, storage, ref, uploadBytes, getDownloadURL, addDoc, collection, serverTimestamp } from "../lib/firebase";

interface VaultIngestorProps {
  userId: string;
}

export default function VaultIngestor({ userId }: VaultIngestorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const extractMetadata = (file: File) => {
    // Mock metadata extraction as requested
    const tempo = Math.floor(Math.random() * (140 - 70) + 70);
    const energy = (Math.random() * 100).toFixed(1);
    const danceability = (Math.random() * 100).toFixed(1);
    
    return { tempo, energy, danceability };
  };

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleUpload(file);
    }
  }, []);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setStatus("Extracting metadata...");
    
    try {
      const metadata = extractMetadata(file);
      const fileId = Math.random().toString(36).substring(7);
      const fileRef = ref(storage, `vault/${userId}/${fileId}_${file.name}`);
      
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      await addDoc(collection(db, "vault", userId, "items"), {
        name: file.name,
        type: file.type,
        url,
        createdAt: serverTimestamp(),
        metadata,
        watermarked: true
      });
      
      setStatus("Upload successful");
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error(error);
      setStatus("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`w-full h-full flex flex-col items-center justify-center text-center transition-all duration-700 relative overflow-hidden group border-2 border-dashed rounded-none ${
        isDragging ? "bg-white/10 border-white" : "bg-zinc-950/50 border-white/10 hover:border-white/30"
      }`}
    >
      <div className="relative z-10 p-8">
        <div className={`w-20 h-20 mb-6 mx-auto flex items-center justify-center border transition-all rounded-full ${isDragging || isUploading ? 'bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-black border-white/10 text-white/40 group-hover:border-white group-hover:text-white'}`}>
          <span className={`material-symbols-outlined text-3xl transition-transform duration-500 ${isUploading ? 'animate-spin' : ''}`}>
            {isUploading ? "sync" : "cloud_upload"}
          </span>
        </div>
        
        <h3 className="font-manrope font-bold text-2xl tracking-tight mb-2">Vault Ingestor</h3>
        <p className="font-inter text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase mb-8">Drop raw assets here</p>
        
        {status ? (
          <div className="bg-white text-black px-6 py-3 font-inter text-[10px] font-bold uppercase tracking-widest rounded-full animate-in zoom-in-95 duration-300">
            {status}
          </div>
        ) : (
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
             <p className="font-inter text-[9px] font-bold text-white/40 uppercase tracking-widest">Auto extract: tempo | energy | dance</p>
          </div>
        )}
      </div>

      <input 
        type="file" 
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
      />
    </div>
  );
}

