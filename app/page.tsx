import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-1000">
      <div className="space-y-2">
        <h2 className="text-primary font-mono text-sm uppercase tracking-widest">ARTIST ENGINE // V1.0</h2>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
          OUTLANDIA<span className="text-primary">.</span>
        </h1>
      </div>
      
      <p className="max-w-md text-zinc-400 font-medium">
        The complete mission-control suite for artist teams. Analyze, track, and amplify your creative rollout.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/dashboard" 
          className="bg-primary hover:bg-primary-hover text-black px-8 py-4 font-black uppercase tracking-tight transition-transform active:scale-95 text-xl"
        >
          ENTER TERMINAL
        </Link>
        <a 
          href="https://github.com/savehxpe/artistOS" 
          target="_blank"
          className="bg-zinc-900 border border-zinc-800 text-white px-8 py-4 font-black uppercase tracking-tight transition-all hover:bg-zinc-800 active:scale-95 text-xl"
        >
          VIEW SOURCE
        </a>
      </div>

      <div className="absolute bottom-8 left-8 flex items-center space-x-2">
        <div className="w-2 h-2 bg-primary animate-pulse" />
        <span className="text-xs font-mono uppercase tracking-widest opacity-50">SYSTEM_STABLE // CONNECTED</span>
      </div>
    </main>
  );
}
