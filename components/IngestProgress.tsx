"use client";

import { motion, AnimatePresence } from 'framer-motion';

interface IngestProgressProps {
  fileName: string;
  progress: number;
}

export const IngestProgress = ({ fileName, progress }: IngestProgressProps) => {
  const isComplete = progress >= 100;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md p-6 bg-black rounded-[12px] border border-zinc-800 shadow-2xl relative overflow-hidden"
    >
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-inter mb-1">Ingesting Record</span>
          <span className="text-sm font-manrope font-bold text-white truncate max-w-[200px]">{fileName}</span>
        </div>
        <span className="text-sm font-manrope font-bold text-[#FFFF00]">{progress}%</span>
      </div>

      {/* The Progress Track */}
      <div className="h-2 w-full bg-[#1A1A1A] rounded-full overflow-hidden relative">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`h-full relative rounded-full ${isComplete ? 'bg-white' : 'bg-[#FFFF00]'}`}
        >
          {/* Leading Edge Glow (Outlandia Pulse) */}
          <AnimatePresence>
            {!isComplete && (
              <motion.div 
                animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute right-0 top-0 h-full w-8 bg-[#FFFF00] blur-md mix-blend-screen"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-[9px] text-zinc-800 font-bold uppercase tracking-widest">
            {isComplete ? "Ingestion Complete" : "Staged at Vault Entrance"}
        </span>
        <p className="text-[10px] text-zinc-600 font-inter uppercase tracking-tighter">
            Estimated: 12s • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Completion Flash */}
      <AnimatePresence>
        {isComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
