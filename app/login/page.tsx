"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, setDoc, db } from "../../lib/firebase";
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.push("/dashboard");
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
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 border-4 border-white border-t-transparent animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">CHECKING CREDENTIALS...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-black border border-white p-8 space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight">OUTLANDIA<span className="text-white">.</span></h1>
          <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">SECURITY CLEARANCE REQUIRED</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input
            type="email"
            placeholder="EMAIL_ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-zinc-800 p-3 text-white uppercase font-mono text-sm outline-none focus:border-white transition-colors"
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-zinc-800 p-3 text-white uppercase font-mono text-sm outline-none focus:border-white transition-colors"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-white hover:bg-zinc-200 text-black px-6 py-4 font-black uppercase tracking-widest text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : isSignUP ? "CREATE CREDENTIALS" : "AUTHENTICATE"}
          </button>
        </form>

        {error && <p className="text-red-500 text-xs font-mono uppercase text-center">{error}</p>}

        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 uppercase">
          <span>OR</span>
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUP)}
            className="hover:text-white transition-colors"
          >
            {isSignUP ? "SWITCH TO LOGIN" : "SWITCH TO SIGNUP"}
          </button>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white px-6 py-4 font-black uppercase tracking-widest text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          GOOGLE OAUTH
        </button>
      </div>
      
      <div className="mt-8 text-center opacity-30">
        <p className="font-mono text-xs uppercase tracking-widest leading-none">
          SYSTEM_ID: OUTLANDIA // ALL RIGHTS RESERVED
        </p>
      </div>
    </main>
  );
}
