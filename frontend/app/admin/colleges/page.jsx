"use client";

import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../../components/AdminLayout";
import DataTable from "../../../components/DataTable";

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState([]); const [form, setForm] = useState({ name: "", description: "" }); const [state, setState] = useState({ loading: true, error: "", success: "" });
  async function load() { try { const body = await adminFetch("/api/admin/colleges"); const records = body.colleges || []; setColleges(records); if (records[0]) setForm({ name: records[0].name, description: records[0].description }); setState({ loading: false, error: "", success: "" }); } catch (error) { setState({ loading: false, error: error.message, success: "" }); } }
  useEffect(() => { load(); }, []);
  async function save(event) { event.preventDefault(); try { const existing = colleges[0]; await adminFetch(existing ? `/api/admin/colleges/${existing._id}` : "/api/admin/colleges", { method: existing ? "PATCH" : "POST", body: JSON.stringify(form) }); setForm({ name: "", description: "" }); setState({ loading: false, error: "", success: existing ? "College updated." : "College created." }); await load(); } catch (error) { setState({ loading: false, error: error.message, success: "" }); } }
  return <AdminLayout title="College management"><form onSubmit={save}><input required minLength="2" maxLength="200" placeholder="College name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><textarea required placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><button type="submit">{colleges.length ? "Update college" : "Create college"}</button></form>{state.loading && <p>Loading college...</p>}{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}{!state.loading && !state.error && <DataTable rows={colleges} columns={[{ key: "name", label: "Name" }, { key: "description", label: "Description" }, { key: "createdAt", label: "Created" }]} empty="No college is assigned to this administrator." />}</AdminLayout>;
}
