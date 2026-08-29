"use client";

import Link from "next/link";
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
  const [showPublishModal, setShowPublishModal] = useState(false);

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
        {/* Header */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setShowPublishModal(!showPublishModal)}
                className="btn-primary"
                style={{ fontSize: "13px", padding: "8px 16px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  campaign
                </span>
                <span>{showPublishModal ? "Close Publisher" : "Publish Notice"}</span>
              </button>
              <div style={{ textAlign: "right" }}>
                <p className="font-label-md" style={{ color: "var(--sandstone-text)", marginBottom: "4px" }}>
                  Next Milestone
                </p>
                <p className="font-headline-sm" style={{ color: "var(--terracotta)", margin: 0 }}>
                  Midterms in 14 Days
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Publish Notice Form */}
        {showPublishModal && (
          <section style={{ marginBottom: "32px" }}>
            <CreateAnnouncementForm
              collegeId={auth?.collegeId || "507f1f77bcf86cd799439011"}
              departments={departments}
              onCreated={(newAnnouncement) => {
                setAnnouncements([newAnnouncement, ...announcements]);
                setShowPublishModal(false);
              }}
            />
          </section>
        )}

        {/* Bento Grid: Today's Path & Academic Health */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "36px" }}>
          {/* Today's Path Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="font-headline-md" style={{ color: "var(--indigo-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--terracotta)" }}>
                  calendar_today
                </span>
                <span>Today's Path</span>
              </h2>
              <Link href="/academic" className="font-label-sm" style={{ color: "var(--terracotta)", fontWeight: 600 }}>
                View All Lockers →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
              {/* Class 1 */}
              <Link
                href="/academic"
                className="card-surface"
                style={{ padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px", textDecoration: "none" }}
              >
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
                  <span className="font-label-sm" style={{ color: "var(--indigo-dye)", fontWeight: 600 }}>Lecture (92%)</span>
                </div>
              </Link>

              {/* Class 2 */}
              <Link
                href="/academic"
                className="card-surface"
                style={{ padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px", textDecoration: "none" }}
              >
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
                  <span className="font-label-sm" style={{ color: "var(--ochre-warning)", fontWeight: 600 }}>Practical (78%)</span>
                </div>
              </Link>
            </div>

            {/* Task Card */}
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
              <Link href="/academic" className="btn-primary" style={{ fontSize: "12px", padding: "6px 14px" }}>
                Open Lockers
              </Link>
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
            <Link href="/academic" className="card-surface" style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", textDecoration: "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                  <span className="font-label-md" style={{ color: "var(--sandstone-text)" }}>Overall Attendance</span>
                  <span className="font-headline-md" style={{ color: "var(--indigo-primary)", margin: 0 }}>88.4%</span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-washi)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: "88%", height: "100%", backgroundColor: "var(--sage-success)", borderRadius: "4px" }}></div>
                </div>
                <p className="font-body-sm" style={{ color: "var(--sandstone-text)", marginTop: "8px", margin: "8px 0 0 0" }}>
                  ✓ Safe standing. +6 buffer classes across 4 subjects.
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
            </Link>

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
                Based on your study patterns, morning hours are optimal for analytical concepts. Review "Advanced Algorithms" at 10 AM.
              </p>
              <Link href="/academic" className="font-label-sm" style={{ color: "var(--indigo-dye)", fontWeight: 600 }}>
                Synced with Pathshala Hub →
              </Link>
            </div>
          </div>
        </div>

        {/* Notices & Campus Pulse */}
        <section style={{ marginTop: "32px", borderTop: "1px solid var(--border-subtle)", paddingTop: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
            <h2 className="font-headline-md" style={{ color: "var(--indigo-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--terracotta)" }}>
                campaign
              </span>
              <span>Notices & Campus Pulse ({filteredAnnouncements.length})</span>
            </h2>

            {/* Filter Pills */}
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

          {loading && (
            <div className="card-surface" style={{ padding: "36px", textAlign: "center" }}>
              <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
                Opening the academic courtyard...
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
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--sandstone-muted)", marginBottom: "12px" }}>
                mark_email_read
              </span>
              <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: "0 0 6px 0" }}>
                Courtyard is quiet right now.
              </h3>
              <p className="font-body-sm" style={{ color: "var(--sandstone-text)", maxWidth: "420px", margin: "0 auto 16px auto" }}>
                No announcements in this category yet. Click <strong>Publish Notice</strong> above to broadcast the first circular!
              </p>
            </div>
          )}

          {!loading && filteredAnnouncements.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredAnnouncements.map((item) => (
                <AnnouncementCard key={item._id} announcement={item} departments={departments} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}