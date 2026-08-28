"use client";

import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../../components/AdminLayout";
import DataTable from "../../../components/DataTable";

export default function AdminEventsPage() {
  const [items, setItems] = useState([]); const [state, setState] = useState({ loading: true, error: "", success: "" });
  async function load() { try { const body = await adminFetch("/api/admin/events?limit=10"); setItems(body.events || []); setState({ loading: false, error: "", success: "" }); } catch (error) { setState({ loading: false, error: error.message, success: "" }); } }
  useEffect(() => { load(); }, []);
  async function remove(id) { try { await adminFetch(`/api/admin/events/${id}`, { method: "DELETE" }); setState({ loading: false, error: "", success: "Event deleted." }); await load(); } catch (error) { setState({ loading: false, error: error.message, success: "" }); } }
  return <AdminLayout title="Event moderation">{state.loading && <p>Loading events...</p>}{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}{!state.loading && !state.error && <DataTable rows={items} columns={[{ key: "title", label: "Title" }, { key: "eventDate", label: "Date" }, { key: "location", label: "Location" }, { key: "actions", label: "Actions", render: (item) => <button type="button" onClick={() => remove(item._id)}>Delete</button> }]} empty="No events to moderate." />}</AdminLayout>;
}
