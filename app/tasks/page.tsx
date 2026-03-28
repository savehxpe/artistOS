"use client";

import { useState, useEffect, useMemo } from "react";
import { auth, db, doc, updateDoc, collection, query, onSnapshot, deleteDoc, orderBy, getDoc } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { OutlandiaLogo } from "../../components/OutlandiaLogo";
import { withOnboardingGuard } from "../../components/withOnboardingGuard";

interface Task {
  id: string;
  text: string;
  phase: "Ingestion" | "Legal" | "Creation" | "Pitching" | "Launch";
  priority: "High" | "Medium" | "Routine" | "Planning";
  category: "Core" | "Legal" | "Content" | "Strategy" | "Data";
  dueDate: string;
  completed: boolean;
  createdAt: any;
}

const PHASES = ["Ingestion", "Legal", "Creation", "Pitching", "Launch"];

function TaskPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activePhase, setActivePhase] = useState("Ingestion");
  


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
        const tasksRef = collection(db, "users", currentUser.uid, "tasks");
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
        router.push("/");
      }
    });
    
    return () => unsubscribeAuth();
  }, [router]);



  const toggleTask = async (task: Task) => {
    if (!user) return;
    try {
      const taskRef = doc(db, "users", user.uid, "tasks", task.id);
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
      await deleteDoc(doc(db, "users", user.uid, "tasks", taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleCompletePhase = async () => {
    if (!user || (tasksByPhase[activePhase] || []).length === 0) return;
    try {
      const pendingTasks = tasksByPhase[activePhase].filter(t => !t.completed);
      const updates = pendingTasks.map(task => {
        const taskRef = doc(db, "users", user.uid, "tasks", task.id);
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
            <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
            <div className="w-4 h-4 rounded-full bg-white/40 animate-pulse [animation-delay:0.1s]" />
            <div className="w-4 h-4 rounded-full bg-white/60 animate-pulse [animation-delay:0.2s]" />
        </div>
        <p className="mt-8 text-[10px] font-medium tracking-widest text-white/40 antialiased">
          OUTLANDIA
        </p>
      </div>
    );
  }



  return (
    <div className="bg-black text-white font-inter min-h-screen pb-32">
      <main className="max-w-[1200px] mx-auto px-6 pt-32 pb-32 animate-in fade-in duration-1000">
        
        {/* Header Section */}
        <header className="mb-24 flex flex-col items-center text-center">
            <OutlandiaLogo />
            <div className="w-12 h-[0.5px] bg-white/20 mb-8 mt-4" />
            <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                    <p className="text-[10px] font-medium tracking-widest text-zinc-500 mb-2 uppercase">Workspace Roadmap</p>
                    <p className="text-6xl font-manrope font-bold tracking-tight mb-2">{stats.progress}%</p>
                    <p className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase">Overall Completion</p>
                </div>
                <button 
                    onClick={handleCompletePhase}
                    className="tap-scale border border-white/10 bg-zinc-950/50 hover:bg-zinc-950 hover:border-white/20 text-white px-10 py-5 text-[10px] font-semibold tracking-widest transition-all font-inter rounded-full backdrop-blur-xl mt-8"
                >
                    Mark Phase Complete
                </button>
            </div>
        </header>

        {/* Global Progress Bar */}
        <div className="w-full h-2 bg-white/5 mb-24 relative overflow-hidden rounded-full">
            <div 
                className="absolute inset-y-0 left-0 bg-white transition-all duration-1000 rounded-full"
                style={{ width: `${stats.progress}%` }}
            />
        </div>

        {/* Phase Navigator */}
        <section className="mb-24 grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.phaseStats.map((ps) => (
                <button
                    key={ps.phase}
                    onClick={() => setActivePhase(ps.phase)}
                    className={`bento-item p-8 text-left transition-all tap-scale rounded-3xl ${activePhase === ps.phase ? 'bg-white text-black !border-white shadow-xl' : 'bg-zinc-950/20 border-white/5 hover:bg-zinc-950/40'}`}
                >
                    <div className="flex justify-between items-start mb-16">
                        <p className={`text-[10px] font-medium tracking-widest ${activePhase === ps.phase ? 'text-black/40' : 'text-zinc-600'}`}>0{PHASES.indexOf(ps.phase) + 1}</p>
                        {ps.progress === 100 && <span className="material-symbols-outlined text-sm">done_all</span>}
                    </div>
                    <h3 className="font-manrope font-bold text-[10px] tracking-widest mb-4 uppercase">{ps.phase}</h3>
                    <div className={`w-full h-1 ${activePhase === ps.phase ? 'bg-black/10' : 'bg-white/10'} rounded-full overflow-hidden`}>
                        <div 
                            className={`h-full ${activePhase === ps.phase ? 'bg-black' : 'bg-white'} transition-all duration-700 rounded-full`}
                            style={{ width: `${ps.progress}%` }}
                        />
                    </div>
                </button>
            ))}
        </section>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(tasksByPhase[activePhase] || []).length === 0 ? (
            <div className="col-span-full py-40 text-center border border-dashed border-white/5 rounded-3xl bg-zinc-950/10 backdrop-blur-sm">
              <p className="text-[11px] font-medium tracking-widest text-zinc-500">No active focus points for this phase</p>
            </div>
          ) : (
            tasksByPhase[activePhase].map((task) => (
              <div 
                key={task.id} 
                className={`bento-item p-10 flex flex-col justify-between gap-12 transition-all duration-500 rounded-3xl ${task.completed ? 'opacity-20 translate-y-2' : 'border-white/5 bg-zinc-950/30 hover:border-white/20 shadow-lg'}`}
              >
                <div className="space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                             <span className={`px-3 py-1 text-[9px] font-semibold tracking-wider border rounded-xl transition-colors ${task.completed ? 'border-white/5 text-white/10' : 'bg-zinc-900 border-white/10 text-zinc-400'}`}>
                                {task.priority}
                            </span>
                             <span className="px-3 py-1 text-[9px] font-semibold tracking-wider border border-white/5 text-white/20 rounded-xl">
                                {task.category}
                            </span>
                        </div>
                        <button 
                            onClick={() => toggleTask(task)}
                            className={`w-12 h-12 border flex items-center justify-center tap-scale transition-all rounded-full ${task.completed ? 'bg-white text-black border-white' : 'border-white/10 hover:border-white/30 text-white/20 hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-lg">{task.completed ? 'check_circle' : 'circle'}</span>
                        </button>
                    </div>
                    
                    <h3 className={`font-manrope font-bold text-3xl tracking-tight leading-tight transition-all ${task.completed ? 'line-through opacity-40' : 'text-white'}`}>
                        {task.text}
                    </h3>
                </div>

                <div className="flex items-end justify-between pt-8 border-t border-white/5">
                    <div>
                        <p className="text-[9px] font-medium text-zinc-600 tracking-widest mb-2">Deadline</p>
                        <p className={`font-manrope font-bold text-xs tracking-wide ${task.completed ? 'text-zinc-700' : 'text-white'}`}>
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-[10px] font-medium text-white/20 hover:text-red-400 transition-colors tracking-widest"
                    >
                        Delete
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
