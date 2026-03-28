"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LaunchChecklist } from "../../components/LaunchChecklist";
import { OutlandiaLogo } from "../../components/OutlandiaLogo";
import { withOnboardingGuard } from "../../components/withOnboardingGuard";

function LaunchPage() {
  const [isLaunched, setIsLaunched] = useState(false);

  const handleFinalLaunch = () => {
    setIsLaunched(true);
  };

  if (isLaunched) {
    return (
      <div className="bg-black text-white font-inter min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-12"
        >
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-[#FFFF00] flex items-center justify-center mb-12 shadow-[0_0_50px_rgba(255,255,0,0.2)]">
                <span className="material-symbols-outlined text-4xl text-[#FFFF00]">rocket_launch</span>
            </div>
            <h1 className="text-8xl font-manrope font-black italic tracking-tighter uppercase mb-4 transition-all animate-pulse">
                Mission<br/>Deployed
            </h1>
            <div className="w-12 h-[1px] bg-[#FFFF00]/40 my-8"></div>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.5em] font-bold">
                Maseru Mission Control • Execution Successful
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-white text-black px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#FFFF00] transition-all active:scale-95"
            >
              Back to Base
            </button>
            <button 
               onClick={() => window.print()}
              className="bg-zinc-900 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95 border border-white/5"
            >
              Export Manifest
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white font-inter min-h-screen relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#FFFF00]/5 blur-[120px] rounded-full"></div>
      
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 min-h-screen animate-in duration-1500 relative z-10">
        <header className="mb-24 flex flex-col items-center text-center">
            <OutlandiaLogo />
            <div className="w-12 h-[0.5px] bg-white/20 mb-8 mt-4" />
            <p className="text-[10px] font-medium tracking-widest text-[#FFFF00] uppercase tracking-[0.4em]">
                System Validation
            </p>
        </header>

        <section className="max-w-4xl mx-auto">
          <LaunchChecklist onLaunch={handleFinalLaunch} />
        </section>
        
        <footer className="mt-24 space-y-4">
            <div className="flex justify-center gap-12 opacity-10">
                {["AES-256 Encrypted", "SSL Validated", "Multi-Sig Active"].map((s, i) => (
                    <p key={i} className="text-[8px] font-black uppercase tracking-[0.4em]">{s}</p>
                ))}
            </div>
            <p className="text-center text-[9px] text-gray-700 font-inter uppercase tracking-[0.3em] opacity-40">
                Authorized by Outworld Systems Inc. • Maseru Mission Control
            </p>
        </footer>
      </main>
    </div>
  );
}

export default withOnboardingGuard(LaunchPage);
