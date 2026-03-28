"use client";

import { useState, useEffect } from "react";
import { auth, db, collection, onSnapshot, query, where } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

interface LaunchChecklistProps {
  onLaunch?: () => void;
}

export const LaunchChecklist = ({ onLaunch }: LaunchChecklistProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState({
    vault: false,
    legal: false,
    tasks: false
  });
  const [counts, setCounts] = useState({
    vault: 0,
    legal: 0,
    tasksTotal: 0,
    tasksCompleted: 0
  });
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Vault Status
        const vaultRef = collection(db, "users", currentUser.uid, "vault");
        const unsubVault = onSnapshot(vaultRef, (s) => {
          setCounts(prev => ({ ...prev, vault: s.size }));
          setStatuses(prev => ({ ...prev, vault: s.size > 0 }));
        });

        // Legal Status
        const legalRef = collection(db, "users", currentUser.uid, "legal");
        const unsubLegal = onSnapshot(legalRef, (s) => {
          setCounts(prev => ({ ...prev, legal: s.size > 0 ? 1 : 0 }));
          setStatuses(prev => ({ ...prev, legal: s.size > 0 }));
        });

        // Tasks Status
        const tasksRef = collection(db, "users", currentUser.uid, "tasks");
        const unsubTasks = onSnapshot(tasksRef, (s) => {
          const total = s.size;
          const completed = s.docs.filter(d => d.data().completed).length;
          setCounts(prev => ({ ...prev, tasksTotal: total, tasksCompleted: completed }));
          setStatuses(prev => ({ ...prev, tasks: total > 0 && completed === total }));
        });

        setLoading(false);
        return () => {
          unsubVault();
          unsubLegal();
          unsubTasks();
        };
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleGoLive = () => {
    if (!statuses.vault || !statuses.legal || !statuses.tasks) return;
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      if (onLaunch) onLaunch();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onLaunch]);

  const allReady = statuses.vault && statuses.legal && statuses.tasks;

  if (loading) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-10 bg-black rounded-[12px] border border-gray-900 shadow-2xl font-inter relative overflow-hidden">
      <AnimatePresence>
        {countdown !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-12"
          >
            <motion.h2 
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-9xl font-manrope font-black text-white italic tracking-tighter"
            >
              {countdown > 0 ? countdown : "IGNITION"}
            </motion.h2>
            <p className="mt-8 text-gray-500 text-[10px] uppercase tracking-[0.5em] animate-pulse">
              Final Sequence Initialized
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-12">
        <h2 className="text-5xl font-manrope font-bold text-white uppercase italic tracking-tighter mb-4">
          Launch Sequence
        </h2>
        <p className="text-gray-500 font-inter text-sm uppercase tracking-widest">
          Maseru Mission Control • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* The 3-Column Validation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Vault Status', value: statuses.vault ? 'Masters Ingested' : 'Empty Repository', status: statuses.vault ? 'Ready' : 'Pending' },
          { label: 'Legal Status', value: statuses.legal ? 'Splits Executed' : 'Unsigned Documents', status: statuses.legal ? 'Ready' : 'Pending' },
          { label: 'Roadmap Status', value: statuses.tasks ? 'Execution Complete' : `${counts.tasksCompleted}/${counts.tasksTotal} Items Locked`, status: statuses.tasks ? 'Ready' : 'Processing' }
        ].map((item, i) => (
          <div key={i} className={`p-6 bg-[#0A0A0A] border rounded-[12px] flex flex-col items-center transition-all ${item.status === 'Ready' ? 'border-[#FFFF00]/20' : 'border-gray-900'}`}>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 font-inter">{item.label}</span>
            <span className={`text-lg font-manrope font-bold text-center mb-6 leading-tight ${item.status === 'Ready' ? 'text-white' : 'text-gray-600'}`}>
              {item.value}
            </span>
            <div className={`px-4 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${item.status === 'Ready' ? 'bg-[#FFFF00] text-black shadow-[0_0_15px_rgba(255,255,0,0.3)]' : 'bg-zinc-900 text-gray-500'}`}>
              {item.status}
            </div>
          </div>
        ))}
      </div>

      {/* The Final Action Pill */}
      <div className="space-y-6">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleGoLive}
          disabled={!allReady}
          className={`w-full py-6 rounded-full font-manrope font-bold text-2xl uppercase tracking-[0.2em] transition-all duration-500 ${
            allReady 
              ? "bg-white text-black hover:bg-[#FFFF00] shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95" 
              : "bg-zinc-900 text-gray-700 cursor-not-allowed opacity-50"
          }`}
        >
          Go Live
        </motion.button>

        {!allReady && (
          <p className="text-center text-[9px] text-red-900/40 uppercase tracking-widest animate-pulse font-bold">
            System Locked • Complete all roadmap directives to enable sequence
          </p>
        )}
      </div>

      <p className="mt-12 text-center text-[9px] text-gray-700 font-inter uppercase tracking-widest">
        Authorized by SaveHxpe • Outworld Systems Inc.
      </p>
    </div>
  );
};
