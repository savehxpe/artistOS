# ARTIST_OS Skill: Team Workflow

## 1. Role-Based Delegation
The ARTIST_OS is designed to manage high-stakes creative workflows. Each role has distinct responsibilities and views.

### A. The Artist (Talent)
- **Role Focus**: Creative approval and high-priority contractual sign-offs.
- **Key Tasks**: Approve Masters, Sign Riders, Review Tour Visuals Concept.
- **View**: Dashboard-centric, minimalist.

### B. The Manager (Ops)
- **Role Focus**: Strategic execution and administrative oversight.
- **Key Tasks**: Press Kit Assets, Q3 Budget Proposals, Scheduling Rehearsals.
- **View**: Task-manager centric, data-dense.

### C. The Executive Producer (EP)
- **Role Focus**: Distribution, Royalties, and Master quality control.
- **Key Tasks**: Audio Stem QC, Master V4 Sign-offs, Metadata Integrity.
- **View**: Vault-centric, technical.

## 2. Workflow Logic
### Task Priority (The Hierarchy of Action)
1. **High Priority (Yellow highlight)**: Blocking tasks (Legal, Master Approval).
2. **Medium Priority (Solid Black)**: Strategic (Budget, Scheduling).
3. **Routine (Grayed out)**: Maintenance (Asset tagging, Meeting notes).

### The "Approval Flow"
1. **Manager** drafts a task or asset.
2. **EP** reviews and uploads to `creative_vault/`.
3. **Artist** sees "Urgent Task" on Dashboard.
4. **Artist** taps "Approve" (Signature or Check).
5. **System** updates Metadata in `creative_vault/` and signs-off Task in `task_manager/`.

## 3. Communication Strategy
- **Style**: Direct, no visual noise (Monochrome).
- **Format**: All-caps labels for a technical/contractual look.
- **Feedback**: Active scale transitions (0.95) on all interactive elements.