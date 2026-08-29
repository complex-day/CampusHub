# CampusHub Beta Tester Onboarding Guide

Welcome to the **CampusHub Beta Testing Program (Bucket L0)**!  

You are among an exclusive group of students, faculty, and student club leads shaping the future of campus communications. Our mission is to replace noisy, unorganized WhatsApp groups with a calm, structured, verified, and beautiful digital sanctuary.

---

## 1. Quick Access & Credentials

* **Beta Web App URL:** `https://beta.campushub.edu` (or your local/staging preview URL)
* **Supported Devices:** Desktop, Tablet, and Mobile Web (iOS Safari, Android Chrome).

### Pre-Configured Test Accounts (or Self-Registration)
If you received invite credentials, use your assigned account below. Otherwise, register using your official college email.

| Role | Username / Email | Default Password | Assigned Responsibilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student.cs@campus.apex.edu` | `BetaTest#2026` | Test notice reading, department filters, RSVPing, Passbook tickets. |
| **Club Lead** | `club.lead@campus.apex.edu` | `BetaTest#2026` | Test event creation, flyer upload, capacity setting, roster viewing. |
| **Faculty** | `prof.sharma@campus.apex.edu` | `BetaTest#2026` | Test announcement publishing, department targeting, moderation. |
| **Admin** | `admin@campus.apex.edu` | `BetaTest#2026` | Test telemetry metrics, user role elevation, department CRUD. |

---

## 2. Step-by-Step Test Tracks

Please complete the test track matching your role, plus explore other flows freely.

### 🎒 Track A: Student Journey (Estimated Time: 10 mins)

1. **Log In & Welcome to Aangan Courtyard:**
   - Sign in at `/login`.
   - Observe the **Aangan Courtyard** dashboard. Notice how official circulars are separated from social noise.
2. **Filter Announcements by Department:**
   - Click the department chips (e.g. *Computer Science*, *Mechanical*, *Campus-Wide*).
   - Verify that you only see notices relevant to your department and general college updates.
3. **Explore Campus Life (Utsav):**
   - Click **Events** on the left dock or top bar (`/events`).
   - Browse upcoming hackathons and cultural festivals.
   - Click into an event details page (`/events/[id]`).
4. **Reserve Your Admission Pass (RSVP):**
   - Click the **RSVP Pass** button.
   - Verify your pass is confirmed instantly and issues a unique ticket number (e.g. `PASS-XXXX-YYYY`).
5. **View Your Passbook:**
   - Navigate to **Passbook & ID** (`/passes`).
   - Verify your newly reserved ticket appears under **Your Event Passes**.
   - Test the **Cancel Reservation** button to confirm ticket release.
6. **Test Omni-Search:**
   - Navigate to **Search** (`/search`).
   - Search for a keyword like `"Symposium"`, `"Scholarship"`, or `"Exam"`.

---

### 🎨 Track B: Club Lead & Event Organizer Journey (Estimated Time: 12 mins)

1. **Host a New Campus Gathering:**
   - Navigate to `/events`.
   - Click **Host New Event** to expand the **Utsav Event Studio**.
   - Enter an event title, date/time, venue, and detailed description.
2. **Set Attendee Capacity & Department Scope:**
   - Enter a capacity limit (e.g. `50` seats).
   - Select whether it's *Campus-Wide* or restricted to a specific department.
3. **Upload Event Poster:**
   - Drag and drop an event flyer (JPG/PNG/WebP, max 5MB).
   - Click **Launch Event on Utsav**.
4. **Simulate Registrations & Inspect Attendee Roster:**
   - Ask fellow beta testers to RSVP to your event.
   - Navigate to the admin moderation console `/admin/events` or your event view.
   - Click **Roster** to view real-time student names, emails, and ticket numbers.
5. **Test Capacity Enforcement:**
   - Set a test event capacity to `2`.
   - Have 3 testers try to register; verify the 3rd tester sees **Event Full** with no overbooking.

---

### 🏛️ Track C: Faculty & Administration Journey (Estimated Time: 12 mins)

1. **Publish an Official Circular:**
   - Navigate to `/announcements`.
   - Click **Draft New Notice** to open the **Announcement Studio**.
   - Set target scope: *College-Wide* vs. *Department-Specific*.
   - Upload an official header circular image.
   - Publish the announcement and verify it appears immediately in the student stream.
2. **Review Institutional Governance:**
   - Navigate to `/admin`.
   - Inspect the live metric cards (Total Users, Announcements, Events, Colleges).
   - Search for a user in `/admin/users` and test elevating their role (e.g. `student` → `faculty`).
3. **Moderate Content:**
   - Test deleting an outdated test notice or event from `/admin/announcements` or `/admin/events`.

---

## 3. What We Specifically Want You to Evaluate

As you test, please keep the following key evaluation criteria in mind:

| Focus Area | Core Question to Consider |
| :--- | :--- |
| **WhatsApp Comparison** | *Is this significantly easier to navigate and reference than a 500-member WhatsApp group with muted notifications?* |
| **Visual Aesthetics** | *How does the Kintsugi Academic design feel (Washi paper textures, typography, calm layouts)? Does it feel premium?* |
| **Trust & Verification** | *Do you feel confident that announcements here are authentic and authorized by college leadership?* |
| **Speed & Responsiveness** | *Did pages load fast on your mobile device? Were interactions smooth?* |
| **Clarity of RSVP Tickets** | *Is the ticket number and passbook intuitive to show at an auditorium entry gate?* |

---

## 4. How to Submit Feedback & Report Bugs

* **Quick Feedback Form:** Complete our 5-minute survey at [`FEEDBACK_FORM.md`](file:///c:/Users/Lenovo/Desktop/PROJECT%20CREATED/campushub/FEEDBACK_FORM.md) or the online link provided in your invite.
* **Reporting a Bug:** If you encounter an error, broken button, or layout flaw:
  1. Note the page URL (e.g. `/events/123`).
  2. Take a screenshot or screen recording if possible.
  3. Describe what you clicked and what happened vs. what you expected.
  4. Submit directly via the Beta Discord/Telegram Channel or email `beta-support@campushub.edu`.

Thank you for helping us craft the future of student life!
