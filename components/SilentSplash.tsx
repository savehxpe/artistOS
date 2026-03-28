'use client';

import { motion } from "framer-motion";
import { OutlandiaLogo } from "./OutlandiaLogo";

export const SilentSplash = () => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center font-inter"
        >
            {/* The centered Outlandia mark (Geometric icon + Wordmark) */}
            <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
            >
                <OutlandiaLogo showWordmark={true} className="pointer-events-none" />
            </motion.div>
        </motion.div>
    );
};
