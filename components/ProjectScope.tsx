"use client";

import { motion } from 'framer-motion';

/**
 * @component ProjectScope
 * @description Diagnostic Step 01: Project Archetype Selection.
 * Implementation of the editorial-minimalist design for Outlandia.
 */
interface ProjectScopeProps {
  onSelect: (type: string) => void;
  currentType?: string;
}

export const ProjectScope = ({ onSelect, currentType }: ProjectScopeProps) => {
  const options = [
    { 
      id: 'Single', 
      label: 'Single', 
      description: 'Focused release for maximum visibility and playlisting potential.',
      tag: '01 TRACK'
    },
    { 
      id: 'EP', 
      label: 'EP', 
      description: 'Extended Play. A cohesive body of work to define your sound.',
      tag: '3-6 TRACKS'
    },
    { 
      id: 'Album', 
      label: 'Album', 
      description: 'A full-length masterwork. Maximum depth and fan engagement.',
      tag: '8+ TRACKS'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.11, 0, 0.5, 0] }} // circOut
      className="w-full max-w-2xl space-y-12 bg-[#0A0A0A] p-10 md:p-16 rounded-[12px] border border-gray-900 shadow-2xl relative overflow-hidden"
    >
      <header className="mb-16">
        <h2 className="text-[11px] text-[#FFFF00] font-inter uppercase tracking-[0.4em] mb-6 font-black">
          DIAGNOSTIC // PARAMETER 01
        </h2>
        <p className="text-4xl md:text-5xl font-manrope font-bold text-white tracking-tighter leading-none italic uppercase">
          Project Archetype
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`
              relative group flex flex-col items-start p-10 
              bg-zinc-900/40 border-2 transition-all duration-300
              rounded-[12px] overflow-hidden text-left
              ${currentType === opt.id 
                ? 'border-[#FFFF00] shadow-[0_0_50px_rgba(255,255,0,0.1)]' 
                : 'border-white/5 hover:border-white/20'}
            `}
          >
            <div className="flex justify-between items-center w-full mb-4">
              <span className="text-2xl font-manrope font-black text-white italic tracking-tight group-hover:text-[#FFFF00] transition-colors">
                {opt.label}
              </span>
              <span className="text-[9px] font-black text-[#666666] uppercase tracking-[0.4em]">
                {opt.tag}
              </span>
            </div>
            <p className="text-sm text-[#666666] leading-relaxed max-w-md font-inter">
              {opt.description}
            </p>
            
            {/* Visual Highlight Pin */}
            {currentType === opt.id && (
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#FFFF00] shadow-[0_0_15px_rgba(255,255,0,0.8)]" />
            )}
          </button>
        ))}
      </div>

      {/* Background Atmosphere */}
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
    </motion.div>
  );
};
