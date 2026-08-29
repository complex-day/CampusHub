"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ToriiNav from "../../components/ToriiNav";

export default function PassesPage() {
  const [auth, setAuth] = useState(null);
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [meResponse, passesResponse] = await Promise.all([
        fetch("/api/me", { credentials: "include" }),
        fetch("/api/me/passes", { credentials: "include" }),
      ]);
      const meData = meResponse.ok ? await meResponse.json() : {};
      const passesData = passesResponse.ok ? await passesResponse.json() : { passes: [] };
      setAuth(meData.auth || null);
      setPasses(passesData.passes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function cancelPass(eventId) {
    if (!confirm("Are you sure you want to cancel this event pass?")) return;
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Unable to cancel pass");
      }
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  const studentName = auth?.name || "Student";
  const studentEmail = auth?.email || "student@campus.apex.edu";

  return (
    <div className="app-shell">
      <ToriiNav auth={auth} activeSection="passes" />

      <main className="main-content main-content-with-sidebar">
        <section style={{ marginBottom: "32px", marginTop: "8px" }}>
          <p className="font-body-lg" style={{ color: "var(--sandstone-text)", margin: "0 0 4px 0" }}>
            Credentials & Access
          </p>
          <h1 className="font-display" style={{ color: "var(--indigo-primary)", margin: 0 }}>
            Passbook & Digital Credentials
          </h1>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", alignItems: "start", marginBottom: "40px" }}>
          {/* Tactile Digital Student ID Card */}
          <div
            style={{
              backgroundColor: "var(--indigo-primary)",
              color: "#FFFFFF",
              borderRadius: "12px",
              padding: "28px",
              boxShadow: "0 12px 32px rgba(38, 55, 83, 0.25)",
              border: "1px solid rgba(214, 154, 45, 0.4)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Watermark Crest */}
            <div
              style={{
                position: "absolute",
                right: "-20px",
                bottom: "-20px",
                opacity: 0.08,
                fontSize: "180px",
                color: "#FFFFFF",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "160px" }}>
                account_balance
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
              <div>
                <span className="font-label-sm" style={{ color: "var(--ochre-warning)", letterSpacing: "0.08em" }}>
                  Apex Institute of Technology
                </span>
                <h3 className="font-headline-sm" style={{ color: "#FFFFFF", margin: "2px 0 0 0" }}>
                  Student Identity Card
                </h3>
              </div>
              <span className="material-symbols-outlined" style={{ color: "var(--ochre-warning)", fontSize: "28px" }}>
                verified_user
              </span>
            </div>

            <div style={{ display: "flex", gap: "18px", alignItems: "center", marginBottom: "28px" }}>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  border: "1.5px solid rgba(255, 255, 255, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                {studentName.charAt(0)}
              </div>
              <div>
                <strong className="font-headline-sm" style={{ color: "#FFFFFF", display: "block" }}>
                  {studentName}
                </strong>
                <span className="font-body-sm" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
                  {studentEmail}
                </span>
                <span className="font-label-sm" style={{ color: "var(--ochre-warning)", display: "block", marginTop: "2px" }}>
                  Status: Active Student
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: "14px" }}>
              <div>
                <span className="font-label-sm" style={{ color: "rgba(255, 255, 255, 0.6)", display: "block" }}>
                  Valid Academic Cycle
                </span>
                <span className="font-body-sm" style={{ color: "#FFFFFF", fontWeight: 600 }}>
                  2026 – 2028
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--sage-success)" }}></span>
                <span className="font-label-sm" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  Verified Identity
                </span>
              </div>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="card-surface" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--terracotta)", fontSize: "24px" }}>
                confirmation_number
              </span>
              <div>
                <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                  Active Event Reservations
                </h3>
                <span className="font-label-sm" style={{ color: "var(--sandstone-text)" }}>
                  Instant digital tickets for campus fests and seminars
                </span>
              </div>
            </div>

            <p className="font-body-sm" style={{ color: "var(--sandstone-text)", margin: "4px 0 0 0", lineHeight: 1.6 }}>
              Your RSVP tickets are guaranteed admission passes for campus venues. Present your ticket number at auditorium entry gates.
            </p>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="font-label-sm" style={{ color: "var(--sandstone-muted)" }}>
                Confirmed Passes: <strong>{passes.length}</strong>
              </span>
              <Link href="/events" className="btn-secondary" style={{ fontSize: "12px", padding: "6px 12px" }}>
                Discover More Events
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CONFIRMED EVENT PASSES ROSTER
            ========================================================================= */}
        <section>
          <h2 className="font-headline-md" style={{ color: "var(--indigo-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--indigo-dye)" }}>
              local_activity
            </span>
            <span>Your Event Passes ({passes.length})</span>
          </h2>

          {loading && (
            <div className="card-surface" style={{ padding: "36px", textAlign: "center" }}>
              <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
                Loading event passes...
              </p>
            </div>
          )}

          {error && (
            <div className="card-surface" style={{ padding: "18px", borderLeft: "4px solid var(--error-crimson)" }} role="alert">
              <p className="font-body-sm" style={{ color: "var(--error-crimson)", margin: 0 }}>
                ⚠ {error}
              </p>
            </div>
          )}

          {!loading && !error && passes.length === 0 && (
            <div className="card-surface" style={{ padding: "48px 24px", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--sandstone-muted)", marginBottom: "8px" }}>
                confirmation_number
              </span>
              <p className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                No active event passes found.
              </p>
              <p className="font-body-sm" style={{ color: "var(--sandstone-muted)", marginTop: "4px" }}>
                Browse Utsav Campus Life to reserve admission passes for upcoming festivals and hackathons.
              </p>
              <div style={{ marginTop: "16px" }}>
                <Link href="/events" className="btn-primary" style={{ fontSize: "13px" }}>
                  Browse Campus Events
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && passes.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {passes.map((pass) => {
                const ev = pass.eventId;
                if (!ev) return null;
                return (
                  <article
                    key={pass._id}
                    className="card-surface"
                    style={{
                      padding: "22px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px",
                      borderLeft: "4px solid var(--sage-success)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span className="font-label-sm" style={{ color: "var(--sage-success)", fontWeight: 700, letterSpacing: "0.04em" }}>
                          ✓ CONFIRMED PASS
                        </span>
                        <span className="font-label-sm" style={{ backgroundColor: "var(--surface-high)", padding: "3px 8px", borderRadius: "4px", color: "var(--indigo-primary)", fontWeight: 700 }}>
                          {pass.ticketNumber}
                        </span>
                      </div>

                      <h3 className="font-headline-sm" style={{ margin: "4px 0 6px 0" }}>
                        <Link href={`/events/${ev._id}`} style={{ color: "var(--indigo-primary)", textDecoration: "none" }}>
                          {ev.title}
                        </Link>
                      </h3>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--sandstone-text)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--terracotta)" }}>
                            event
                          </span>
                          <span className="font-body-sm">
                            {new Date(ev.eventDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--sandstone-text)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--indigo-dye)" }}>
                            location_on
                          </span>
                          <span className="font-body-sm">{ev.location}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Link href={`/events/${ev._id}`} className="btn-ghost" style={{ padding: "4px 8px", fontSize: "12px" }}>
                        Event Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => cancelPass(ev._id)}
                        className="btn-ghost"
                        style={{ color: "var(--error-crimson)", fontSize: "12px", padding: "4px 8px" }}
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
