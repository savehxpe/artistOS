# ARTIST_OS Skill: Artist Dashboard

## 1. Core Logic & Structure
The Artist Dashboard serves as the "Executive Command Center" for the talent. It prioritizes high-level visibility over deep administrative tasks.

### Primary Data Points
- **PHASE**: The current career or project state (e.g., ALBUM_ROLLOUT, TOUR_PREP, POST_RELEASE).
- **KPIs**: Career growth metrics (Market Penetration, Fan Engagement, Storage Capacity).
- **URGENCY**: Filtered tasks specifically from Manager or Legal that require immediate Artist sign-off.

## 2. Page Components
### A. Career Hero (Rollout Tracker)
- **Graphic**: High-contrast progress bar.
- **Data**: Percentage of Production and Marketing completion.
- **AI Hook**: Predictive timeline based on historical rollout speed.

### B. Urgent Task Stack
- **Source**: Manager (Operational), Legal (Contractual).
- **Actions**: Approve (Masters, Rehearsals, Visuals), Sign (Contracts, Riders).
- **Navigation**: Direct link to `task_manager/` for full stack.

### C. AI_STORY_GEN (Bento Grid)
- **Input**: Recent activity in the `creative_vault/`.
- **Output**: Suggested social hooks, "Behind the Scenes" narrative prompts.
- **Interactions**: "Generate Hook", "Preview Story".

### D. Vault Activity Feed
- **Type**: Horizontal scroll.
- **Items**: File name, Type (STEMS, JPG, MP4), Upload timestamp.
- **Security**: Watermarked previews if viewed outside of high-trust devices.

## 3. Role: Artist Focus
While the EP and Manager have access, the Dashboard is optimized for the **Artist Persona**:
- **Design Persona**: "Minimalist, Authoritative, Editorial."
- **Interaction**: Single-tap approvals, swipe-to-dismiss non-urgent items.
- **Voice**: Professional, binary, clean.