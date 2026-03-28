import { NextResponse } from "next/server";
import { db, doc, setDoc, getDocs, collection, addDoc, serverTimestamp, deleteDoc } from "@/lib/firebase";
import { generateCustomTasks, OnboardingData } from "@/lib/onboarding-logic";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { userId, links, diagnosticData } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // 1. system_purge(): Wipe existing tasks, vault, calendar
    const tasksSnap = await getDocs(collection(db, "users", userId, "tasks"));
    const vaultSnap = await getDocs(collection(db, "users", userId, "vault"));
    const calSnap = await getDocs(collection(db, "users", userId, "calendar"));

    let batchDeletes: Promise<void>[] = [];
    tasksSnap.forEach((d: QueryDocumentSnapshot<DocumentData>) => batchDeletes.push(deleteDoc(d.ref)));
    vaultSnap.forEach((d: QueryDocumentSnapshot<DocumentData>) => batchDeletes.push(deleteDoc(d.ref)));
    calSnap.forEach((d: QueryDocumentSnapshot<DocumentData>) => batchDeletes.push(deleteDoc(d.ref)));

    await Promise.all(batchDeletes);

    // 2. generate_master_stack(): Custom tasks based on diagnostic
    const customTasks = generateCustomTasks(diagnosticData as OnboardingData);

    const batchCreates = customTasks.map(async (template: any) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + template.daysOffset);
      
      await addDoc(collection(db, "users", userId, "tasks"), {
        text: template.text,
        phase: template.phase,
        priority: template.priority,
        category: template.category,
        dueDate: dueDate.toISOString(),
        completed: false,
        createdAt: serverTimestamp()
      });
    });

    await Promise.all(batchCreates);

    // 3. update_user_onboarding(): Mark onboardingComplete and save data
    await setDoc(doc(db, "users", userId), {
      onboardingComplete: true,
      links: links,
      diagnostic: diagnosticData,
      phase: "Phase 1: Ingestion",
      objective: "Ingest primary master records",
      initializationDate: serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ success: true, count: customTasks.length });
  } catch (error: any) {
    console.error("Initialization Error:", error);
    return NextResponse.json({ error: error.message || "Rollout initialization failed" }, { status: 500 });
  }
}
