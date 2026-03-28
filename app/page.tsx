"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { GeometricVoid } from "@/components/GeometricVoid";
import { auth, googleProvider, signInWithPopup, doc, db, getDoc } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { OutlandiaLogo } from "@/components/OutlandiaLogo";
import { SideDrawer } from "@/components/SideDrawer";

export default function Home() {
  const router = useRouter();
  const [isZooming, setIsZooming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user) {
        // Trigger the "Zoom Through" animation
        setIsZooming(true);

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        setTimeout(() => {
          if (userDoc.exists() && userDoc.data()?.onboardingComplete === true) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        }, 1200);
      }
    } catch (error) {
      console.error("AUTH_FAILURE:", error);
      setIsLoading(false);
    }
  }, [router]);

  // Handle automatic redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !isZooming && !isLoading) {
        setIsLoading(true);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists() && userDoc.data()?.onboardingComplete === true) {
          router.replace("/dashboard");
        } else {
          router.replace("/onboarding");
        }
      }
    });
    return () => unsubscribe();
  }, [router, isZooming, isLoading]);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center font-inter">
      {/* Side Menu Trigger */}
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => setIsDrawerOpen(true)}
        className="fixed top-10 right-10 z-[60] flex items-center gap-4 group"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-white transition-all hidden md:block">System Menu</span>
        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-all">
          <span className="material-symbols-outlined text-white/40 group-hover:text-white text-xl">menu</span>
        </div>
      </motion.button>

      {/* Side Drawer Component */}
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* 3D Space - The Void */}
      <div className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${isZooming ? "scale-[20] opacity-0" : "scale-100 opacity-100"}`}>
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFFF00" />
          <Suspense fallback={null}>
            <GeometricVoid />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <AnimatePresence>
        {!isZooming && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            transition={{ duration: 1, ease: "circOut" }}
            className="relative z-10 text-center flex flex-col items-center px-6"
          >
            {/* Minimalist Brand Mark */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.2, ease: "circOut" }}
              className="mb-32"
            >
               <OutlandiaLogo showWordmark={true} size="lg" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1.5 }}
              className="flex flex-col items-center"
            >
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="px-16 py-7 bg-white text-black font-manrope font-black text-[10px] rounded-full shadow-2xl transition-all hover:bg-[#FFFF00] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden outlandia-pulse tracking-[0.4em] uppercase"
                >
                  <span className="relative z-10">
                    {isLoading ? "INITIALIZING..." : "SIGN IN"}
                  </span>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmosphere Fade */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_80%)]" />
    </main>
  );
}

