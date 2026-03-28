"use client";

import { useState, useEffect } from "react";
import { auth, db, collection, addDoc, serverTimestamp } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ContractVault } from "../../components/ContractVault";
import { MasterSignatureModal } from "../../components/MasterSignatureModal";
import { OutlandiaLogo } from "../../components/OutlandiaLogo";
import { withOnboardingGuard } from "../../components/withOnboardingGuard";

function LegalPage() {
  const [showSignModal, setShowSignModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignAgreement = async () => {
    if (!user) return;
    
    // Simulate creating a new agreement record
    const newDoc = {
      title: "Split-Sheet: " + (Math.random() > 0.5 ? "Neon Dreams" : "Midnight Pulse"),
      category: "Split-Sheet",
      parties: "SaveHxpe, Outworld Records",
      status: "Executed",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "users", user.uid, "legal"), newDoc);
      setShowSignModal(false);
    } catch (err) {
      console.error("Legal Archive Error:", err);
    }
  };

  return (
    <div className="bg-black text-white font-inter min-h-screen">
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 min-h-screen animate-in fade-in duration-1000">
        <header className="mb-24 flex flex-col items-center text-center">
          <OutlandiaLogo />
          <div className="w-12 h-[0.5px] bg-white/20 mb-8 mt-4" />
          <p className="text-[10px] font-medium tracking-widest text-[#FFFF00] uppercase tracking-[0.4em]">
            Legal Repository
          </p>
        </header>

        <div className="max-w-5xl mx-auto mb-12 flex justify-end">
            <button 
                onClick={() => setShowSignModal(true)}
                className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#FFFF00] transition-all active:scale-95 flex items-center gap-3"
            >
                <span className="material-symbols-outlined text-sm">edit_document</span>
                Execute New Agreement
            </button>
        </div>

        <section className="max-w-5xl mx-auto h-[600px]">
          <ContractVault />
        </section>

        {showSignModal && (
            <MasterSignatureModal 
                documentName="Universal Split-Sheet v1.0"
                onSign={handleSignAgreement}
                onCancel={() => setShowSignModal(false)}
            />
        )}

        <footer className="mt-24 text-center">
            <p className="text-[10px] text-gray-700 font-inter uppercase tracking-[0.3em]">
                All records are permanently encrypted and archived for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
            </p>
        </footer>
      </main>
    </div>
  );
}

export default withOnboardingGuard(LegalPage);
