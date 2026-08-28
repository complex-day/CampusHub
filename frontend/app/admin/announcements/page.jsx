"use client";

import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../../components/AdminLayout";
import DataTable from "../../../components/DataTable";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState([]); const [state, setState] = useState({ loading: true, error: "", success: "" });
  async function load() { try { const body = await adminFetch("/api/admin/announcements?limit=10"); setItems(body.announcements || []); setState({ loading: false, error: "", success: "" }); } catch (error) { setState({ loading: false, error: error.message, success: "" }); } }
  useEffect(() => { load(); }, []);
  async function remove(id) { try { await adminFetch(`/api/admin/announcements/${id}`, { method: "DELETE" }); setState({ loading: false, error: "", success: "Announcement deleted." }); await load(); } catch (error) { setState({ loading: false, error: error.message, success: "" }); } }
  return <AdminLayout title="Announcement moderation">{state.loading && <p>Loading announcements...</p>}{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}{!state.loading && !state.error && <DataTable rows={items} columns={[{ key: "title", label: "Title" }, { key: "createdAt", label: "Created" }, { key: "actions", label: "Actions", render: (item) => <button type="button" onClick={() => remove(item._id)}>Delete</button> }]} empty="No announcements to moderate." />}</AdminLayout>;
}
