"use client";

import { useState } from "react";
import PosterUpload from "./PosterUpload";

export default function CreateAnnouncementForm({ collegeId, departments = [], onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", departmentId: "", posterUrl: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          collegeId,
          departmentId: form.departmentId || null,
          posterUrl: form.posterUrl || null,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to publish announcement");
      setForm({ title: "", description: "", departmentId: "", posterUrl: "" });
      setExpanded(false);
      onCreated(body.announcement);
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
        marginBottom: "28px",
        borderLeft: "4px solid var(--terracotta)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: expanded ? "16px" : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--terracotta)", fontSize: "22px" }}>
            edit_note
          </span>
          <h2 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
            Announcement Studio
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="btn-ghost"
          style={{ fontSize: "12px" }}
        >
          {expanded ? "Collapse Studio" : "Draft New Notice"}
        </button>
      </div>

      {expanded && (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Notice Title (max 200 characters)
            </label>
            <input
              required
              maxLength={200}
              value={form.title}
              placeholder="e.g. Schedule for Midterm Examination — Spring 2026"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ fontFamily: "var(--font-serif)", fontSize: "16px", fontWeight: 600 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            <div>
              <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
                Target Cohort / Department
              </label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                <option value="">Institution-Wide (All Cohorts)</option>
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
              Official Circular Body
            </label>
            <textarea
              required
              maxLength={10000}
              rows={4}
              value={form.description}
              placeholder="Write the full notice text, guidelines, instructions, and dates..."
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
                publish
              </span>
              <span>{saving ? "Publishing Circular..." : "Publish Announcement"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}