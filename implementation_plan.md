# Implementation Plan: CampusHub Kintsugi UI Integration

Integrate the **Kintsugi Academic** design system and the complete suite of 9 high-fidelity screens extracted from Google Stitch into the Next.js frontend application.

## User Review Required

> [!IMPORTANT]
> The design uses **`Source Serif 4`** (for editorial/academic headlines) and **`Hanken Grotesk`** (for clean UI/body reading), with **`Material Symbols Outlined`** for consistent 1.5px stroke iconography.
> All components adhere strictly to the **Kintsugi Academic** palette (`#F7F3EA` Washi background, `#F1ECE1` Sandstone surface, `#3D4E6B` Vedic Indigo, `#B65C3A` Terracotta, `#6B8A63` Sage Green).

---

## Proposed Changes

### 1. Design System & Global Styles (`frontend/app/`)

#### [MODIFY] [layout.jsx](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/app/layout.jsx)
- Import Google Fonts (`Source Serif 4`, `Hanken Grotesk`) and `Material Symbols Outlined`.
- Include `globals.css` with Kintsugi theme variables, typography utility classes, and paper shadows.

#### [NEW] [globals.css](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/app/globals.css)
- Define full Kintsugi color tokens, spatial grid, card surface hover transitions, custom scrollbars, and elevation classes.

---

### 2. Navigation Shell (`Torii`)

#### [NEW] [ToriiNav.jsx](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/components/ToriiNav.jsx)
- 256px fixed sidebar dock with active indicators, task-based links (Aangan Courtyard, Pathshala Academics, Utsav Campus Life, Saarthi AI, Passes, Admin Desk).
- Top utility bar with global search, notification center, quick Saarthi launch button, and user avatar.
- Mobile bottom thumb bar for responsive phone viewports.

---

### 3. Core Experience Modules

#### [MODIFY] [page.jsx (Root Home - Aangan)](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/app/page.jsx)
- Transform the root landing into the **Aangan Central Courtyard**:
  - Contextual morning greeting ("Your academic courtyard awaits").
  - Next milestone banner (Midterms in 14 days).
  - "Today's Path" Bento cards (Classes with room numbers, urgent draft submission task).
  - Academic Health card (88% attendance gauge, 3.8 CGPA).
  - Saarthi AI Insight card.
  - Quick Action grid (Mark Attendance, Library Due, Fee Status, Mess Menu).
  - Real-time Notices & Campus Pulse feed.

#### [NEW] [academic/page.jsx (Pathshala Academic Hub)](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/app/academic/page.jsx)
- Complete **Pathshala Hub**:
  - Subject lockers (Algorithms, HCI, Networks).
  - Attendance risk calculator & shortfall warning.
  - Class timetable & room direction cards.
  - Assignment submission locker.

#### [MODIFY] [events/page.jsx (Utsav Campus Life)](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/app/events/page.jsx)
- Update **Utsav Hub**:
  - Featured event hero carousel.
  - High-resolution poster gallery with ambient glow backdrop.
  - Guest lecture & hackathon discovery cards.
  - One-tap RSVP registration.

#### [NEW] [events/create/page.jsx (Utsav Event Studio)](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/app/events/create/page.jsx)
- 60/40 split-workspace for event organizers:
  - Event metadata form & category selector chips.
  - Cloudinary poster drag-and-drop zone.
  - Real-time live poster preview card with ambient glow and RSVP CTA.

#### [NEW] [passes/page.jsx (Campus Passbook & Digital ID)](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/app/passes/page.jsx)
- **Digital Credentials Sanctuary**:
  - Tactile physical-like student ID badge with gold hairline border and security timestamp.
  - Apple/Google Wallet export triggers.
  - Scannable QR Event Passes with venue and seat confirmations.

#### [NEW] [saarthi/page.jsx (Saarthi AI Sanctuary)](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/app/saarthi/page.jsx)
- **Saarthi AI Companion Workspace**:
  - Full-canvas conversational interface.
  - Verified circular Q&A with citation badges.
  - Schedule conflict assistant and study plan optimizer.

#### [NEW] [announcements/create/page.jsx (Announcement Studio)](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/app/announcements/create/page.jsx)
- Dual-pane publishing studio for faculty & admins:
  - Distraction-free Markdown editor.
  - Cohort & department target pickers.
  - Urgency priority toggle (Standard vs. Critical Terracotta).
  - Live "Aangan Courtyard" preview card.

#### [MODIFY] [admin/page.jsx (Admin Governance)](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/frontend/app/admin/page.jsx)
- **Admin Governance & Multi-Tenant Control Center**:
  - Active tenant badge (`Apex Institute of Technology - Tenant #892`).
  - Stepwell KPI metrics grid (Enrolled users, Verified circulars, Tenant isolation health, Cloudinary quota).
  - User & Role Governance table with role elevation actions.
  - Content Moderation Vault & circular approval drawer.

---

## Verification Plan

### Automated Verification
- Verify Next.js build: `npm run build` inside `frontend/` (using sandboxed non-interactive checks).
- Inspect all component imports and prop validations.

### Manual Verification
- Test navigation transitions between all 6 Buckets (`/`, `/academic`, `/events`, `/events/create`, `/passes`, `/saarthi`, `/announcements/create`, `/admin`).
- Verify responsive layout across Desktop (1440px+), Tablet (768px-1024px), and Mobile (390px).
- Verify dark/light aesthetic integrity and WCAG AA contrast on warm background surfaces.
