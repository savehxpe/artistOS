"use client";

import { useState } from "react";

export default function YouTubeInput({ onData }: { onData: (data: any) => void }) {
  const [channelId, setChannelId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/youtube?channelId=${channelId}`);
      const data = await res.json();
      
      if (res.ok) {
        onData(data);
      } else {
        setError(data.error || "Failed to fetch YouTube stats");
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="bg-black border border-white p-3 text-white uppercase font-mono text-sm w-full outline-none focus:border-zinc-500"
          placeholder="ENTER YOUTUBE CHANNEL ID"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
        />
        <button 
          onClick={handleFetch}
          disabled={loading || !channelId}
          className="bg-white hover:bg-zinc-200 text-black px-6 py-3 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {loading ? "SYNCING..." : "CONNECT YT"}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs font-mono uppercase">{error}</p>}
    </div>
  );
}
