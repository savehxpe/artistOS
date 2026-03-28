"use client";

import { useState } from "react";
import { SpotifyStats } from "../lib/types";

export default function SpotifyInput({ onData }: { onData: (data: SpotifyStats) => void }) {
  const [artistUrl, setArtistUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/spotify?artistUrl=${encodeURIComponent(artistUrl)}`);
      const data: SpotifyStats = await res.json();
      
      if (res.ok) {
        onData(data);
      } else {
        setError((data as any).error || "Failed to fetch Spotify stats");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="bg-black border border-white p-3 text-white uppercase font-mono text-sm w-full outline-none focus:border-zinc-500"
          placeholder="ENTER SPOTIFY ARTIST LINK OR ID"
          value={artistUrl}
          onChange={(e) => setArtistUrl(e.target.value)}
        />
        <button 
          onClick={handleFetch}
          disabled={loading || !artistUrl}
          className="bg-white hover:bg-zinc-200 text-black px-6 py-3 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {loading ? "SYNCING..." : "CONNECT SP"}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs font-mono uppercase">{error}</p>}
    </div>
  );
}
