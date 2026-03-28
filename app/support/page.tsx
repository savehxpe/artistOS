"use client";

import { SupportForm } from "@/components/SupportForm";
import { OutlandiaLogo } from "@/components/OutlandiaLogo";
import { motion } from "framer-motion";
import Link from "next/link";

/**
 * @page Support
 * @description The dedicated high-fidelity Support portal for Outlandia artists.
 */
export default function SupportPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-start overflow-x-hidden font-inter pt-20 pb-40">
      
      {/* 1. Brand Context */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "circOut" }}
        className="mb-24 flex flex-col items-center"
      >
        <OutlandiaLogo size="md" />
        <div className="w-16 h-[1px] bg-white/10 mt-12 mb-8" />
        <Link 
          href="/" 
          className="text-[10px] font-black uppercase tracking-[0.5em] text-[#666666] hover:text-white transition-all active:scale-95"
        >
          Return to Hub
        </Link>
      </motion.div>

      {/* 2. Primary Form Module */}
      <div className="w-full relative z-10">
        <SupportForm />
      </div>

      {/* 3. Footer Branding */}
      <footer className="mt-40 text-center opacity-10">
        <p className="text-[9px] font-bold uppercase tracking-[0.8em]">
           Maseru // Global // Support
        </p>
      </footer>
      
      {/* Atmosphere Fade */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,0,0.02)_0%,transparent_80%)]" />
    </div>
  );
}
