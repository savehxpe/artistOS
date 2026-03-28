"use client";

import { useState } from "react";

export default function AICaptionComponent({ spotify, youtube }: { spotify: any, youtube: any }) {
  const [aiOutput, setAiOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateCaption = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: `
            Artist stats:
            Spotify followers: ${spotify?.followers?.total || 'Unknown'}
            YouTube subscribers: ${youtube?.subscribers || 'Unknown'}
            Name: ${spotify?.name || 'Unknown Artist'}

            Generate ONE short, catchy music caption to engage fans. Needs to be simple and punchy.
          `
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setAiOutput(data.output);
      } else {
        setError(data.error || "Failed to generate caption");
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (!spotify && !youtube) return null;

  return (
    <div className="bg-[#0A0A0A] border border-zinc-900 p-8 rounded-[12px] space-y-6 shadow-2xl font-inter">
      <div className="flex items-center justify-between">
        <h3 className="font-manrope font-bold text-white uppercase tracking-widest text-[10px]">AI Insight Engine</h3>
        <div className="w-1.5 h-1.5 bg-[#FFFF00] rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,0,0.5)]" />
      </div>

      <button
        onClick={generateCaption}
        disabled={loading}
        className="w-full bg-white hover:bg-[#FFFF00] text-black px-8 py-5 font-manrope font-black uppercase tracking-[0.2em] text-[10px] transition-all disabled:opacity-50 flex items-center justify-center gap-3 rounded-full active:scale-95 shadow-lg"
      >
        {loading ? (
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-black rounded-full animate-bounce"></div>
          </div>
        ) : (
          <>
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Generate Hook
          </>
        )}
      </button>

      {error && <p className="text-red-900 font-bold text-[9px] uppercase tracking-widest text-center">{error}</p>}

      {aiOutput && (
        <div className="pt-6 border-t border-zinc-900 space-y-4 animate-in slide-in-from-top duration-500">
          <p className="font-manrope font-bold text-[9px] uppercase tracking-widest text-zinc-600">Generated Synthesis:</p>
          <div className="p-6 bg-black border border-zinc-900 text-white font-inter text-sm italic leading-relaxed whitespace-pre-wrap rounded-[12px] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FFFF00] opacity-40 group-hover:opacity-100 transition-opacity" />
            "{aiOutput}"
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(aiOutput)}
            className="text-[9px] text-[#FFFF00] uppercase tracking-widest font-black flex items-center gap-2 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xs">content_copy</span> Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
