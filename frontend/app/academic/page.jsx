"use client";

import { useEffect, useState } from "react";
import ToriiNav from "../../components/ToriiNav";

export default function AcademicPage() {
  const [auth, setAuth] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [missedClasses, setMissedClasses] = useState(0);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAuth(data.auth || null))
      .catch(() => {});
  }, []);

  const subjects = [
    {
      code: "CS401",
      title: "Advanced Algorithms",
      professor: "Dr. Arvind Sharma",
      email: "arvind.sharma@campus.apex.edu",
      attendance: 92,
      attended: 23,
      total: 25,
      status: "Safe Standing",
      credits: 4,
      room: "Hall B-402",
      units: [
        { name: "Unit 1: Dynamic Programming & Amortized Analysis", status: "Completed" },
        { name: "Unit 2: Graph Algorithms & Network Flows", status: "In Progress" },
        { name: "Unit 3: NP-Completeness & Approximation Algorithms", status: "Upcoming" },
        { name: "Unit 4: Randomized Algorithms & Streaming", status: "Upcoming" },
      ],
      resources: ["Lecture 1-12 Notes (PDF)", "Problem Set 3 with Solutions", "Midterm Review Sheet"],
    },
    {
      code: "CS405",
      title: "Distributed Database Systems",
      professor: "Prof. Sunita Rao",
      email: "sunita.rao@campus.apex.edu",
      attendance: 86,
      attended: 19,
      total: 22,
      status: "Safe Standing",
      credits: 4,
      room: "Lab 3",
      units: [
        { name: "Unit 1: Distributed Transactions & 2PC Protocols", status: "Completed" },
        { name: "Unit 2: Consensus (Raft & Paxos) in Practice", status: "In Progress" },
        { name: "Unit 3: Sharding, Partitioning & CAP Theorem", status: "Upcoming" },
        { name: "Unit 4: Vector Clocks & CRDTs", status: "Upcoming" },
      ],
      resources: ["Raft Consensus Visualizer Guide", "Cassandra vs CockroachDB Architecture Slides"],
    },
    {
      code: "DS412",
      title: "Human Computer Interaction",
      professor: "Prof. Priya Nair",
      email: "priya.nair@campus.apex.edu",
      attendance: 78,
      attended: 14,
      total: 18,
      status: "Cautionary (Near 75%)",
      credits: 3,
      room: "Design Wing 2",
      units: [
        { name: "Unit 1: User-Centered Design & Persona Creation", status: "Completed" },
        { name: "Unit 2: Usability Testing & Heuristic Evaluation", status: "In Progress" },
        { name: "Unit 3: Accessibility (WCAG 2.2) & Color Systems", status: "Upcoming" },
        { name: "Unit 4: Micro-Interactions & Motion Design", status: "Upcoming" },
      ],
      resources: ["Heuristic Evaluation Template", "Figma Design System Kit"],
    },
    {
      code: "EC302",
      title: "Digital Signal Processing",
      professor: "Dr. Rajesh Verma",
      email: "rajesh.verma@campus.apex.edu",
      attendance: 89,
      attended: 25,
      total: 28,
      status: "Safe Standing",
      credits: 4,
      room: "Room 204",
      units: [
        { name: "Unit 1: Discrete Fourier Transform & FFT", status: "Completed" },
        { name: "Unit 2: IIR and FIR Filter Design", status: "Completed" },
        { name: "Unit 3: Multirate Digital Signal Processing", status: "In Progress" },
        { name: "Unit 4: Audio & Speech Processing Applications", status: "Upcoming" },
      ],
      resources: ["MATLAB DSP Scripts Lab Pack", "Filter Design Formulas Cheatsheet"],
    },
  ];

  // Calculate simulated attendance
  const totalAttended = subjects.reduce((acc, s) => acc + s.attended, 0);
  const totalClasses = subjects.reduce((acc, s) => acc + s.total, 0);
  const simulatedAttended = Math.max(0, totalAttended - missedClasses);
  const simulatedPercent = ((simulatedAttended / (totalClasses + (missedClasses > 0 ? 0 : 0))) * 100).toFixed(1);

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
              Semester 4 • 15 Enrolled Credits
            </span>
          </div>
        </section>

        {/* Interactive Attendance Safe Zone & Live Calculator */}
        <div
          className="card-surface"
          style={{
            padding: "24px",
            marginBottom: "32px",
            backgroundColor: "var(--surface-high)",
            borderLeft: "4px solid var(--sage-success)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <div>
            <span className="font-label-sm" style={{ color: "var(--sage-success)", fontWeight: 700, textTransform: "uppercase" }}>
              Live Attendance Safe Zone
            </span>
            <h2 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: "4px 0" }}>
              Overall Cumulative: {simulatedPercent}%
            </h2>
            <p className="font-body-sm" style={{ color: "var(--sandstone-text)", margin: "0 0 10px 0" }}>
              {Number(simulatedPercent) >= 75
                ? "✓ You are safely above the mandatory 75% institutional threshold."
                : "⚠ Alert: Projected attendance falls below 75% threshold!"}
            </p>

            {/* Attendance What-If Simulator */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
              <span className="font-label-sm" style={{ color: "var(--sandstone-text)" }}>
                What-If Skip Simulator:
              </span>
              <button
                type="button"
                onClick={() => setMissedClasses((prev) => Math.max(0, prev - 1))}
                className="btn-ghost"
                style={{ padding: "2px 8px", fontSize: "14px", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
              >
                -
              </button>
              <span className="font-body-sm" style={{ fontWeight: 700, minWidth: "60px", textAlign: "center" }}>
                {missedClasses} class{missedClasses !== 1 ? "es" : ""}
              </span>
              <button
                type="button"
                onClick={() => setMissedClasses((prev) => prev + 1)}
                className="btn-ghost"
                style={{ padding: "2px 8px", fontSize: "14px", border: "1px solid var(--border-subtle)", borderRadius: "4px" }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <div style={{ padding: "12px 18px", backgroundColor: "var(--bg-washi)", borderRadius: "6px", textAlign: "center", border: "1px solid var(--border-subtle)" }}>
              <span className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block" }}>Buffer Classes</span>
              <strong className="font-headline-sm" style={{ color: "var(--indigo-dye)" }}>
                +{Math.max(0, 6 - missedClasses)}
              </strong>
            </div>
            <div style={{ padding: "12px 18px", backgroundColor: "var(--bg-washi)", borderRadius: "6px", textAlign: "center", border: "1px solid var(--border-subtle)" }}>
              <span className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block" }}>Internal Grade</span>
              <strong className="font-headline-sm" style={{ color: "var(--terracotta)" }}>A</strong>
            </div>
          </div>
        </div>

        {/* Enrolled Subject Lockers (Click to inspect syllabus & notes) */}
        <section style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h2 className="font-headline-md" style={{ color: "var(--indigo-primary)", margin: 0 }}>
              Enrolled Subject Lockers
            </h2>
            <span className="font-label-sm" style={{ color: "var(--sandstone-muted)" }}>
              Click any locker to view syllabus, slides & instructor contact
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {subjects.map((sub) => (
              <div
                key={sub.code}
                className="card-surface"
                onClick={() => setSelectedSubject(sub)}
                style={{
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  cursor: "pointer",
                  border: selectedSubject?.code === sub.code ? "2px solid var(--indigo-dye)" : "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    className="font-label-sm"
                    style={{
                      backgroundColor: "var(--surface-high)",
                      color: "var(--indigo-dye)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: 700,
                    }}
                  >
                    {sub.code}
                  </span>
                  <span
                    className="font-label-sm"
                    style={{
                      color: sub.attendance >= 85 ? "var(--sage-success)" : "var(--ochre-warning)",
                      fontWeight: 700,
                    }}
                  >
                    {sub.attendance}% Attendance ({sub.attended}/{sub.total})
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

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                  <span className="font-body-sm" style={{ color: "var(--sandstone-muted)" }}>
                    {sub.room}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: "4px 8px", fontSize: "12px", color: "var(--terracotta)", fontWeight: 600 }}
                  >
                    Open Locker →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Selected Subject Drawer Modal */}
        {selectedSubject && (
          <div
            className="card-surface"
            style={{
              padding: "28px",
              backgroundColor: "#FFFFFF",
              border: "2px solid var(--indigo-dye)",
              boxShadow: "0 8px 30px rgba(35, 33, 29, 0.12)",
              marginBottom: "40px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span className="font-label-sm" style={{ color: "var(--terracotta)", textTransform: "uppercase", fontWeight: 700 }}>
                  {selectedSubject.code} Subject Locker
                </span>
                <h2 className="font-headline-lg" style={{ color: "var(--indigo-primary)", margin: "4px 0" }}>
                  {selectedSubject.title}
                </h2>
                <p className="font-body-sm" style={{ color: "var(--sandstone-text)", margin: 0 }}>
                  Instructor: <strong>{selectedSubject.professor}</strong> ({selectedSubject.email}) • Venue: {selectedSubject.room}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubject(null)}
                className="btn-ghost"
                style={{ fontSize: "18px", padding: "4px 8px" }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              {/* Syllabus Units */}
              <div>
                <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", marginBottom: "12px" }}>
                  Syllabus Progress
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedSubject.units.map((unit) => (
                    <div
                      key={unit.name}
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "var(--surface-high)",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span className="font-body-sm" style={{ color: "var(--text-primary)" }}>
                        {unit.name}
                      </span>
                      <span
                        className="font-label-sm"
                        style={{
                          color: unit.status === "Completed" ? "var(--sage-success)" : unit.status === "In Progress" ? "var(--ochre-warning)" : "var(--sandstone-muted)",
                          fontWeight: 600,
                        }}
                      >
                        {unit.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lecture Notes & Downloads */}
              <div>
                <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", marginBottom: "12px" }}>
                  Study Resources & Handouts
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedSubject.resources.map((res) => (
                    <div
                      key={res}
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "var(--surface-lift)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span className="font-body-sm" style={{ color: "var(--indigo-dye)", fontWeight: 500 }}>
                        📄 {res}
                      </span>
                      <button
                        type="button"
                        onClick={() => alert(`Downloaded: ${res}`)}
                        className="btn-primary"
                        style={{ padding: "3px 10px", fontSize: "11px" }}
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
