# ARTIST_OS Skill: Task Manager Logic

## 1. The Expansion Engine (Input -> Output)
- **Trigger**: `ONBOARDING_COMPLETE` event.
- **Mapping**: 
    - Take `PROJECT_TYPE` and set the task multiplier (Single = 1x, Album = 10x).
    - Take `WEEKS_TO_RELEASE` and distribute the 54 tasks across 5 temporal phases.
    - If `HAS_COLLABS` is TRUE, inject 10 additional "Legal/Split-Sheet" tasks into Phase II.

## 2. Priority & State Management
- **High Priority (Yellow)**: Logic flag for all tasks involving 'SIGN', 'APPROVE', or 'LEGAL'.
- **Medium Priority (Black)**: Logic flag for 'STRATEGIC', 'MARKETING', or 'PITCHING'.
- **Routine (Gray)**: Logic flag for 'INGESTION', 'TAGGING', or 'MAINTENANCE'.

## 3. The Approval Gateway
- **Action**: Tasks marked as 'Artist Sign-off' are locked until the Manager and EP mark their sub-tasks as 'VERIFIED'.
- **Feedback**: Completion of a Phase (e.g., Phase I: 100%) triggers the progress bar update in the `MISSION_STATUS` bento grid.

## 4. Hard-Coded Constraints
- **Start Date**: March 27, 2026.
- **Transitions**: 0.95 scale active state on every checkbox/signature.