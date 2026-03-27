export interface TaskTemplate {
  text: string;
  phase: "INGESTION" | "LEGAL" | "CREATION" | "PITCHING" | "LAUNCH";
  priority: "High" | "Medium" | "Routine" | "Planning";
  category: "CORE" | "LEGAL" | "CONTENT" | "STRATEGY" | "DATA";
  daysOffset: number; // Days from trigger date
}

export const ROLLOUT_TEMPLATES: TaskTemplate[] = [
  // PHASE I: INGESTION (6 Tasks)
  { text: "UPLOAD RAW MASTERS & WAV STEMS", phase: "INGESTION", priority: "High", category: "CORE", daysOffset: 0 },
  { text: "GENERATE ACOUSTIC METADATA (BPM/KEY)", phase: "INGESTION", priority: "Medium", category: "DATA", daysOffset: 0 },
  { text: "APPLY DIGITAL WATERMARKING", phase: "INGESTION", priority: "Routine", category: "LEGAL", daysOffset: 1 },
  { text: "ORGANIZE MULTI-TRACK REPOSITORY", phase: "INGESTION", priority: "Routine", category: "CORE", daysOffset: 1 },
  { text: "VERIFY STEM INTEGRITY & PHASE ALIGNMENT", phase: "INGESTION", priority: "Medium", category: "CORE", daysOffset: 2 },
  { text: "BACKUP TO COLD STORAGE VAULT", phase: "INGESTION", priority: "Routine", category: "DATA", daysOffset: 2 },

  // PHASE II: LEGAL (12 Tasks)
  { text: "DRAFT COLLABORATOR SPLIT SHEETS", phase: "LEGAL", priority: "High", category: "LEGAL", daysOffset: 3 },
  { text: "SECURE PRODUCER CLEARANCES", phase: "LEGAL", priority: "High", category: "LEGAL", daysOffset: 4 },
  { text: "REGISTER WITH P.R.O. (ASCAP/BMI/SESAC)", phase: "LEGAL", priority: "High", category: "LEGAL", daysOffset: 5 },
  { text: "GENERATE ISRC & UPC CODES", phase: "LEGAL", priority: "Medium", category: "DATA", daysOffset: 5 },
  { text: "SUBMIT MECHANICAL LICENSE REQUESTS", phase: "LEGAL", priority: "High", category: "LEGAL", daysOffset: 6 },
  { text: "FILE COPYRIGHT REGISTRATION (FORM SR)", phase: "LEGAL", priority: "Medium", category: "LEGAL", daysOffset: 7 },
  { text: "VERIFY METADATA ACCURACY FOR DSPs", phase: "LEGAL", priority: "Medium", category: "DATA", daysOffset: 8 },
  { text: "SIGN MASTER SYNC WAIVERS", phase: "LEGAL", priority: "Routine", category: "LEGAL", daysOffset: 9 },
  { text: "SETUP REVENUE SPLITS ON DISTRIBUTOR", phase: "LEGAL", priority: "High", category: "LEGAL", daysOffset: 10 },
  { text: "AUDIT CONTRACTUAL CREDIT STRINGS", phase: "LEGAL", priority: "Routine", category: "DATA", daysOffset: 11 },
  { text: "ARCHIVE LEGAL CORRESPONDENCE", phase: "LEGAL", priority: "Routine", category: "LEGAL", daysOffset: 12 },
  { text: "EXECUTE FINAL LEGAL COMPLIANCE CHECK", phase: "LEGAL", priority: "High", category: "LEGAL", daysOffset: 13 },

  // PHASE III: CREATION (30 Tasks - The Bulk)
  { text: "GENERATE 15+ TIKTOK HOOK VARIANTS (AI)", phase: "CREATION", priority: "High", category: "CONTENT", daysOffset: 5 },
  { text: "DRAFT 5 INSTAGRAM REEL CAPTIONS", phase: "CREATION", priority: "Medium", category: "CONTENT", daysOffset: 6 },
  { text: "EDIT 30-SECOND 'BEHIND THE SCENES' CLIP", phase: "CREATION", priority: "Medium", category: "CONTENT", daysOffset: 7 },
  { text: "CREATE COVER ART VARIATIONS (SQUARE/STORY)", phase: "CREATION", priority: "High", category: "CONTENT", daysOffset: 8 },
  { text: "DESIGN SPOTIFY CANVAS ANIMATION", phase: "CREATION", priority: "Medium", category: "CONTENT", daysOffset: 9 },
  { text: "FILM OFFICIAL MUSIC VIDEO", phase: "CREATION", priority: "High", category: "CONTENT", daysOffset: 10 },
  { text: "PRODUCE 'LYRIC VIDEO' STATIC ASSETS", phase: "CREATION", priority: "Routine", category: "CONTENT", daysOffset: 11 },
  { text: "DRAFT EMAIL NEWSLETTER ANNOUNCEMENT", phase: "CREATION", priority: "Routine", category: "STRATEGY", daysOffset: 12 },
  { text: "SETUP TIKTOK 'SOUND' PRE-SAVE LINK", phase: "CREATION", priority: "High", category: "DATA", daysOffset: 13 },
  { text: "CREATE PRESS KIT (EPK) UPDATES", phase: "CREATION", priority: "Medium", category: "STRATEGY", daysOffset: 14 },
  { text: "RECORD SEED VIDEO FOR ADS", phase: "CREATION", priority: "Medium", category: "CONTENT", daysOffset: 15 },
  { text: "BATCH GENERATE TWITTER THREAD HOOKS", phase: "CREATION", priority: "Routine", category: "CONTENT", daysOffset: 16 },
  { text: "STORYBOARD 3 INTERACTIVE POLLS", phase: "CREATION", priority: "Routine", category: "CONTENT", daysOffset: 17 },
  { text: "DESIGN SHOW POSTERS / MERCH MOCKUPS", phase: "CREATION", priority: "Planning", category: "CONTENT", daysOffset: 18 },
  { text: "CREATE COLOR PALETTE FOR SOCIAL GRID", phase: "CREATION", priority: "Routine", category: "CONTENT", daysOffset: 19 },
  { text: "DRAFT 'THANK YOU' VIDEO SCRIPTS", phase: "CREATION", priority: "Routine", category: "CONTENT", daysOffset: 20 },
  { text: "SHOOT HIGH-RES PRESS PHOTOS", phase: "CREATION", priority: "High", category: "CONTENT", daysOffset: 21 },
  { text: "EDIT DOCUMENTARY STYLE MINI-DOC", phase: "CREATION", priority: "Planning", category: "CONTENT", daysOffset: 22 },
  { text: "GENERATE AI-ASSISTED PRESS RELEASE", phase: "CREATION", priority: "Medium", category: "STRATEGY", daysOffset: 23 },
  { text: "CREATE GIPHY STICKERS FOR RELEASE", phase: "CREATION", priority: "Routine", category: "CONTENT", daysOffset: 24 },
  { text: "DRAFT YOUTUBE DESCRIPTION TEMPLATE", phase: "CREATION", priority: "Routine", category: "DATA", daysOffset: 25 },
  { text: "ORGANIZE ALL ASSETS IN VAULT", phase: "CREATION", priority: "Medium", category: "CORE", daysOffset: 26 },
  { text: "RECORD PODCAST INTERVIEW SNIPPETS", phase: "CREATION", priority: "Planning", category: "CONTENT", daysOffset: 27 },
  { text: "CREATE 15-SEC AD VARIANTS", phase: "CREATION", priority: "Medium", category: "CONTENT", daysOffset: 28 },
  { text: "EDIT 'MAKING OF' TEASER", phase: "CREATION", priority: "Routine", category: "CONTENT", daysOffset: 29 },
  { text: "SETUP DISCORD COMMUNITY PREVIEW", phase: "CREATION", priority: "Routine", category: "STRATEGY", daysOffset: 30 },
  { text: "DESIGN LINKTREE/BIO LINK UPDATE", phase: "CREATION", priority: "Routine", category: "DATA", daysOffset: 31 },
  { text: "SHOOT RAW VERTICAL CONTENT FOR REELS", phase: "CREATION", priority: "High", category: "CONTENT", daysOffset: 32 },
  { text: "CREATE 'OUT NOW' MOCKUPS", phase: "CREATION", priority: "Medium", category: "CONTENT", daysOffset: 33 },
  { text: "FINALIZE CREATIVE ASSET INVENTORY", phase: "CREATION", priority: "High", category: "CORE", daysOffset: 34 },

  // PHASE IV: PITCHING (4 Tasks)
  { text: "SUBMIT TO SPOTIFY EDITORIAL (3 WKS OUT)", phase: "PITCHING", priority: "High", category: "STRATEGY", daysOffset: 35 },
  { text: "SEND EPK TO TARGET BLOGS/PRESS", phase: "PITCHING", priority: "Medium", category: "STRATEGY", daysOffset: 36 },
  { text: "PITCH TO SOUNDTRACK/SYNC AGENTS", phase: "PITCHING", priority: "Planning", category: "STRATEGY", daysOffset: 37 },
  { text: "EXECUTE INDEPENDENT PLAYLIST OUTREACH", phase: "PITCHING", priority: "Medium", category: "STRATEGY", daysOffset: 38 },

  // PHASE V: LAUNCH (2 Tasks)
  { text: "GO LIVE: DSTRIBUTOR RELEASE TRIGGER", phase: "LAUNCH", priority: "High", category: "CORE", daysOffset: 42 },
  { text: "EXECUTE 24-HOUR FAN ENGAGEMENT BLITZ", phase: "LAUNCH", priority: "High", category: "STRATEGY", daysOffset: 43 }
];
