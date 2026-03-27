"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, setDoc, getDoc, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUP, setIsSignUp] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Redirection logic based on onboarding
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data()?.onboardingComplete) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } catch (err) {
          console.error("Auth redirect error:", err);
          // Fallback if doc check fails
          router.push("/onboarding");
        }
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const initUserDoc = async (user: any) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        lastLogin: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error("Error creating user doc", err);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await initUserDoc(result.user);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isSignUP) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await initUserDoc(result.user);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await initUserDoc(result.user);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white font-inter text-black">
        <div className="w-12 h-12 border-2 border-black border-t-vibrant-yellow animate-spin shadow-[0_0_15px_rgba(255,255,0,0.5)]" />
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-black/40 animate-pulse">CRYPTOGRAPHIC_HANDSHAKE</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col md:flex-row font-body overflow-hidden">
      {/* Visual Side (Left on Desktop, Top on Mobile) */}
      <section className="bg-black flex-1 relative flex flex-col items-center justify-center p-12 overflow-hidden group">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #FFFF00 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        {/* Large Typography Decoration */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 rotate-90 text-[20vw] font-manrope font-black text-white/[0.03] select-none uppercase tracking-tighter whitespace-nowrap">
          SYSTEM_ACCESS
        </div>

        <div className="relative z-10 text-center animate-in slide-in-from-bottom duration-1000">
           <div className="mb-8 inline-block">
             <div className="w-24 h-2 bg-vibrant-yellow mb-4 mx-auto shadow-[0_0_20px_#FFFF00]"></div>
             <h1 className="font-manrope font-black text-6xl md:text-8xl tracking-tighter text-white uppercase leading-none">ARTIST<br/><span className="text-vibrant-yellow italic text-7xl md:text-9xl">_OS</span></h1>
           </div>
           <p className="font-inter text-[10px] font-black uppercase tracking-[0.4em] text-white/40">v1.2.0 // HIGH_FIDELITY_ENVIRONMENT</p>
        </div>
        
        <div className="absolute bottom-10 left-10 text-white/20 font-inter text-[8px] font-black tracking-widest uppercase hidden md:block">
          SECURE_ENCRYPTION_ACTIVE : AES_256
        </div>
      </section>

      {/* Auth Side (Right on Desktop, Bottom on Mobile) */}
      <section className="flex-1 bg-white flex flex-col items-center justify-center p-10 md:p-24 relative overflow-hidden">
        <div className="w-full max-w-sm space-y-10 animate-in slide-in-from-right duration-700">
          <div className="space-y-4">
            <h2 className="font-manrope font-black text-3xl uppercase tracking-tighter text-black border-l-8 border-vibrant-yellow pl-4">SEC_CLEARANCE</h2>
            <p className="font-inter text-[10px] font-black tracking-widest text-black/30 uppercase italic">SWITCH_TO_{isSignUP ? "ENTER" : "INIT"}_PROFILE</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="font-inter text-[9px] font-black uppercase tracking-widest text-black/20">CREDENTIAL_ID</label>
              <input
                type="email"
                placeholder="EMAIL_ADR"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-black/5 p-5 text-black uppercase font-manrope font-black text-lg outline-none focus:border-black transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-inter text-[9px] font-black uppercase tracking-widest text-black/20">ACCESS_PASS</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-black/5 p-5 text-black uppercase font-manrope font-black text-lg outline-none focus:border-black transition-all"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 border border-red-200 p-4 animate-shake">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-vibrant-yellow py-8 font-inter font-black uppercase tracking-[0.4em] text-xs hover:bg-zinc-800 transition-all disabled:opacity-30 shadow-2xl active:scale-[0.98]"
            >
              {loading ? "INITIALIZING..." : isSignUP ? "INITIALIZE_PROFILE" : "AUTHORIZE_ACCESS"}
            </button>
          </form>

          <div className="relative">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5"></div></div>
             <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-black/20 italic">OR_REACH_THROUGH_OAUTH</span></div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-black py-6 font-inter font-black uppercase tracking-[0.3em] text-[10px] hover:bg-vibrant-yellow transition-all flex items-center justify-center gap-4 group"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">google</span>
              GOOGLE_PROTOCOL
            </button>

            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUP)}
              className="w-full text-center font-inter text-[10px] font-black tracking-widest text-black/30 hover:text-black transition-colors uppercase py-4"
            >
              {isSignUP ? "GO_TO_AUTHENTICATE" : "NO_PROFILE_DETECTED?_INIT_NEW"}
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 text-center opacity-10">
          <p className="font-inter text-[8px] font-black uppercase tracking-[1em] leading-none">
            RESERVED_SYSTEM_ENVIRONMENT_2024
          </p>
        </div>
      </section>
    </main>
  );
}
