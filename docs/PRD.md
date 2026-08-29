# Product Requirements Document (PRD)

## Product Name

CampusHub (Working Name)

---

# 1. Problem Statement

Educational campuses often contain multiple colleges, departments, clubs, and administrative bodies.

Currently, announcements are distributed through numerous WhatsApp groups.

Example:

- College A Groups
- College B Groups
- Department Groups
- Club Groups
- Placement Groups
- Event Groups

As a result:

- Students miss important announcements.
- The same poster is forwarded repeatedly.
- Information becomes difficult to search later.
- Faculty spend time reposting updates.
- New students struggle to discover relevant information.
- Campus communication becomes fragmented.

The existing system (WhatsApp) is optimized for conversation, not structured campus communication.

CampusHub aims to provide a centralized, searchable, organized communication platform for educational institutions.

---

# 2. Vision

Create a digital campus operating system where every college, department, club, faculty member, and student can access relevant information from a single platform.

---

# 3. Target Users

### Primary Users

#### Students

Need:

- Announcements
- Events
- Placement updates
- Department notices
- Club information

Pain Points:

- Too many groups
- Missed updates
- Duplicate messages

---

#### Faculty

Need:

- Efficient announcement publishing
- Department communication
- Reduced message forwarding

Pain Points:

- Repeated sharing
- No tracking of visibility
- Information buried in chats

---

#### Department Coordinators

Need:

- Controlled information distribution
- Event promotion
- Notice management

---

#### College Administration

Need:

- Centralized communication
- Official notice publishing
- Information governance

---

# 4. AEIOU Empathy Mapping

## Activities

Students:

- Attend classes
- Join events
- Participate in clubs
- Apply for internships

Faculty:

- Share notices
- Publish schedules
- Coordinate events

---

## Environment

- Campus with multiple colleges
- Multiple departments
- Numerous WhatsApp groups
- Mobile-first users

---

## Interactions

Students interact with:

- Faculty
- Clubs
- Departments
- Campus events

Faculty interact with:

- Students
- Administration
- Departments

---

## Objects

- Posters
- Notices
- Events
- Circulars
- Documents
- Timetables

---

## Users

- Students
- Faculty
- Admins
- Club Coordinators

---

# 5. Goals

## Student Goals

- Never miss important announcements.
- Quickly find information.
- Discover campus opportunities.

---

## Faculty Goals

- Publish once.
- Reach intended audience.
- Reduce communication overhead.

---

## Platform Goals

- Replace announcement dependency on WhatsApp.
- Become the primary information source for campus communication.

---

# 6. MVP Scope

## Feature 1: Authentication

Users can:

- Register
- Login
- Logout

Acceptance Criteria:

- User can create account.
- User can login securely.
- Session persists after refresh.

---

## Feature 2: College Workspace

Each college has a dedicated workspace.

Acceptance Criteria:

- Users belong to one college.
- Users only see their college data.
- Data isolation is enforced.

---

## Feature 3: Department Channels

Examples:

- Computer Engineering
- Information Technology
- Mechanical
- Civil

Acceptance Criteria:

- Departments can be created.
- Users can join departments.
- Department announcements are visible only to relevant users.

---

## Feature 4: Announcement Feed

Faculty can publish announcements.

Acceptance Criteria:

- Announcement contains title.
- Announcement contains description.
- Announcement timestamp is stored.
- Feed displays newest announcements first.

---

## Feature 5: Poster Upload

Faculty can upload images.

Acceptance Criteria:

- PNG
- JPG
- JPEG

supported.

Uploaded posters appear inside announcements.

---

## Feature 6: Event Management

Faculty can create events.

Acceptance Criteria:

- Event title
- Event description
- Event date
- Event location

must be stored.

Upcoming events appear in event feed.

---

## Feature 7: Search

Users can search:

- Announcements
- Events

Acceptance Criteria:

- Search returns relevant results.
- Search response under 2 seconds.

---

# 7. Out of Scope (V1)

The following will NOT be built in MVP:

- AI Assistant
- Anonymous Posting
- Real-time Chat
- Payments
- Video Uploads
- Attendance Tracking
- LMS Features
- Online Exams
- Social Networking Features

---

# 8. User Roles

## Student

Permissions:

- View announcements
- View events
- Search content

---

## Faculty

Permissions:

- Create announcements
- Upload posters
- Create events

---

## Admin

Permissions:

- Manage colleges
- Manage departments
- Manage users
- Remove content

---

# 9. Success Metrics

## Adoption

- 100+ registered users in first college

---

## Engagement

- 50% weekly active users

---

## Content

- 20+ announcements per week

---

## Retention

- 30% users return weekly

---

# 10. Future Roadmap

Phase 2:

- Club Communities
- Discussion Boards
- Reactions
- Comments
- Notifications

Phase 3:

- Multi-Campus Expansion
- Analytics Dashboard
- AI Knowledge Assistant
- Intelligent Search
- Personalized Recommendations

---

# 11. Key Risks

## User Adoption Risk

Students may continue using WhatsApp.

Mitigation:

- Focus on announcements first.
- Partner with faculty.

---

## Faculty Adoption Risk

Faculty may resist new systems.

Mitigation:

- Make posting easier than WhatsApp.

---

## Data Management Risk

Large number of files and posters.

Mitigation:

- Cloud storage integration.

---

# 12. MVP Definition of Success

The MVP is successful if:

1. One college actively uses the platform.
2. Faculty publish announcements weekly.
3. Students regularly check announcements.
4. Important information is no longer dependent on WhatsApp forwarding.
5. The platform becomes the primary source of campus notices.

---

# 13. Bucket K: Event RSVP & Attendance System

## Purpose
Convert campus events from passive discovery into active student participation and attendee capacity management.

## Functional Capabilities
1. **One-Click Event RSVP**:
   - Authenticated students can RSVP to upcoming events within their college.
   - Enforces department visibility (students cannot RSVP to restricted department events unless enrolled).
   - Generates a unique, human-readable ticket number (`PASS-{eventShortId}-{random}`).
2. **RSVP Cancellation**:
   - Students can cancel their RSVP at any time before the event date, freeing up capacity for others.
3. **Event Capacity Management**:
   - Event organizers (faculty/admin) can set an optional maximum attendee capacity.
   - When capacity is reached, new RSVPs are rejected with a clear capacity alert.
   - Cancellations immediately restore available spots.
4. **Student Passbook History**:
   - Students have a centralized digital passbook (`/passes`) listing all active and past event tickets.
5. **Attendee Visibility**:
   - Event creators and administrators have full visibility into confirmed attendees for logistics planning.

