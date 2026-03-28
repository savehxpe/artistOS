"use client";

import { motion } from "framer-motion";

interface StartRolloutButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const StartRolloutButton = ({ onClick, disabled }: StartRolloutButtonProps) => {
  return (
    <div className="relative flex justify-center w-full">
      {/* The "Outworld" Pulse (Atmospheric Glow) */}
      <motion.div 
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 -m-8 bg-[#FFFF00]/15 rounded-full blur-3xl pointer-events-none" 
      />
      
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={disabled}
        className="relative px-20 py-8 bg-white border border-white/20 rounded-full shadow-[0_0_80px_rgba(255,255,0,0.2)] transition-all hover:shadow-[0_0_100px_rgba(255,255,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed z-20 group"
      >
        {/* Secondary Inner Pulse */}
        {!disabled && (
          <motion.div 
            animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-[#FFFF00]/10 pointer-events-none" 
          />
        )}
        
        <span className="relative z-10 text-black font-manrope font-bold text-xl tracking-tight antialiased">
          {disabled ? "Initiating..." : "Start Rollout"}
        </span>
      </motion.button>
    </div>
  );
};
