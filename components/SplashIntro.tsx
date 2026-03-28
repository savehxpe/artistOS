"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { HardUnlock } from "./HardUnlock";

interface SplashIntroProps {
  onComplete: () => void;
  onDeveloperBypass: () => void;
}

export const SplashIntro = ({ onComplete, onDeveloperBypass }: SplashIntroProps) => {
  const [phase, setPhase] = useState<"initial" | "reveal" | "flatten" | "complete">("initial");

  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let oscillator: OscillatorNode | null = null;
    let gainNode: GainNode | null = null;

    const startThrum = () => {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      oscillator = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(40, audioCtx.currentTime); // Low bass frequency
      oscillator.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 3); // Slow drop

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 1); // Fade in

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
    };

    const stopThrum = () => {
      if (gainNode && audioCtx) {
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        setTimeout(() => {
          oscillator?.stop();
          audioCtx?.close();
        }, 500);
      }
    };

    // Phase Timeline
    const revealTimer = setTimeout(() => {
        setPhase("reveal");
        startThrum();
    }, 500);
    
    const flattenTimer = setTimeout(() => {
        setPhase("flatten");
        stopThrum();
    }, 3500);

    const completeTimer = setTimeout(() => {
      setPhase("complete");
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(flattenTimer);
      clearTimeout(completeTimer);
      if (audioCtx) {
        audioCtx.close();
      }
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden touch-none"
    >
      <HardUnlock onUnlock={onDeveloperBypass} />

      <motion.div 
        animate={phase === "reveal" ? { scale: [1, 1.02, 1], x: [0, 1, -1, 0] } : {}}
        transition={{ duration: 0.1, repeat: phase === "reveal" ? Infinity : 0 }}
        className="relative w-72 h-72 flex items-center justify-center perspective-[1200px]"
      >
        <AnimatePresence>
          {phase !== "complete" && (
            <motion.div
              initial={{ scale: 0, rotateY: 0, opacity: 0, translateZ: -500 }}
              animate={
                phase === "reveal" 
                  ? { scale: 1, rotateY: 720, opacity: 1, translateZ: 0 } 
                  : phase === "flatten" 
                  ? { scale: 1, rotateY: 0, opacity: 1, translateZ: 100 } 
                  : {}
              }
              transition={{
                duration: phase === "reveal" ? 3 : 0.6,
                ease: phase === "reveal" ? "circOut" : "backOut",
              }}
              className="relative preserve-3d"
            >
              {/* The "O" Mark - Chrome Finish */}
              <div 
                className="w-40 h-40 rounded-full border-[8px] flex items-center justify-center overflow-hidden"
                style={{
                  borderColor: "white",
                  background: "radial-gradient(circle at 30% 30%, #ffffff 0%, #a1a1aa 50%, #000000 100%)",
                  boxShadow: phase === "reveal" 
                    ? "0 0 60px 10px rgba(255, 255, 0, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.8)" 
                    : "0 0 20px rgba(255, 255, 255, 0.2)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Inner Void */}
                <div className="w-[85%] h-[85%] rounded-full bg-black shadow-inner" />

                {/* Chrome Highland catch */}
                <motion.div 
                  animate={{ 
                    rotate: [0, 360],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none"
                />
              </div>

              {/* Dynamic Yellow Rim Light (Bloom) */}
              <motion.div 
                animate={{ 
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.05, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 border-[1px] border-[#FFFF00]/40 rounded-full blur-2xl mix-blend-screen pointer-events-none"
              />

              {/* Edge Catch */}
              <motion.div 
                animate={{ x: [-20, 20, -20] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFFF00]/30 to-transparent blur-sm pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brand Text Appearing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase === "flatten" ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute mt-56"
        >
          <span className="text-white font-manrope font-bold text-3xl tracking-widest">
            OUTLANDIA
          </span>
        </motion.div>
      </motion.div>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-yellow-500/10 via-transparent to-transparent blur-[120px] rounded-full" />
      </div>
    </motion.div>
  );
};
