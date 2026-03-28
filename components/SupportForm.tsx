"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * @component SupportForm
 * @description A high-fidelity, human-centered contact form for Outlandia.
 * Replaces technical ticketing with an editorial-style interface.
 */
export const SupportForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate high-velocity processing
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col space-y-12 p-10 md:p-16 bg-[#0A0A0A] rounded-[12px] border border-gray-900 shadow-2xl relative overflow-hidden"
          >
            <header>
              <h2 className="text-[11px] text-[#FFFF00] font-inter uppercase tracking-[0.4em] mb-6 font-black">
                Contact // Support
              </h2>
              <p className="text-4xl md:text-5xl font-manrope font-bold text-white tracking-tighter leading-none italic">
                How can we help?
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col space-y-3 group">
                <label className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold ml-1 transition-all group-focus-within:text-white group-focus-within:translate-x-1">
                  Your Identity
                </label>
                <input 
                  type="text" 
                  required
                  className="w-full p-5 bg-black border border-gray-800 rounded-[12px] text-white font-manrope font-bold text-lg focus:border-white transition-all outline-none placeholder:text-gray-900"
                  placeholder="Artist / Collective Name"
                />
              </div>

              <div className="flex flex-col space-y-3 group">
                <label className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold ml-1 transition-all group-focus-within:text-white group-focus-within:translate-x-1">
                  The Objective
                </label>
                <textarea 
                  rows={5}
                  required
                  className="w-full p-5 bg-black border border-gray-800 rounded-[12px] text-white font-manrope font-bold text-lg focus:border-white transition-all outline-none resize-none placeholder:text-gray-900"
                  placeholder="Describe your requirement..."
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-[#FFFF00] text-black rounded-full font-manrope font-black text-[11px] uppercase tracking-[0.4em] hover:shadow-[0_0_40px_rgba(255,255,0,0.15)] active:scale-95 transition-all disabled:opacity-50 outlandia-pulse"
              >
                {loading ? "Transmitting..." : "Send Request"}
              </button>
            </form>

            <div className="pt-10 border-t border-gray-900/50 text-center">
              <p className="text-[10px] text-gray-700 font-inter uppercase tracking-[0.5em] font-bold">
                Average Response Time // 2 Hours
              </p>
            </div>
            
            {/* Background Atmosphere */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-20 text-center flex flex-col items-center justify-center bg-[#0A0A0A] rounded-[12px] border border-gray-900"
          >
            <div className="w-16 h-16 rounded-full border-4 border-[#FFFF00] flex items-center justify-center mb-10">
                <span className="material-symbols-outlined text-[#FFFF00] text-3xl font-bold">check</span>
            </div>
            <h3 className="text-3xl font-manrope font-bold text-white uppercase italic tracking-tighter mb-4">
               Request Received
            </h3>
            <p className="text-[12px] text-gray-500 uppercase tracking-[0.3em] font-bold">
               We'll be in touch shortly.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
