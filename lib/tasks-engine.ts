export interface TaskTemplate {
  text: string;
  phase: "Ingestion" | "Legal" | "Creation" | "Pitching" | "Launch";
  priority: "High" | "Medium" | "Routine" | "Planning";
  category: "Core" | "Legal" | "Content" | "Strategy" | "Data";
  daysOffset: number; // Days from trigger date
}

export const ROLLOUT_TEMPLATES: TaskTemplate[] = [
  // PHASE I: Ingestion (6 Tasks)
  { text: "Ingest Raw Masters & WAV Stems", phase: "Ingestion", priority: "High", category: "Core", daysOffset: 0 },
  { text: "Generate Acoustic Metadata (BPM/Key)", phase: "Ingestion", priority: "Medium", category: "Data", daysOffset: 0 },
  { text: "Apply Digital Watermarking", phase: "Ingestion", priority: "Routine", category: "Legal", daysOffset: 1 },
  { text: "Organize Multi-track Repository", phase: "Ingestion", priority: "Routine", category: "Core", daysOffset: 1 },
  { text: "Verify Stem Integrity & Phase Alignment", phase: "Ingestion", priority: "Medium", category: "Core", daysOffset: 2 },
  { text: "Backup to Cold Storage Vault", phase: "Ingestion", priority: "Routine", category: "Data", daysOffset: 2 },

  // PHASE II: Legal (12 Tasks)
  { text: "Draft Collaborator Split Sheets", phase: "Legal", priority: "High", category: "Legal", daysOffset: 3 },
  { text: "Secure Producer Clearances", phase: "Legal", priority: "High", category: "Legal", daysOffset: 4 },
  { text: "Register with P.R.O. (ASCAP/BMI/SESAC)", phase: "Legal", priority: "High", category: "Legal", daysOffset: 5 },
  { text: "Generate ISRC & UPC Codes", phase: "Legal", priority: "Medium", category: "Data", daysOffset: 5 },
  { text: "Submit Mechanical License Requests", phase: "Legal", priority: "High", category: "Legal", daysOffset: 6 },
  { text: "File Copyright Registration (Form SR)", phase: "Legal", priority: "Medium", category: "Legal", daysOffset: 7 },
  { text: "Verify Metadata Accuracy for DSPs", phase: "Legal", priority: "Medium", category: "Data", daysOffset: 8 },
  { text: "Sign Master Sync Waivers", phase: "Legal", priority: "Routine", category: "Legal", daysOffset: 9 },
  { text: "Setup Revenue Splits on Distributor", phase: "Legal", priority: "High", category: "Legal", daysOffset: 10 },
  { text: "Audit Contractual Credit Strings", phase: "Legal", priority: "Routine", category: "Data", daysOffset: 11 },
  { text: "Archive Legal Correspondence", phase: "Legal", priority: "Routine", category: "Legal", daysOffset: 12 },
  { text: "Execute Final Legal Compliance Check", phase: "Legal", priority: "High", category: "Legal", daysOffset: 13 },

  // PHASE III: Creation (30 Tasks - The Bulk)
  { text: "Generate 15+ TikTok Hook Variants (AI)", phase: "Creation", priority: "High", category: "Content", daysOffset: 5 },
  { text: "Draft 5 Instagram Reel Captions", phase: "Creation", priority: "Medium", category: "Content", daysOffset: 6 },
  { text: "Edit 30-second 'Behind the Scenes' Clip", phase: "Creation", priority: "Medium", category: "Content", daysOffset: 7 },
  { text: "Create Cover Art Variations (Square/Story)", phase: "Creation", priority: "High", category: "Content", daysOffset: 8 },
  { text: "Design Spotify Canvas Animation", phase: "Creation", priority: "Medium", category: "Content", daysOffset: 9 },
  { text: "Film Official Music Video", phase: "Creation", priority: "High", category: "Content", daysOffset: 10 },
  { text: "Produce 'Lyric Video' Static Records", phase: "Creation", priority: "Routine", category: "Content", daysOffset: 11 },
  { text: "Draft Email Newsletter Announcement", phase: "Creation", priority: "Routine", category: "Strategy", daysOffset: 12 },
  { text: "Setup TikTok 'Sound' Pre-save Link", phase: "Creation", priority: "High", category: "Data", daysOffset: 13 },
  { text: "Create Press Kit (EPK) Updates", phase: "Creation", priority: "Medium", category: "Strategy", daysOffset: 14 },
  { text: "Record Seed Video for Ads", phase: "Creation", priority: "Medium", category: "Content", daysOffset: 15 },
  { text: "Batch Generate Twitter Thread Hooks", phase: "Creation", priority: "Routine", category: "Content", daysOffset: 16 },
  { text: "Storyboard 3 Interactive Polls", phase: "Creation", priority: "Routine", category: "Content", daysOffset: 17 },
  { text: "Design Show Posters / Merch Mockups", phase: "Creation", priority: "Planning", category: "Content", daysOffset: 18 },
  { text: "Create Color Palette for Social Grid", phase: "Creation", priority: "Routine", category: "Content", daysOffset: 19 },
  { text: "Draft 'Thank You' Video Scripts", phase: "Creation", priority: "Routine", category: "Content", daysOffset: 20 },
  { text: "Shoot High-Res Press Photos", phase: "Creation", priority: "High", category: "Content", daysOffset: 21 },
  { text: "Edit Documentary Style Mini-Doc", phase: "Creation", priority: "Planning", category: "Content", daysOffset: 22 },
  { text: "Generate AI-Assisted Press Release", phase: "Creation", priority: "Medium", category: "Strategy", daysOffset: 23 },
  { text: "Create Giphy Stickers for Release", phase: "Creation", priority: "Routine", category: "Content", daysOffset: 24 },
  { text: "Draft YouTube Description Template", phase: "Creation", priority: "Routine", category: "Data", daysOffset: 25 },
  { text: "Organize All Records in Vault", phase: "Creation", priority: "Medium", category: "Core", daysOffset: 26 },
  { text: "Record Podcast Interview Snippets", phase: "Creation", priority: "Planning", category: "Content", daysOffset: 27 },
  { text: "Create 15-sec Ad Variants", phase: "Creation", priority: "Medium", category: "Content", daysOffset: 28 },
  { text: "Edit 'Making Of' Teaser", phase: "Creation", priority: "Routine", category: "Content", daysOffset: 29 },
  { text: "Setup Discord Community Preview", phase: "Creation", priority: "Routine", category: "Strategy", daysOffset: 30 },
  { text: "Design Linktree/Bio Link Update", phase: "Creation", priority: "Routine", category: "Data", daysOffset: 31 },
  { text: "Shoot Raw Vertical Content for Reels", phase: "Creation", priority: "High", category: "Content", daysOffset: 32 },
  { text: "Create 'Out Now' Mockups", phase: "Creation", priority: "Medium", category: "Content", daysOffset: 33 },
  { text: "Finalize Creative Record Inventory", phase: "Creation", priority: "High", category: "Core", daysOffset: 34 },

  // PHASE IV: Pitching (4 Tasks)
  { text: "Submit to Spotify Editorial (3 wks out)", phase: "Pitching", priority: "High", category: "Strategy", daysOffset: 35 },
  { text: "Send EPK to Target Blogs/Press", phase: "Pitching", priority: "Medium", category: "Strategy", daysOffset: 36 },
  { text: "Pitch to Soundtrack/Sync Agents", phase: "Pitching", priority: "Planning", category: "Strategy", daysOffset: 37 },
  { text: "Execute Independent Playlist Outreach", phase: "Pitching", priority: "Medium", category: "Strategy", daysOffset: 38 },

  // PHASE V: Launch (2 Tasks)
  { text: "Go Live: Distributor Release Trigger", phase: "Launch", priority: "High", category: "Core", daysOffset: 42 },
  { text: "Execute 24-Hour Fan Engagement Blitz", phase: "Launch", priority: "High", category: "Strategy", daysOffset: 43 }
];
