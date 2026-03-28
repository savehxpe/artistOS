"use client";

import { SpotifyStats, YouTubeStats } from "../lib/types";

export default function ArtistStats({ spotify, youtube }: { 
  spotify: SpotifyStats | null, 
  youtube: YouTubeStats | null 
}) {
  if (!spotify && !youtube) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {spotify && (
        <div className="bg-zinc-950/50 border border-white/5 p-8 space-y-8 rounded-[12px] backdrop-blur-sm group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="font-inter text-white/20 font-bold uppercase tracking-[0.3em] text-[10px]">Spotify signal</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </div>
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-white/40 font-inter text-[10px] font-bold uppercase tracking-widest">Followers</span>
              <span className="text-4xl font-manrope font-bold tracking-tighter">{spotify.followers?.total?.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white/40 font-inter text-[10px] font-bold uppercase tracking-widest">Popularity</span>
              <span className="text-4xl font-manrope font-bold tracking-tighter">{spotify.popularity}%</span>
            </div>
            {spotify.name && (
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <span className="text-white/20 font-inter text-[10px] font-bold uppercase tracking-widest">Artist</span>
                <span className="text-sm font-manrope font-bold tracking-tight text-white/80 truncate max-w-[150px]">{spotify.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {youtube && (
        <div className="bg-zinc-950/50 border border-white/5 p-8 space-y-8 rounded-[12px] backdrop-blur-sm group hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="font-inter text-white/20 font-bold uppercase tracking-[0.3em] text-[10px]">YouTube signal</h3>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          </div>
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-white/40 font-inter text-[10px] font-bold uppercase tracking-widest">Subscribers</span>
              <span className="text-4xl font-manrope font-bold tracking-tighter">{parseInt(youtube.subscribers).toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white/40 font-inter text-[10px] font-bold uppercase tracking-widest">Total views</span>
              <span className="text-4xl font-manrope font-bold tracking-tighter">{parseInt(youtube.views).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <span className="text-white/20 font-inter text-[10px] font-bold uppercase tracking-widest">Videos</span>
              <span className="text-sm font-manrope font-bold tracking-tight text-white/80">{parseInt(youtube.videos).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

