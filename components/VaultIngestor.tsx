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
    setStatus("EXTRACTING_METADATA...");
    
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
      
      setStatus("UPLOAD_SUCCESSFUL");
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error(error);
      setStatus("UPLOAD_FAILED");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`w-full h-full flex flex-col items-center justify-center text-center transition-all duration-500 relative overflow-hidden group border-4 border-dashed ${
        isDragging ? "bg-vibrant-yellow border-black" : "bg-transparent border-black/10 hover:border-black/30"
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

      <div className="relative z-10">
        <div className={`w-20 h-20 mb-6 mx-auto flex items-center justify-center border-2 border-black transition-all ${isDragging || isUploading ? 'bg-black text-vibrant-yellow scale-110 rotate-90' : 'bg-vibrant-yellow text-black'}`}>
          <span className="material-symbols-outlined text-4xl font-black">
            {isUploading ? "sync" : "upload_file"}
          </span>
        </div>
        
        <h3 className="font-manrope font-black text-2xl tracking-tighter uppercase mb-2">VAULT_INGESTOR</h3>
        <p className="font-inter text-[10px] font-black tracking-[0.3em] text-black/40 uppercase mb-8">DROP_RAW_ASSETS_HERE</p>
        
        {status ? (
          <div className="bg-black text-vibrant-yellow px-4 py-2 font-inter text-[10px] font-black uppercase tracking-widest animate-pulse border-2 border-vibrant-yellow">
            {status}
          </div>
        ) : (
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <p className="font-inter text-[8px] font-black text-black/60 uppercase">AUTO_EXTRACT: TEMPO / ENERGY / DANCE</p>
             <p className="font-inter text-[8px] font-black text-red-600 uppercase">ENFORCING: 20%_OUTWORLD_WATERMARK</p>
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
