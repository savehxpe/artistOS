"use client";

import { motion } from "framer-motion";

interface HardUnlockProps {
  onUnlock: () => void;
}

export const HardUnlock = ({ onUnlock }: HardUnlockProps) => {
  return (
    <div 
      onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
      onPointerDown={() => {
        // Start a 2-second timer
        (window as any).unlockTimer = setTimeout(() => {
          console.log("DEV_MODE: HARD_UNLOCK_ACTIVATED");
          onUnlock(); 
        }, 2000);
      }}
      onPointerUp={() => clearTimeout((window as any).unlockTimer)}
      className="absolute top-0 right-0 w-10 h-10 z-[10000] cursor-crosshair opacity-0 hover:opacity-10 transition-opacity bg-white/5"
    >
      {/* Hidden Dev Trigger */}
    </div>
  );
};
