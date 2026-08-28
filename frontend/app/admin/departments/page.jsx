"use client";

import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../../components/AdminLayout";
import DataTable from "../../../components/DataTable";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]); const [name, setName] = useState(""); const [editing, setEditing] = useState(null); const [state, setState] = useState({ loading: true, error: "", success: "" });
  async function load() { try { const body = await adminFetch("/api/admin/departments"); setDepartments(body.departments || []); setState({ loading: false, error: "", success: "" }); } catch (error) { setState({ loading: false, error: error.message, success: "" }); } }
  useEffect(() => { load(); }, []);
  async function save(event) { event.preventDefault(); try { await adminFetch(editing ? `/api/admin/departments/${editing._id}` : "/api/admin/departments", { method: editing ? "PATCH" : "POST", body: JSON.stringify({ name }) }); setName(""); setEditing(null); setState({ loading: false, error: "", success: editing ? "Department updated." : "Department created." }); await load(); } catch (error) { setState({ loading: false, error: error.message, success: "" }); } }
  return <AdminLayout title="Department management"><form onSubmit={save}><input required minLength="2" maxLength="200" placeholder="Department name" value={name} onChange={(event) => setName(event.target.value)} /><button type="submit">{editing ? "Update department" : "Create department"}</button></form>{state.loading && <p>Loading departments...</p>}{state.error && <p role="alert">{state.error}</p>}{state.success && <p role="status">{state.success}</p>}{!state.loading && !state.error && <DataTable rows={departments} columns={[{ key: "name", label: "Name" }, { key: "actions", label: "Actions", render: (department) => <button type="button" onClick={() => { setEditing(department); setName(department.name); }}>Edit</button> }]} empty="No departments yet." />}</AdminLayout>;
}
