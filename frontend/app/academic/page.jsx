"use client";

import { useEffect, useState } from "react";
import ToriiNav from "../../components/ToriiNav";

export default function AcademicPage() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAuth(data.auth || null))
      .catch(() => {});
  }, []);

  const subjects = [
    { code: "CS401", title: "Advanced Algorithms", professor: "Dr. Arvind Sharma", attendance: "92%", status: "Good Standing", credits: 4, room: "Hall B-402" },
    { code: "CS405", title: "Distributed Database Systems", professor: "Prof. Sunita Rao", attendance: "86%", status: "Good Standing", credits: 4, room: "Lab 3" },
    { code: "DS412", title: "Human Computer Interaction", professor: "Prof. Priya Nair", attendance: "78%", status: "Cautionary (Near 75%)", credits: 3, room: "Design Wing 2" },
    { code: "EC302", title: "Digital Signal Processing", professor: "Dr. Rajesh Verma", attendance: "89%", status: "Good Standing", credits: 4, room: "Room 204" },
  ];

  return (
    <div className="app-shell">
      <ToriiNav auth={auth} activeSection="academic" />

      <main className="main-content main-content-with-sidebar">
        {/* Header */}
        <section style={{ marginBottom: "32px", marginTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p className="font-body-lg" style={{ color: "var(--sandstone-text)", margin: "0 0 4px 0" }}>
                Academic Sanctuary
              </p>
              <h1 className="font-display" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                Pathshala Learning Hub
              </h1>
            </div>
            <span
              className="font-label-sm"
              style={{
                backgroundColor: "var(--surface-high)",
                padding: "6px 14px",
                borderRadius: "20px",
                color: "var(--indigo-dye)",
                fontWeight: 600,
              }}
            >
              Semester 4 • 21 Total Credits
            </span>
          </div>
        </section>

        {/* Attendance Risk & Health Banner */}
        <div
          className="card-surface"
          style={{
            padding: "24px",
            marginBottom: "32px",
            backgroundColor: "var(--surface-high)",
            borderLeft: "4px solid var(--sage-success)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <div>
            <span className="font-label-sm" style={{ color: "var(--sage-success)", fontWeight: 700, textTransform: "uppercase" }}>
              Attendance Safe Zone
            </span>
            <h2 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: "4px 0" }}>
              Overall Cumulative: 88.4%
            </h2>
            <p className="font-body-sm" style={{ color: "var(--sandstone-text)", margin: 0 }}>
              You are above the mandatory 75% institutional threshold across all 4 enrolled subjects.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <div style={{ padding: "12px 18px", backgroundColor: "var(--bg-washi)", borderRadius: "6px", textAlign: "center", border: "1px solid var(--border-subtle)" }}>
              <span className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block" }}>Buffer Classes</span>
              <strong className="font-headline-sm" style={{ color: "var(--indigo-dye)" }}>+6</strong>
            </div>
            <div style={{ padding: "12px 18px", backgroundColor: "var(--bg-washi)", borderRadius: "6px", textAlign: "center", border: "1px solid var(--border-subtle)" }}>
              <span className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block" }}>Internal Grade</span>
              <strong className="font-headline-sm" style={{ color: "var(--terracotta)" }}>A</strong>
            </div>
          </div>
        </div>

        {/* Subject Lockers */}
        <section style={{ marginBottom: "36px" }}>
          <h2 className="font-headline-md" style={{ color: "var(--indigo-primary)", margin: "0 0 18px 0" }}>
            Enrolled Subject Lockers
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {subjects.map((sub) => (
              <div key={sub.code} className="card-surface" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-label-sm" style={{ backgroundColor: "var(--bg-washi)", padding: "3px 8px", borderRadius: "4px", color: "var(--indigo-dye)", fontWeight: 700 }}>
                    {sub.code}
                  </span>
                  <span className="font-body-sm" style={{ color: sub.attendance.startsWith("7") ? "var(--ochre-warning)" : "var(--sage-success)", fontWeight: 600 }}>
                    {sub.attendance} Attendance
                  </span>
                </div>

                <div>
                  <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: "0 0 4px 0" }}>
                    {sub.title}
                  </h3>
                  <p className="font-body-sm" style={{ color: "var(--sandstone-text)", margin: 0 }}>
                    {sub.professor} • {sub.credits} Credits
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-body-sm" style={{ color: "var(--sandstone-muted)" }}>
                    {sub.room}
                  </span>
                  <button className="btn-ghost" style={{ fontSize: "12px", padding: "4px 8px" }}>
                    Syllabus & Docs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
