import { TaskTemplate, ROLLOUT_TEMPLATES } from "./tasks-engine";

export interface OnboardingData {
  projectType: string;
  leadTime: number;
  creativeRecords: string;
  collaborators: string;
  marketingFocus: string;
}

export function generateCustomTasks(data: OnboardingData) {
  let tasks = [...ROLLOUT_TEMPLATES];
  const timeScale = data.leadTime / 8; // Lead time scale (8 is baseline)

  // 1. Filter out collaborator tasks if not applicable
  if (data.collaborators === "No") {
    tasks = tasks.filter(t => !t.text.toLowerCase().includes("collaborator") && 
                              !t.text.toLowerCase().includes("producer clearance"));
  }

  // 2. Adjust for Creative Records focus
  if (data.creativeRecords === "Lyric Video") {
    tasks = tasks.map(t => {
      if (t.text.includes("Film Official Music Video")) {
        return { ...t, text: "Direct Lyric Video Studio Session" };
      }
      return t;
    });
  } else if (data.creativeRecords === "Static Records") {
    tasks = tasks.filter(t => !t.text.toLowerCase().includes("video") || t.text.includes("Cover Art"));
    // Add specifically static tasks
    tasks.push({ text: "Generate 15 Static 'Quotes' for IG Grid", phase: "Creation", priority: "Medium", category: "Content", daysOffset: 15 });
  }

  // 3. Marketing Focus Boost
  tasks = tasks.map(t => {
    if (data.marketingFocus === "TikTok Reels" && (t.text.includes("TikTok") || t.text.includes("Reel"))) {
      return { ...t, priority: "High" as const };
    }
    if (data.marketingFocus === "Spotify Growth" && (t.text.includes("Spotify") || t.text.includes("Pitching"))) {
      return { ...t, priority: "High" as const };
    }
    if (data.marketingFocus === "Fan Portal" && (t.text.includes("Discord") || t.text.includes("Newsletter"))) {
      return { ...t, priority: "High" as const };
    }
    return t;
  });

  // 4. Adjust Due Dates based on Lead Time
  const customizedTasks = tasks.map(t => {
    return {
      ...t,
      daysOffset: Math.round(t.daysOffset * timeScale)
    };
  });

  return customizedTasks;
}
