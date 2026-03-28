"use client";

import { motion, AnimatePresence } from 'framer-motion';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideDrawer = ({ isOpen, onClose }: SideDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[99]"
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-black border-l border-gray-900 z-[100] p-10 flex flex-col font-inter"
          >
            {/* Close Trigger */}
            <div className="flex justify-between items-center mb-12">
               <span className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em]">Menu</span>
               <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-white transition-colors active:scale-95 text-[10px] font-bold uppercase tracking-widest"
                >
                  CLOSE
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-4">
              {['About', 'Support', 'Legal'].map((item) => (
                <motion.a
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  whileTap={{ scale: 0.95 }}
                  className="p-5 border border-gray-900 rounded-[12px] text-white font-manrope font-bold uppercase tracking-widest hover:border-white transition-all bg-zinc-950/30"
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            {/* Grounded Footer */}
            <div className="mt-auto pt-10 border-t border-gray-900">
              <p className="text-[10px] text-gray-600 font-inter uppercase tracking-widest leading-loose">
                Outlandia © 2026<br />
                Maseru, Lesotho
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
