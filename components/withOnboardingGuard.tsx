"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, doc, getDoc } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function withOnboardingGuard(WrappedComponent: any) {
  return function ProtectedRoute(props: any) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setAccessDenied(true);
          setTimeout(() => {
            router.push("/"); 
          }, 1000);
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const data = userDoc?.data();
          
          if (!userDoc.exists() || !data?.onboardingComplete) {
            setAccessDenied(true);
            setTimeout(() => {
              router.push("/onboarding");
            }, 800);
            return;
          }

          setIsAuthenticated(true);
        } catch (err) {
          console.error("Error verifying access:", err);
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    }, [router]);

    if (accessDenied) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-[#FFFF00] font-mono text-4xl uppercase tracking-widest font-bold">
          <div className="animate-pulse">
            ACCESS_DENIED // UNAUTHORIZED
          </div>
        </div>
      );
    }

    if (loading || !isAuthenticated) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white/20 font-mono text-xs uppercase tracking-widest">
          SECURITY_CHECK // AUTHENTICATING
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
