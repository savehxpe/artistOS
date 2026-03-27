"use client";

import { useState, useEffect, useMemo } from "react";
import { auth, db, doc, updateDoc, collection, query, onSnapshot, deleteDoc, orderBy, getDoc } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  text: string;
  phase: "INGESTION" | "LEGAL" | "CREATION" | "PITCHING" | "LAUNCH";
  priority: "High" | "Medium" | "Routine" | "Planning";
  category: "CORE" | "LEGAL" | "CONTENT" | "STRATEGY" | "DATA";
  dueDate: string;
  completed: boolean;
  createdAt: any;
}

const PHASES = ["INGESTION", "LEGAL", "CREATION", "PITCHING", "LAUNCH"];

import { withOnboardingGuard } from "../../components/withOnboardingGuard";

function TaskPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activePhase, setActivePhase] = useState("INGESTION");
  


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Redirection logic based on onboarding
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (!userDoc.exists() || !userDoc.data()?.onboardingComplete) {
            router.push("/onboarding");
            return;
          }
        } catch (err) {
          router.push("/onboarding");
          return;
        }

        setUser(currentUser);
        
        // Subscribe to tasks
        const tasksRef = collection(db, "tasks", currentUser.uid, "items");
        const q = query(tasksRef, orderBy("dueDate", "asc"));
        
        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
          const tasksData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Task[];
          setTasks(tasksData);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching tasks:", error);
          setLoading(false);
        });

        return () => unsubscribeTasks();
      } else {
        router.push("/login");
      }
    });
    
    return () => unsubscribeAuth();
  }, [router]);



  const toggleTask = async (task: Task) => {
    if (!user) return;
    try {
      const taskRef = doc(db, "tasks", user.uid, "items", task.id);
      await updateDoc(taskRef, {
        completed: !task.completed
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "tasks", user.uid, "items", taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleCompletePhase = async () => {
    if (!user || (tasksByPhase[activePhase] || []).length === 0) return;
    try {
      const pendingTasks = tasksByPhase[activePhase].filter(t => !t.completed);
      const updates = pendingTasks.map(task => {
        const taskRef = doc(db, "tasks", user.uid, "items", task.id);
        return updateDoc(taskRef, { completed: true });
      });
      await Promise.all(updates);
    } catch (err) {
      console.error("Error completing phase:", err);
    }
  };

  const tasksByPhase = useMemo(() => {
    const grouped = PHASES.reduce((acc, phase) => {
      acc[phase] = tasks.filter(t => t.phase === phase);
      return acc;
    }, {} as Record<string, Task[]>);
    return grouped;
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const phaseStats = PHASES.map(phase => {
      const phaseTasks = tasksByPhase[phase] || [];
      const phaseCompleted = phaseTasks.filter(t => t.completed).length;
      return {
        phase,
        total: phaseTasks.length,
        completed: phaseCompleted,
        progress: phaseTasks.length > 0 ? Math.round((phaseCompleted / phaseTasks.length) * 100) : 0
      };
    });

    return { total, completed, progress, phaseStats };
  }, [tasks, tasksByPhase]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black font-inter text-white">
        <div className="w-12 h-1 gap-2 flex items-center">
            <div className="w-4 h-4 bg-vibrant-yellow animate-bounce" />
            <div className="w-4 h-4 bg-white animate-bounce [animation-delay:0.1s]" />
            <div className="w-4 h-4 bg-vibrant-yellow animate-bounce [animation-delay:0.2s]" />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">EXPANDING_ACTION_ARRAYS</p>
      </div>
    );
  }



  return (
    <div className="bg-black text-white font-body min-h-screen pb-32">
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 min-h-screen animate-in fade-in duration-1000 slide-in-from-bottom-5">
        
        {/* Header Section */}
        <section className="mb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                   <p className="font-inter text-[10px] font-black uppercase tracking-[0.3em] text-vibrant-yellow mb-2">SYSTEM_OPERATIONS // ROLLOUT_STACK</p>
                   <h2 className="font-manrope font-black text-6xl md:text-8xl tracking-tighter uppercase leading-none italic">MISSION_CONTROL</h2>
                </div>
                <div className="text-right hidden md:flex flex-col items-end gap-2">
                    <p className="font-inter text-[10px] font-black uppercase tracking-[0.3em] text-white/30">GLOBAL_PROGRESS</p>
                    <p className="font-manrope font-black text-6xl text-vibrant-yellow leading-none">{stats.progress}%</p>
                    <button 
                        onClick={handleCompletePhase}
                        className="mt-4 bg-white/5 border border-white/10 px-4 py-2 text-[8px] font-black uppercase tracking-widest hover:bg-vibrant-yellow hover:text-black transition-all"
                    >
                        COMPLETE_PHASE
                    </button>
                </div>
            </div>

            {/* Global Progress Bar */}
            <div className="w-full h-4 bg-white/10 relative overflow-hidden">
                <div 
                    className="absolute inset-0 bg-vibrant-yellow transition-all duration-1000 shadow-[0_0_20px_#FFFF00]"
                    style={{ width: `${stats.progress}%` }}
                />
            </div>
        </section>

        {/* Phase Navigator - Bento Grid Style */}
        <section className="mb-12 grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.phaseStats.map((ps) => (
                <button
                    key={ps.phase}
                    onClick={() => setActivePhase(ps.phase)}
                    className={`bento-item p-4 text-left transition-all active:scale-[0.95] ${activePhase === ps.phase ? 'bg-vibrant-yellow !border-vibrant-yellow' : 'bg-transparent border-white/20'}`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <p className={`font-inter text-[8px] font-black uppercase tracking-widest ${activePhase === ps.phase ? 'text-black' : 'text-white/40'}`}>PHASE_{PHASES.indexOf(ps.phase) + 1}</p>
                        {ps.progress === 100 && <span className="material-symbols-outlined text-xs font-black text-black">check_circle</span>}
                    </div>
                    <h3 className={`font-manrope font-black text-xs uppercase tracking-tighter mb-2 ${activePhase === ps.phase ? 'text-black' : 'text-white'}`}>{ps.phase}</h3>
                    <div className={`w-full h-1 ${activePhase === ps.phase ? 'bg-black/20' : 'bg-white/10'}`}>
                        <div 
                            className={`h-full ${activePhase === ps.phase ? 'bg-black' : 'bg-vibrant-yellow'}`}
                            style={{ width: `${ps.progress}%` }}
                        />
                    </div>
                    <p className={`mt-2 font-inter text-[8px] font-black ${activePhase === ps.phase ? 'text-black/60' : 'text-white/20'}`}>{ps.completed}/{ps.total} COMPLETED</p>
                </button>
            ))}
        </section>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(tasksByPhase[activePhase] || []).length === 0 ? (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-white/10 bg-white/5">
              <span className="material-symbols-outlined text-4xl text-white/5 mb-4 font-black">inventory_2</span>
              <p className="font-inter text-[10px] font-black uppercase tracking-[0.4em] text-white/20">NO_DATA_INGESTED_FOR_THIS_PHASE</p>
            </div>
          ) : (
            tasksByPhase[activePhase].map((task) => (
              <div 
                key={task.id} 
                className={`bento-item p-6 md:p-8 flex flex-col justify-between gap-6 transition-all duration-300 ${task.completed ? 'opacity-40 grayscale border-white/5' : 'border-white/20 hover:border-vibrant-yellow'}`}
              >
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                             <span className={`px-2 py-0.5 font-inter text-[8px] font-black tracking-widest border ${task.completed ? 'border-white/10 text-white/30' : 'bg-vibrant-yellow border-vibrant-yellow text-black shadow-[0_0_10px_#FFFF00]'}`}>
                                {task.priority.toUpperCase()}
                            </span>
                            <span className="px-2 py-0.5 font-inter text-[8px] font-black tracking-widest border border-white/10 text-white/40 uppercase">
                                {task.category}
                            </span>
                        </div>
                        <button 
                            onClick={() => toggleTask(task)}
                            className={`w-10 h-10 border-2 flex items-center justify-center transition-all active:scale-[0.8] ${task.completed ? 'bg-vibrant-yellow border-vibrant-yellow text-black' : 'border-white/20 hover:border-vibrant-yellow text-white/20 hover:text-vibrant-yellow'}`}
                        >
                            <span className="material-symbols-outlined font-black">{task.completed ? 'check' : 'radio_button_unchecked'}</span>
                        </button>
                    </div>
                    
                    <h3 className={`font-manrope font-black text-2xl uppercase tracking-tighter leading-tight ${task.completed ? 'line-through' : ''}`}>
                        {task.text}
                    </h3>
                </div>

                <div className="flex items-end justify-between pt-6 border-t border-white/5">
                    <div>
                        <p className="font-inter text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">TARGET_DEADLINE</p>
                        <p className={`font-manrope font-black text-sm ${task.completed ? 'text-white/40' : 'text-vibrant-yellow'}`}>
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                        </p>
                    </div>
                    <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-white/10 hover:text-red-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm font-black italic underline">PURGE</span>
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default withOnboardingGuard(TaskPage);
