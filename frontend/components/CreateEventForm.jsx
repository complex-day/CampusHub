"use client";

import { useState } from "react";
import PosterUpload from "./PosterUpload";

export default function CreateEventForm({ collegeId, departments = [], onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", eventDate: "", location: "", departmentId: "", posterUrl: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, collegeId, departmentId: form.departmentId || null, posterUrl: form.posterUrl || null, eventDate: new Date(form.eventDate).toISOString() })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to create event");
      setForm({ title: "", description: "", eventDate: "", location: "", departmentId: "", posterUrl: "" });
      onCreated(body.event);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="event-form">
      <h2>Create event</h2>
      <input required maxLength={200} value={form.title} placeholder="Title" onChange={(event) => setForm({ ...form, title: event.target.value })} />
      <textarea required maxLength={10000} value={form.description} placeholder="Description" onChange={(event) => setForm({ ...form, description: event.target.value })} />
      <input required type="datetime-local" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} />
      <input required maxLength={500} value={form.location} placeholder="Location" onChange={(event) => setForm({ ...form, location: event.target.value })} />
      <select value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })}>
        <option value="">College-wide</option>
        {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
      </select>
      <PosterUpload disabled={saving} onUploaded={(posterUrl) => setForm({ ...form, posterUrl })} />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={saving}>{saving ? "Creating..." : "Create event"}</button>
    </form>
  );
}
