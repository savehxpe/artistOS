"use client";

import { useState, useEffect } from "react";
import { auth, db, collection, query, onSnapshot, orderBy } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Contract } from "../lib/types";

export const ContractVault = () => {
  const [user, setUser] = useState<any>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Split-Sheet" | "Sync License">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<Contract | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const legalRef = collection(db, "users", currentUser.uid, "legal");
        const q = query(legalRef, orderBy("createdAt", "desc"));

        const unsubscribeLegal = onSnapshot(q, (snapshot) => {
          const legalData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Contract[];
          setContracts(legalData);
          setLoading(false);
        });

        return () => unsubscribeLegal();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const filteredContracts = contracts.filter(doc => {
    const matchesFilter = filter === "All" || doc.category === filter;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.parties.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="w-full h-64 flex items-center justify-center bg-black rounded-[12px] border border-gray-900">
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-black p-6 rounded-[12px] border border-gray-900 overflow-y-auto font-inter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h3 className="text-2xl font-manrope font-bold text-white uppercase italic tracking-tighter mb-1">
            Contract Vault
          </h3>
          <p className="text-[10px] text-gray-500 font-inter uppercase tracking-widest">
            {contracts.length} Documents Archived • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {(["All", "Split-Sheet", "Sync License"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? "bg-white text-black" : "bg-zinc-900 text-gray-500 hover:text-white border border-gray-800"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <input 
          type="text"
          placeholder="Find a document..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0A0A0A] border border-gray-900 p-4 rounded-[12px] text-sm text-white focus:outline-none focus:border-white transition-all placeholder:text-gray-700 font-inter"
        />
      </div>

      {/* The Legal List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-gray-900 rounded-[12px]">
            <p className="text-gray-600 text-[10px] uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          filteredContracts.map((doc, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={doc.id}
              onClick={() => setPreviewDoc(doc)}
              className="group flex items-center justify-between p-5 bg-[#0A0A0A] border border-gray-900 rounded-[12px] hover:border-white transition-all cursor-pointer active:scale-95"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] text-[#FFFF00] uppercase tracking-tighter font-black bg-[#FFFF00]/10 px-2 py-0.5 rounded">
                    Executed
                  </span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-tighter font-inter">
                    {doc.category}
                  </span>
                </div>
                <span className="text-lg font-manrope font-bold text-white tracking-tight">
                  {doc.title}
                </span>
                <span className="text-[10px] text-gray-600 font-inter mt-1 uppercase tracking-widest">
                  {doc.parties}
                </span>
              </div>
              
              <div className="w-10 h-10 rounded-full border border-gray-900 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all group-hover:border-white">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Watermarked Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl bg-zinc-950 border border-gray-900 rounded-[12px] overflow-hidden flex flex-col h-[80vh] relative shadow-2xl"
            >
              <div className="p-6 border-b border-gray-900 flex justify-between items-center bg-black">
                <div>
                   <span className="text-[10px] text-gray-500 uppercase tracking-widest font-inter mb-1 block">Legal Repository</span>
                   <h4 className="text-xl font-manrope font-bold text-white tracking-tight">{previewDoc.title}</h4>
                </div>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-12 relative bg-[#050505]">
                {/* Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-wrap items-center justify-center opacity-[0.03] overflow-hidden select-none">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="text-6xl font-black uppercase -rotate-45 p-12 text-white whitespace-nowrap">
                      OUTLANDIA LEGAL ARCHIVE
                    </span>
                  ))}
                </div>

                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                  <div className="flex justify-between items-start border-b border-gray-900 pb-8">
                    <div className="text-3xl font-manrope font-black italic uppercase tracking-tighter text-white">O</div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Date Executed</p>
                      <p className="text-sm font-bold text-white">{new Date(previewDoc.createdAt?.toDate?.() || previewDoc.createdAt || Date.now()).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="space-y-6 text-gray-400 font-inter text-sm leading-relaxed">
                    <p className="text-white font-bold uppercase tracking-widest text-xs">Agreement Summary</p>
                    <p>This document serves as the official legal record of the {previewDoc.category} executed by {previewDoc.parties}.</p>
                    <div className="p-6 bg-black border border-gray-900 rounded-[8px] space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Contract ID</p>
                            <p className="text-[10px] font-mono text-gray-400">{previewDoc.id}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-[10px] font-bold text-[#FFFF00]">VALIDATED & ENCRYPTED</p>
                          </div>
                       </div>
                    </div>
                    <div className="pt-12 border-t border-gray-900 flex justify-between items-end">
                       <div className="space-y-2">
                          <p className="text-[8px] text-gray-600 uppercase tracking-widest">Signatory</p>
                          <div className="w-48 h-12 bg-white/5 rounded border border-gray-900 flex items-center justify-center">
                             <span className="text-gray-700 italic font-serif opacity-30">Encrypted Signature</span>
                          </div>
                       </div>
                       <div className="text-right italic text-[10px] text-gray-700">
                          Authorized by SaveHxpe • Outworld Systems Inc.
                       </div>
                    </div>
                  </div>
                </div>
              </div>

               <div className="p-6 border-t border-gray-900 flex justify-center bg-black">
                  <button 
                    onClick={() => {
                      alert("Document processing... Your encrypted PDF is being generated.");
                    }}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">download</span> Download PDF Archive
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
