# ARTIST_OS Skill: Content Creation & Rollout

## 1. AI Content Copilot
The app integrates directly with OpenAI or Google Gemini (via AI_STORY_GEN) to automate the administrative overhead of fan engagement.

### A. AI_STORY_GEN (Dashboard)
- **Logic**: Reads the latest file metadata in the `creative_vault/`.
- **Suggestions**: Generates "Behind the Scenes" hooks.
- **Example**: "Generate hook teaser from 'Track_04'" or "Behind the scenes of vocal tracking..."

### B. AI Copilot (Calendar)
- **Feature**: Autonomous caption writing and platform tagging.
- **Workflow**: 
  1. Artist uploads to `content_calendar/`.
  2. AI generates 3 caption options (Editorial, Raw, Professional).
  3. Artist selects or regenerates.
  4. System schedules for Instagram, TikTok, or YouTube based on Campaign Metadata.

## 2. Editorial Rollout Strategy
The app follows a project-based rollout cycle (e.g., ALBUM_ROLLOUT).

### Timeline Phases
- **Production (100%)**: Final stems/masters uploaded to Vault.
- **Marketing (75%)**: BTS content and press kits distributed.
- **Pre-Release**: Tour visuals and merch reveals.
- **Release Day**: Fans Portal "Stage Door" event.

## 3. Design: The Bento Grid
Content suggestions use the **Bento Grid** component:
- **Style**: High-contrast squares.
- **Aesthetic**: `surface-container-lowest` for routine, `primary` (Black) for high-impact AI prompts.
- **Interactions**: Tapping a grid cell triggers the AI request and expands into the `content_calendar/` workspace.