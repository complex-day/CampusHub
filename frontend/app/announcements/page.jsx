"use client";

import { useEffect, useState } from "react";
import AnnouncementCard from "../../components/AnnouncementCard";
import CreateAnnouncementForm from "../../components/CreateAnnouncementForm";
import ToriiNav from "../../components/ToriiNav";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const [feedResponse, meResponse, departmentsResponse] = await Promise.all([
          fetch("/api/announcements", { credentials: "include" }),
          fetch("/api/me", { credentials: "include" }),
          fetch("/api/departments", { credentials: "include" }),
        ]);
        if (!feedResponse.ok) throw new Error("Unable to load announcements");
        const feed = await feedResponse.json();
        const me = meResponse.ok ? await meResponse.json() : {};
        const departmentData = departmentsResponse.ok ? await departmentsResponse.json() : {};
        setAnnouncements(feed.announcements || []);
        setAuth(me.auth || null);
        setDepartments(departmentData.departments || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredAnnouncements = announcements.filter((item) => {
    if (activeFilter === "dept") return Boolean(item.departmentId);
    if (activeFilter === "college") return !item.departmentId;
    return true;
  });

  const studentName = auth?.name || "Student";

  return (
    <div className="app-shell">
      <ToriiNav auth={auth} activeSection="home" />

      <main className="main-content main-content-with-sidebar">
        {/* =========================================================================
            AANGAN WELCOME HEADER (Ma & Breathing Room)
            ========================================================================= */}
        <section style={{ marginBottom: "36px", marginTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p className="font-body-lg" style={{ color: "var(--sandstone-text)", margin: "0 0 4px 0" }}>
                Good Morning, {studentName}.
              </p>
              <h1 className="font-display" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                Your academic courtyard awaits.
              </h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="font-label-md" style={{ color: "var(--sandstone-text)", marginBottom: "4px" }}>
                Next Milestone
              </p>
              <p className="font-headline-sm" style={{ color: "var(--terracotta)", margin: 0 }}>
                Midterms in 14 Days
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BENTO GRID: TODAY'S PATH & ACADEMIC HEALTH
            ========================================================================= */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "36px" }}>
          {/* Today's Path Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 className="font-headline-md" style={{ color: "var(--indigo-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--terracotta)" }}>
                calendar_today
              </span>
              <span>Today's Path</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
              {/* Class 1 */}
              <div className="card-surface" style={{ padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px" }}>
                <div>
                  <span className="font-label-sm" style={{ backgroundColor: "var(--bg-washi)", padding: "3px 8px", borderRadius: "4px", color: "var(--sandstone-text)", display: "inline-block", marginBottom: "8px" }}>
                    10:00 AM - 11:30 AM
                  </span>
                  <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                    Advanced Algorithms
                  </h3>
                </div>
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-body-sm" style={{ color: "var(--sandstone-text)" }}>Room 402, Block B</span>
                  <span className="font-label-sm" style={{ color: "var(--indigo-dye)", fontWeight: 600 }}>Lecture</span>
                </div>
              </div>

              {/* Class 2 */}
              <div className="card-surface" style={{ padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px" }}>
                <div>
                  <span className="font-label-sm" style={{ backgroundColor: "var(--bg-washi)", padding: "3px 8px", borderRadius: "4px", color: "var(--sandstone-text)", display: "inline-block", marginBottom: "8px" }}>
                    2:00 PM - 3:30 PM
                  </span>
                  <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                    Design Thinking Lab
                  </h3>
                </div>
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "10px", marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-body-sm" style={{ color: "var(--sandstone-text)" }}>Studio 2, Design Wing</span>
                  <span className="font-label-sm" style={{ color: "var(--ochre-warning)", fontWeight: 600 }}>Practical</span>
                </div>
              </div>
            </div>

            {/* Urgent Task Card */}
            <div className="card-surface" style={{ padding: "18px", borderLeft: "4px solid var(--terracotta)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--error-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--terracotta)" }}>
                    assignment_late
                  </span>
                </div>
                <div>
                  <h4 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                    Submit HCI Research Paper
                  </h4>
                  <p className="font-body-sm" style={{ color: "var(--sandstone-text)", margin: "2px 0 0 0" }}>
                    Due today at 11:59 PM • Draft is 80% complete
                  </p>
                </div>
              </div>
              <button className="btn-primary" style={{ fontSize: "12px", padding: "6px 14px" }}>
                Resume Draft
              </button>
            </div>
          </div>

          {/* Academic Health & Saarthi Context */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 className="font-headline-md" style={{ color: "var(--indigo-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--sage-success)" }}>
                spa
              </span>
              <span>Academic Health</span>
            </h2>

            {/* Health Metrics Card */}
            <div className="card-surface" style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                  <span className="font-label-md" style={{ color: "var(--sandstone-text)" }}>Overall Attendance</span>
                  <span className="font-headline-md" style={{ color: "var(--indigo-primary)", margin: 0 }}>88%</span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-washi)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "88%", height: "100%", backgroundColor: "var(--sage-success)", borderRadius: "4px" }}></div>
                </div>
                <p className="font-body-sm" style={{ color: "var(--sandstone-text)", marginTop: "8px", margin: "8px 0 0 0" }}>
                  ✓ Good standing. 0 classes shortfall.
                </p>
              </div>

              <div style={{ width: "1px", height: "60px", backgroundColor: "var(--border-subtle)" }}></div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "54px", height: "54px", borderRadius: "50%", border: "2px solid var(--indigo-dye)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="font-headline-sm" style={{ color: "var(--indigo-dye)" }}>3.8</span>
                </div>
                <div>
                  <span className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block" }}>CGPA</span>
                  <span className="font-body-sm" style={{ color: "var(--sandstone-text)", fontWeight: 500 }}>Top 15%</span>
                </div>
              </div>
            </div>

            {/* Saarthi Daily Insight */}
            <div className="card-surface" style={{ padding: "18px", backgroundColor: "var(--surface-high)", border: "1px solid rgba(61, 78, 107, 0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--indigo-dye)", fontSize: "18px" }}>
                  lightbulb
                </span>
                <span className="font-headline-sm" style={{ color: "var(--indigo-dye)", fontSize: "16px", margin: 0 }}>
                  Saarthi Insight
                </span>
              </div>
              <p className="font-body-sm" style={{ color: "var(--sandstone-text)", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                Based on your study patterns, morning hours are optimal for analytical concepts. Consider reviewing "Data Structures" at 9 AM tomorrow.
              </p>
              <span className="font-label-sm" style={{ color: "var(--indigo-dye)", fontWeight: 600 }}>
                Schedule synced with Pathshala
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FACULTY & ADMIN ANNOUNCEMENT PUBLISHER
            ========================================================================= */}
        {auth && ["faculty", "admin"].includes(auth.role) && (
          <CreateAnnouncementForm
            collegeId={auth.collegeId}
            departments={departments}
            onCreated={(announcement) => setAnnouncements([announcement, ...announcements])}
          />
        )}

        {/* =========================================================================
            CAMPUS NOTICES & ANNOUNCEMENT FEED
            ========================================================================= */}
        <section style={{ marginTop: "32px", borderTop: "1px solid var(--border-subtle)", paddingTop: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
            <h2 className="font-headline-md" style={{ color: "var(--indigo-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--sandstone-text)" }}>
                campaign
              </span>
              <span>Notices & Campus Pulse</span>
            </h2>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "6px", backgroundColor: "var(--surface-lift)", padding: "4px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
              <button
                onClick={() => setActiveFilter("all")}
                className="btn-ghost"
                style={{
                  padding: "4px 12px",
                  fontSize: "12px",
                  backgroundColor: activeFilter === "all" ? "var(--indigo-dye)" : "transparent",
                  color: activeFilter === "all" ? "#FFFFFF" : "var(--sandstone-text)",
                  borderRadius: "4px",
                }}
              >
                All Notices
              </button>
              <button
                onClick={() => setActiveFilter("dept")}
                className="btn-ghost"
                style={{
                  padding: "4px 12px",
                  fontSize: "12px",
                  backgroundColor: activeFilter === "dept" ? "var(--indigo-dye)" : "transparent",
                  color: activeFilter === "dept" ? "#FFFFFF" : "var(--sandstone-text)",
                  borderRadius: "4px",
                }}
              >
                Department
              </button>
              <button
                onClick={() => setActiveFilter("college")}
                className="btn-ghost"
                style={{
                  padding: "4px 12px",
                  fontSize: "12px",
                  backgroundColor: activeFilter === "college" ? "var(--indigo-dye)" : "transparent",
                  color: activeFilter === "college" ? "#FFFFFF" : "var(--sandstone-text)",
                  borderRadius: "4px",
                }}
              >
                College-Wide
              </button>
            </div>
          </div>

          {/* Feed States */}
          {loading && (
            <div className="card-surface" style={{ padding: "36px", textAlign: "center" }}>
              <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
                Loading institutional circulars...
              </p>
            </div>
          )}

          {error && (
            <div className="card-surface" style={{ padding: "20px", borderLeft: "4px solid var(--error-crimson)" }} role="alert">
              <p className="font-body-md" style={{ color: "var(--error-crimson)" }}>
                ⚠ {error}
              </p>
            </div>
          )}

          {!loading && !error && filteredAnnouncements.length === 0 && (
            <div className="card-surface" style={{ padding: "48px 24px", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--sandstone-muted)", marginBottom: "8px" }}>
                inbox
              </span>
              <p className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                No announcements in this category yet.
              </p>
              <p className="font-body-sm" style={{ color: "var(--sandstone-muted)", marginTop: "4px" }}>
                Your courtyard is serene and up to date.
              </p>
            </div>
          )}

          {!loading && !error && filteredAnnouncements.length > 0 && (
            <div aria-label="Announcement feed">
              {filteredAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement._id} announcement={announcement} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}