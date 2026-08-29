"use client";

import Link from "next/link";
import { useState } from "react";

export default function EventCard({ event, departments = [] }) {
  const department = departments.find((item) => item._id === event.departmentId);
  const [rsvpd, setRsvpd] = useState(Boolean(event.userRsvpd));
  const [attendeeCount, setAttendeeCount] = useState(event.attendeeCount || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const eventDateObj = new Date(event.eventDate);
  const month = eventDateObj.toLocaleDateString("en-US", { month: "short" });
  const day = eventDateObj.getDate();
  const time = eventDateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const hasCapacity = typeof event.capacity === "number" && event.capacity > 0;
  const isFull = hasCapacity && attendeeCount >= event.capacity && !rsvpd;

  async function toggleRsvp() {
    setLoading(true);
    setError("");
    try {
      if (rsvpd) {
        // Cancel RSVP
        const response = await fetch(`/api/events/${event._id}/rsvp`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error || "Unable to cancel RSVP");
        }
        setRsvpd(false);
        setAttendeeCount((prev) => Math.max(0, prev - 1));
      } else {
        // Reserve RSVP
        const response = await fetch(`/api/events/${event._id}/rsvp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error || "Unable to reserve RSVP");
        }
        setRsvpd(true);
        setAttendeeCount((prev) => prev + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article
      className="card-surface"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 250ms ease",
      }}
    >
      {/* Poster Media Header */}
      <div
        style={{
          position: "relative",
          height: "180px",
          backgroundColor: "var(--surface-high)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={`${event.title} poster`}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(61, 78, 107, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--indigo-dye)", opacity: 0.4 }}>
              celebration
            </span>
          </div>
        )}

        {/* Date Stamp Overlay */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: "var(--surface-lift)",
            borderRadius: "6px",
            padding: "4px 10px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(35, 33, 29, 0.15)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <span className="font-label-sm" style={{ color: "var(--terracotta)", fontWeight: 700, display: "block", textTransform: "uppercase" }}>
            {month}
          </span>
          <span className="font-headline-sm" style={{ color: "var(--indigo-primary)", fontWeight: 700, margin: 0, lineHeight: 1 }}>
            {day}
          </span>
        </div>

        {/* Capacity / Attendee Badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: isFull ? "var(--error-crimson)" : "rgba(38, 55, 83, 0.85)",
            color: "#FFFFFF",
            borderRadius: "14px",
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            backdropFilter: "blur(4px)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
            groups
          </span>
          <span>
            {attendeeCount}
            {hasCapacity ? ` / ${event.capacity}` : " Attending"}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1, gap: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            className="font-label-sm"
            style={{
              color: event.departmentId ? "var(--indigo-dye)" : "var(--ochre-warning)",
              fontWeight: 600,
            }}
          >
            {event.departmentId ? `Dept • ${department?.name || event.departmentId}` : "Campus-Wide"}
          </span>
          <span className="font-body-sm" style={{ color: "var(--sandstone-text)" }}>
            {time}
          </span>
        </div>

        <h3 className="font-headline-sm" style={{ margin: "4px 0 0 0", lineHeight: 1.3 }}>
          <Link
            href={`/events/${event._id}`}
            style={{ color: "var(--indigo-primary)", textDecoration: "none" }}
          >
            {event.title}
          </Link>
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--sandstone-text)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--terracotta)" }}>
            location_on
          </span>
          <span className="font-body-sm">{event.location}</span>
        </div>

        <p
          className="font-body-sm"
          style={{
            color: "var(--sandstone-text)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: "4px 0",
            lineHeight: 1.5,
          }}
        >
          {event.description}
        </p>

        {error && (
          <p className="font-label-sm" style={{ color: "var(--error-crimson)", margin: 0 }} role="alert">
            ⚠ {error}
          </p>
        )}

        {/* Footer Action */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "12px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href={`/events/${event._id}`}
            className="btn-ghost"
            style={{ padding: "4px 8px", fontSize: "12px" }}
          >
            View Details
          </Link>

          <button
            type="button"
            onClick={toggleRsvp}
            disabled={loading || (isFull && !rsvpd)}
            className={rsvpd ? "btn-secondary" : "btn-primary"}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              backgroundColor: rsvpd ? "var(--sage-success)" : isFull ? "var(--sandstone-muted)" : "var(--indigo-dye)",
              borderColor: rsvpd ? "var(--sage-success)" : isFull ? "var(--sandstone-muted)" : "var(--indigo-primary)",
              color: "#FFFFFF",
              cursor: isFull && !rsvpd ? "not-allowed" : "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              {rsvpd ? "check_circle" : isFull ? "block" : "confirmation_number"}
            </span>
            <span>
              {loading ? "Updating..." : rsvpd ? "Pass Confirmed" : isFull ? "Event Full" : "RSVP Pass"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
