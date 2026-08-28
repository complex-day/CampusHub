"use client";

import { useState } from "react";

export default function CreateAnnouncementForm({ collegeId, departments = [], onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", departmentId: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, collegeId, departmentId: form.departmentId || null })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to publish announcement");
      setForm({ title: "", description: "", departmentId: "" });
      onCreated(body.announcement);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="announcement-form">
      <h2>Publish announcement</h2>
      <input required maxLength={200} value={form.title} placeholder="Title" onChange={(event) => setForm({ ...form, title: event.target.value })} />
      <textarea required maxLength={10000} value={form.description} placeholder="Description" onChange={(event) => setForm({ ...form, description: event.target.value })} />
      <select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })}>
        <option value="">College-wide</option>
        {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
      </select>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={saving}>{saving ? "Publishing..." : "Publish"}</button>
    </form>
  );
}