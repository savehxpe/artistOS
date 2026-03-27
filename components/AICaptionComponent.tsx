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
    <div className="bg-black border border-white p-6 space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-zinc-500 uppercase tracking-widest text-xs">AI GENERATION ENGINE</h3>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
      </div>

      <button
        onClick={generateCaption}
        disabled={loading}
        className="w-full bg-white hover:bg-zinc-200 text-black px-6 py-4 font-black uppercase tracking-widest text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? "PROCESSING SYNTHESIS..." : "GENERATE CAPTION"}
      </button>

      {error && <p className="text-red-500 text-xs font-mono uppercase">{error}</p>}

      {aiOutput && (
        <div className="pt-4 border-t border-zinc-900 space-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-600">Generated Output:</p>
          <div className="p-4 bg-zinc-900 border border-zinc-800 text-white font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {aiOutput}
          </div>
        </div>
      )}
    </div>
  );
}
