"use client";

import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../../components/AdminLayout";
import DataTable from "../../../components/DataTable";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [state, setState] = useState({ loading: true, error: "", success: "" });

  async function load() {
    try {
      const body = await adminFetch("/api/admin/departments");
      setDepartments(body.departments || []);
      setState({ loading: false, error: "", success: "" });
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(event) {
    event.preventDefault();
    try {
      await adminFetch(editing ? `/api/admin/departments/${editing._id}` : "/api/admin/departments", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({ name }),
      });
      setName("");
      setEditing(null);
      setState({ loading: false, error: "", success: editing ? "Department updated." : "Department registered." });
      await load();
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  }

  return (
    <AdminLayout title="Academic Departments">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <form
          onSubmit={save}
          className="card-surface"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            borderLeft: "4px solid var(--terracotta)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--terracotta)" }}>
              account_tree
            </span>
            <h2 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
              {editing ? `Edit Department: ${editing.name}` : "Add New Academic Department"}
            </h2>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              required
              minLength={2}
              maxLength={200}
              placeholder="e.g. Department of Computer Science & Engineering"
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{ flex: 1, minWidth: "260px" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setName("");
                  }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              )}
              <button type="submit" className="btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  {editing ? "done" : "add"}
                </span>
                <span>{editing ? "Update Department" : "Create Department"}</span>
              </button>
            </div>
          </div>
        </form>

        {state.loading && (
          <div className="card-surface" style={{ padding: "32px", textAlign: "center" }}>
            <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
              Loading departments...
            </p>
          </div>
        )}

        {state.error && (
          <div className="card-surface" style={{ padding: "16px", borderLeft: "4px solid var(--error-crimson)" }} role="alert">
            <p className="font-body-sm" style={{ color: "var(--error-crimson)", margin: 0 }}>
              ⚠ {state.error}
            </p>
          </div>
        )}

        {state.success && (
          <div className="card-surface" style={{ padding: "16px", borderLeft: "4px solid var(--sage-success)" }} role="status">
            <p className="font-body-sm" style={{ color: "var(--sage-success)", margin: 0 }}>
              ✓ {state.success}
            </p>
          </div>
        )}

        {!state.loading && !state.error && (
          <DataTable
            rows={departments}
            columns={[
              { key: "name", label: "Department Name" },
              {
                key: "actions",
                label: "Action",
                render: (department) => (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(department);
                      setName(department.name);
                    }}
                    className="btn-ghost"
                    style={{ padding: "4px 8px", fontSize: "12px", color: "var(--indigo-dye)" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      edit
                    </span>
                    <span>Edit Name</span>
                  </button>
                ),
              },
            ]}
            empty="No departments configured yet."
          />
        )}
      </div>
    </AdminLayout>
  );
}
