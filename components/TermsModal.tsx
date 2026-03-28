"use client";

import { motion } from 'framer-motion';

/**
 * @component TermsModal
 * @description The "Legal Handshake" component.
 * Ensures users clear the legal gate before accessing the OS.
 */
export const TermsModal = ({ onAccept }: { onAccept: () => void }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-3xl z-[200] p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.05, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.11, 0, 0.5, 0] }} // circOut
        className="w-full max-w-lg bg-black border-4 border-white rounded-[12px] p-10 flex flex-col shadow-[0_0_100px_rgba(255,255,255,0.1)]"
      >
        <h2 className="text-4xl font-manrope font-black text-white uppercase italic tracking-tighter mb-8 leading-none">
          Legal Handshake
        </h2>

        <div className="h-64 overflow-y-auto pr-6 mb-10 text-sm md:text-md text-[#666666] font-inter leading-relaxed space-y-6 custom-scrollbar">
          <p>
            <strong className="text-white block mb-2 uppercase tracking-[0.1em] text-[12px] font-black">01. Ownership</strong> 
            You retain 100% ownership of all creative assets uploaded to the Vault. Outlandia claims zero rights to your masters or publishing.
          </p>
          <p>
            <strong className="text-white block mb-2 uppercase tracking-[0.1em] text-[12px] font-black">02. Collective Data</strong> 
            We ingest handles and project data solely to generate your Campaign Roadmap. We do not sell or share your metrics with third parties.
          </p>
          <p>
            <strong className="text-white block mb-2 uppercase tracking-[0.1em] text-[12px] font-black">03. Professional Workspace</strong> 
            This OS is a tool for independence. By clicking accept, you agree to use Outlandia as a professional workspace for your creative career.
          </p>
        </div>

        <button 
          onClick={onAccept}
          className="w-full py-6 bg-[#FFFF00] text-black rounded-full font-manrope font-black text-[11px] uppercase tracking-[0.4em] hover:shadow-[0_0_40px_rgba(255,255,0,0.3)] active:scale-95 transition-all outlandia-pulse"
        >
          I Accept the Terms
        </button>

        <p className="mt-10 text-[9px] text-gray-800 text-center uppercase tracking-[0.6em] font-black">
          Friday, March 27, 2026 • Secure Authorization
        </p>
      </motion.div>
    </div>
  );
};
