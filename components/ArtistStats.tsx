"use client";

export default function ArtistStats({ spotify, youtube }: { spotify: any, youtube: any }) {
  if (!spotify && !youtube) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {spotify && (
        <div className="bg-black border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-zinc-500 uppercase tracking-widest text-xs">SPOTIFY SIGNAL</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 font-mono text-xs uppercase">Followers</span>
              <span className="text-3xl font-black">{spotify.followers?.total?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 font-mono text-xs uppercase">Popularity</span>
              <span className="text-3xl font-black">{spotify.popularity} / 100</span>
            </div>
            {spotify.name && (
              <div className="flex justify-between items-baseline pt-4 border-t border-zinc-900">
                <span className="text-zinc-500 font-mono text-xs uppercase">Artist</span>
                <span className="text-xl font-bold uppercase truncate max-w-[150px]">{spotify.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {youtube && (
        <div className="bg-black border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-zinc-500 uppercase tracking-widest text-xs">YOUTUBE SIGNAL</h3>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 font-mono text-xs uppercase">Subscribers</span>
              <span className="text-3xl font-black">{parseInt(youtube.subscribers).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500 font-mono text-xs uppercase">Total Views</span>
              <span className="text-3xl font-black">{parseInt(youtube.views).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-zinc-900">
              <span className="text-zinc-500 font-mono text-xs uppercase">Videos</span>
              <span className="text-xl font-bold">{parseInt(youtube.videos).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
