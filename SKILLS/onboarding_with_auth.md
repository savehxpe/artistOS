# ARTIST_OS Skill: Onboarding & Authentication

## 1. Authentication Logic
- **Protocol**: OAuth 2.0 / Firebase Auth.
- **Roles**: ARTIST, MANAGER, EXECUTIVE_PRODUCER.
- **Validation**: Multi-factor authentication (MFA) required for Legal/Contractual sign-offs.

## 2. Onboarding Flow: "THE STARTING LINE"
- **Trigger**: New user login or "Start New Rollout" action.
- **Walkthrough**: 5-question high-level diagnostic to determine PHASE (ALBUM_ROLLOUT, TOUR_PREP, etc.).
- **Task Generation**: Logic expands 5 inputs into a 54-item master checklist in `task_manager/`.
- **System Date Sync**: All deadlines auto-calibrate to CURRENT_DATE (2026-03-27).

## 3. Role-Based View Routing
- **ARTIST**: Redirect to `artist_dashboard/` (Minimalist, Hero-focused).
- **MANAGER**: Redirect to `ops_center/` (Task-dense).
- **EP**: Redirect to `creative_vault/` (Technical, Metadata-focused).

## 4. Branding & UI
- **Palette**: Monochrome (High-contrast Black/White).
- **Layout**: Centered bento-grid modules.
- **Interaction**: Active scale transitions (0.95) on all buttons.