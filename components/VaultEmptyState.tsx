"use client";

import { motion } from "framer-motion";

interface VaultEmptyStateProps {
  onIngest: () => void;
}

export const VaultEmptyState = ({ onIngest }: VaultEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-black border-2 border-dashed border-zinc-800 rounded-[12px] p-20 transition-all hover:border-white group relative overflow-hidden">
      {/* Geometric 'Plus' Icon */}
      <div className="w-16 h-16 mb-8 rounded-[12px] border-2 border-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-200">
        <span className="text-4xl font-light">+</span>
      </div>

      {/* Human Text CTA */}
      <h2 className="text-2xl font-manrope font-bold text-white mb-2 tracking-tight">
        Ingest Your First Record
      </h2>
      <p className="text-zinc-500 font-inter text-sm mb-8 text-center max-w-sm">
        Drop your stems, masters, or visuals here to start the vault.
      </p>

      {/* The Rounded Action Pill */}
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onIngest}
        className="px-10 py-4 bg-white text-black rounded-full font-manrope font-bold text-sm uppercase tracking-widest relative z-10 hover:shadow-[0_0_30px_rgba(255,255,0,0.5)] transition-all"
      >
        Choose Files
      </motion.button>

      {/* Outworld Aura Pulse */}
      <motion.div 
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 w-40 h-10 bg-[#FFFF00] blur-[60px] pointer-events-none opacity-20"
      />
    </div>
  );
};
