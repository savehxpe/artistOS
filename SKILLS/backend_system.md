# ARTIST_OS Skill: Backend & Vault Systems

## 1. The Creative Vault (Asset Management)
- **Upload Logic**: "BIG UPLOAD" drag-and-drop interface for STEMS, JPG, MP4.
- **Metadata**: Automatic tagging of file type, size, and timestamp.
- **Storage**: Real-time capacity monitoring displayed as a Dashboard KPI.
- **Security**: Watermarked previews for assets outside high-trust devices.

## 2. AI_STORY_GEN & Caption Engine
- **Input**: Reads file metadata and Campaign Metadata from `creative_vault/`.
- **Process**: Feeds asset context to Gemini/AI_STORY_GEN.
- **Output**: Generates three options (Editorial, Raw, Professional).
- **Fix**: Caption generation triggers only when `Campaign_Metadata` is populated.

## 3. Task Hierarchy & Signature
- **Priority**: High (Yellow), Medium (Black), Routine (Gray).
- **Approval Flow**: Manager Draft → EP QC → Artist Sign-off.
- **Signature**: Biometric or Digital Check updates `task_manager/` status.