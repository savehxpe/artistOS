"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, setDoc, getDoc, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { OutlandiaLogo } from "../../components/OutlandiaLogo";


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
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data()?.onboardingComplete) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } catch (err) {
          console.error("Auth redirect error:", err);
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
        <div className="w-8 h-8 border border-black/10 border-t-black rounded-full animate-spin" />
        <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">Authenticating</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col md:flex-row font-manrope overflow-hidden">
      {/* Visual Side */}
      <section className="bg-black flex-1 relative flex flex-col items-center justify-center p-12 overflow-hidden">
        {/* Subtle Grainy Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        <div className="relative z-10">
          <OutlandiaLogo />
        </div>
        
        <div className="absolute bottom-12 text-white/10 text-[9px] uppercase tracking-[0.4em] font-medium hidden md:block">
          Building the future of creative independence
        </div>
      </section>

      {/* Auth Side */}
      <section className="flex-1 bg-white flex flex-col items-center justify-center p-8 md:p-24 relative">
        <div className="w-full max-w-sm space-y-12">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-black uppercase">
              {isSignUP ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-[11px] text-black/40 uppercase tracking-wider font-medium">
              {isSignUP ? "Join the Outlandia ecosystem" : "Access your creative workspace"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-black/30 ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@artist.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 p-4 text-black font-medium text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all rounded-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-black/30 ml-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 p-4 text-black font-medium text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all rounded-none"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-none">
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-[11px] hover:bg-zinc-800 transition-all disabled:opacity-50 rounded-none"
            >
              {loading ? "Processing..." : isSignUP ? "Initialize Profile" : "Authorize Access"}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
             <span className="relative bg-white px-4 text-[9px] font-bold uppercase tracking-widest text-zinc-300">OR</span>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border border-zinc-200 py-4 font-bold uppercase tracking-widest text-[11px] hover:bg-zinc-50 transition-all flex items-center justify-center gap-3 rounded-none group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUP)}
              className="w-full text-center text-[10px] font-bold tracking-widest text-zinc-400 hover:text-black transition-colors uppercase pt-2"
            >
              {isSignUP ? "Already have an account?" : "Need a profile?"}
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center opacity-20 invisible md:visible">
          <p className="text-[8px] font-bold uppercase tracking-[1em]">
            OUTLANDIA SYSTEM
          </p>
        </div>
      </section>
    </main>
  );
}
