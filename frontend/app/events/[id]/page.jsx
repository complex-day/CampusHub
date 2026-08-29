"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import ToriiNav from "../../../components/ToriiNav";

export default function EventDetailsPage({ params }) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const id = resolvedParams?.id;

  const [event, setEvent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  async function load() {
    if (!id) return;
    try {
      const [response, departmentsResponse, meResponse] = await Promise.all([
        fetch(`/api/events/${id}`, { credentials: "include" }),
        fetch("/api/departments", { credentials: "include" }),
        fetch("/api/me", { credentials: "include" }),
      ]);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to load event");
      setEvent(body.event);
      if (departmentsResponse.ok) setDepartments((await departmentsResponse.json()).departments || []);
      if (meResponse.ok) setAuth((await meResponse.json()).auth || null);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function toggleRsvp() {
    if (!event) return;
    setRsvpLoading(true);
    setRsvpError("");
    try {
      if (event.userRsvpd) {
        // Cancel RSVP
        const response = await fetch(`/api/events/${id}/rsvp`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error || "Unable to cancel RSVP");
        }
        await load();
      } else {
        // Confirm RSVP
        const response = await fetch(`/api/events/${id}/rsvp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error || "Unable to confirm RSVP");
        }
        await load();
      }
    } catch (err) {
      setRsvpError(err.message);
    } finally {
      setRsvpLoading(false);
    }
  }

  const department = departments.find((d) => d._id === event?.departmentId);
  const hasCapacity = typeof event?.capacity === "number" && event.capacity > 0;
  const isFull = hasCapacity && event?.attendeeCount >= event.capacity && !event?.userRsvpd;

  return (
    <div className="app-shell">
      <ToriiNav auth={auth} activeSection="events" />

      <main className="main-content main-content-with-sidebar">
        <div style={{ marginBottom: "20px" }}>
          <Link href="/events" className="btn-ghost" style={{ padding: "6px 12px", fontSize: "13px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              arrow_back
            </span>
            <span>Back to Campus Life</span>
          </Link>
        </div>

        {loading && (
          <div className="card-surface" style={{ padding: "40px", textAlign: "center" }}>
            <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
              Loading event details...
            </p>
          </div>
        )}

        {error && (
          <div className="card-surface" style={{ padding: "24px", borderLeft: "4px solid var(--error-crimson)" }} role="alert">
            <p className="font-body-md" style={{ color: "var(--error-crimson)" }}>
              ⚠ {error}
            </p>
          </div>
        )}

        {!loading && !error && event && (
          <article
            className="card-surface"
            style={{
              padding: "36px",
              maxWidth: "920px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <span
                className="font-label-sm"
                style={{
                  padding: "4px 12px",
                  borderRadius: "4px",
                  backgroundColor: event.departmentId ? "rgba(61, 78, 107, 0.12)" : "rgba(214, 154, 45, 0.15)",
                  color: event.departmentId ? "var(--indigo-dye)" : "var(--ochre-warning)",
                  fontWeight: 600,
                }}
              >
                {event.departmentId ? `Department • ${department?.name || event.departmentId}` : "Campus-Wide Festival"}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={toggleRsvp}
                  disabled={rsvpLoading || (isFull && !event.userRsvpd)}
                  className="btn-primary"
                  style={{
                    backgroundColor: event.userRsvpd ? "var(--sage-success)" : isFull ? "var(--sandstone-muted)" : "var(--indigo-dye)",
                    borderColor: event.userRsvpd ? "var(--sage-success)" : isFull ? "var(--sandstone-muted)" : "var(--indigo-primary)",
                    cursor: isFull && !event.userRsvpd ? "not-allowed" : "pointer",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    {event.userRsvpd ? "check_circle" : isFull ? "block" : "confirmation_number"}
                  </span>
                  <span>
                    {rsvpLoading ? "Updating..." : event.userRsvpd ? "Pass Confirmed (Cancel)" : isFull ? "Capacity Full" : "RSVP Pass for Event"}
                  </span>
                </button>
              </div>
            </div>

            {rsvpError && (
              <p className="font-body-sm" style={{ color: "var(--error-crimson)", margin: 0 }} role="alert">
                ⚠ {rsvpError}
              </p>
            )}

            {event.userRsvpd && event.ticketNumber && (
              <div
                style={{
                  backgroundColor: "rgba(107, 138, 99, 0.12)",
                  border: "1px solid var(--sage-success)",
                  borderRadius: "8px",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--sage-success)", fontSize: "28px" }}>
                    verified
                  </span>
                  <div>
                    <span className="font-label-sm" style={{ color: "var(--sage-success)", fontWeight: 700, display: "block" }}>
                      YOUR ADMISSION PASS IS ACTIVE
                    </span>
                    <strong className="font-body-md" style={{ color: "var(--indigo-primary)" }}>
                      Ticket #{event.ticketNumber}
                    </strong>
                  </div>
                </div>
                <Link href="/passes" className="btn-secondary" style={{ fontSize: "12px", padding: "6px 12px" }}>
                  View in Passbook
                </Link>
              </div>
            )}

            <h1 className="font-display" style={{ color: "var(--indigo-primary)", margin: 0, fontSize: "36px", lineHeight: "44px" }}>
              {event.title}
            </h1>

            {/* Key Event Metadata Row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", padding: "16px", backgroundColor: "var(--surface-high)", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--terracotta)", fontSize: "20px" }}>
                  calendar_today
                </span>
                <div>
                  <span className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block" }}>Date & Time</span>
                  <span className="font-body-sm" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {new Date(event.eventDate).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--indigo-dye)", fontSize: "20px" }}>
                  location_on
                </span>
                <div>
                  <span className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block" }}>Auditorium / Venue</span>
                  <span className="font-body-sm" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {event.location}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--sage-success)", fontSize: "20px" }}>
                  groups
                </span>
                <div>
                  <span className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block" }}>Participation</span>
                  <span className="font-body-sm" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {event.attendeeCount || 0}
                    {hasCapacity ? ` / ${event.capacity} registered` : " registered"}
                  </span>
                </div>
              </div>
            </div>

            {event.posterUrl && (
              <div
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  maxHeight: "520px",
                  backgroundColor: "var(--surface-high)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={event.posterUrl}
                  alt={`${event.title} poster`}
                  style={{ width: "100%", height: "auto", maxHeight: "520px", objectFit: "contain" }}
                />
              </div>
            )}

            <div>
              <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: "0 0 8px 0" }}>
                About this Gathering
              </h3>
              <p
                className="font-body-lg"
                style={{
                  color: "var(--text-primary)",
                  whiteSpace: "pre-line",
                  lineHeight: 1.7,
                }}
              >
                {event.description}
              </p>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
