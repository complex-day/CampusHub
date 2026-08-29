"use client";

import { useState } from "react";
import PosterUpload from "./PosterUpload";

export default function CreateEventForm({ collegeId, departments = [], onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    departmentId: "",
    capacity: "",
    posterUrl: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const parsedCapacity = form.capacity ? parseInt(form.capacity, 10) : null;
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          collegeId,
          departmentId: form.departmentId || null,
          capacity: parsedCapacity && parsedCapacity > 0 ? parsedCapacity : null,
          posterUrl: form.posterUrl || null,
          eventDate: new Date(form.eventDate).toISOString(),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to create event");
      setForm({ title: "", description: "", eventDate: "", location: "", departmentId: "", capacity: "", posterUrl: "" });
      setExpanded(false);
      onCreated(body.event);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="card-surface"
      style={{
        padding: "24px",
        marginBottom: "32px",
        borderLeft: "4px solid var(--ochre-warning)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: expanded ? "16px" : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--ochre-warning)", fontSize: "24px" }}>
            add_circle
          </span>
          <div>
            <h2 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
              Utsav Event Studio
            </h2>
            <span className="font-label-sm" style={{ color: "var(--sandstone-text)" }}>
              Publish Campus Festivals, Hackathons & Guest Lectures
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="btn-ghost"
          style={{ fontSize: "12px" }}
        >
          {expanded ? "Collapse Studio" : "Host New Event"}
        </button>
      </div>

      {expanded && (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Event Title (max 200 characters)
            </label>
            <input
              required
              maxLength={200}
              value={form.title}
              placeholder="e.g. Annual Tech Symposium & Hackathon '26"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ fontFamily: "var(--font-serif)", fontSize: "16px", fontWeight: 600 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
                Date & Time
              </label>
              <input
                required
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              />
            </div>

            <div>
              <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
                Auditorium / Campus Venue
              </label>
              <input
                required
                maxLength={500}
                value={form.location}
                placeholder="e.g. Main Auditorium, Block A"
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
                Capacity (Optional)
              </label>
              <input
                type="number"
                min={1}
                max={100000}
                value={form.capacity}
                placeholder="e.g. 250 seats"
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>

            <div>
              <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
                Host Department / Society
              </label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                <option value="">Campus-Wide Celebration</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Event Highlights & Agenda
            </label>
            <textarea
              required
              maxLength={10000}
              rows={3}
              value={form.description}
              placeholder="Describe event schedule, keynote speakers, prize pools, and participation guidelines..."
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <PosterUpload disabled={saving} onUploaded={(posterUrl) => setForm({ ...form, posterUrl })} />

          {error && (
            <p className="font-body-sm" style={{ color: "var(--error-crimson)" }} role="alert">
              ⚠ {error}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="btn-ghost"
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                celebration
              </span>
              <span>{saving ? "Publishing Event..." : "Launch Event on Utsav"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
