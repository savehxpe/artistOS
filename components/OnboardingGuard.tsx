"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, doc, getDoc } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { SilentSplash } from "./SilentSplash";

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/"); 
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();
        
        if (!userDoc.exists() || data?.onboardingComplete !== true) {
          router.replace("/onboarding");
          return;
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error("Auth verification failure:", err);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || !isAuthenticated) {
    return <SilentSplash />;
  }

  return <>{children}</>;
}
