import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="min-h-screen p-6 md:p-12 space-y-12 animate-in slide-in-from-bottom duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-12">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-primary">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="font-mono text-sm uppercase tracking-widest">LIVE_DASHBOARD</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            COMMAND CONTROL<span className="text-primary">.</span>
          </h1>
        </div>
        <Link 
          href="/" 
          className="text-zinc-500 hover:text-white transition-colors uppercase font-mono tracking-widest text-sm"
        >
          [ BACK_LOGOUT ]
        </Link>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards */}
        {[
          { label: "SPOTIFY REACH", value: "1.2M", trend: "+12%" },
          { label: "FAN LOYALTY", value: "88%", trend: "+5%" },
          { label: "CONTENT VELOCITY", value: "HIGH", trend: "OPTIMAL" },
        ].map((item, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-8 space-y-4">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">{item.label}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-black tracking-tight uppercase leading-none">{item.value}</span>
              <span className="text-primary text-xs font-mono">{item.trend}</span>
            </div>
            <div className="h-1 bg-zinc-800">
              <div className="h-full bg-primary" style={{ width: i === 0 ? "75%" : i === 1 ? "88%" : "100%" }} />
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black uppercase tracking-tight text-xl">UPCOMING DROPS</h3>
            <span className="text-primary font-mono text-xs">[ SYNCED ]</span>
          </div>
          <ul className="space-y-4">
            {[
              { title: "AFTER HOURS // PT 1", type: "SINGLE", date: "FEB 14" },
              { title: "MIDNIGHT CRYPT", type: "EP", date: "MAR 03" },
              { title: "PROJECT: OUTLANDIA", type: "ALBUM", date: "APR 20" },
            ].map((drop, i) => (
              <li key={i} className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="space-y-1">
                  <p className="font-bold text-lg leading-none">{drop.title}</p>
                  <p className="text-xs text-zinc-500 font-mono tracking-widest">{drop.type}</p>
                </div>
                <span className="font-mono text-primary text-sm">{drop.date}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent animate-spin" />
          <div className="space-y-2">
            <h3 className="font-black uppercase tracking-tight text-xl">AI SYNC IN PROGRESS</h3>
            <p className="max-w-xs text-zinc-500 leading-tight">Syncing your Spotify analytics and TikTok momentum data...</p>
          </div>
          <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 font-bold uppercase tracking-widest text-sm transition-colors">
            REFRESH CACHE
          </button>
        </div>
      </section>
      
      <div className="pt-12 border-t border-zinc-800 text-center opacity-20">
        <p className="font-mono text-xs uppercase tracking-widest leading-none">
          SYSTEM_ID: 114_OUT_PROD // ALL RIGHTS RESERVED BY SAVEHXPE
        </p>
      </div>
    </main>
  );
}
