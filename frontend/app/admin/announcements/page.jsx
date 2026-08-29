"use client";

import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../../components/AdminLayout";
import DataTable from "../../../components/DataTable";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "", success: "" });

  async function load() {
    try {
      const body = await adminFetch("/api/admin/announcements?limit=20");
      setItems(body.announcements || []);
      setState({ loading: false, error: "", success: "" });
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!confirm("Are you sure you want to delete this institutional announcement?")) return;
    try {
      await adminFetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      setState({ loading: false, error: "", success: "Announcement removed from campus feed." });
      await load();
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  }

  return (
    <AdminLayout title="Announcement Moderation Vault">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {state.loading && (
          <div className="card-surface" style={{ padding: "32px", textAlign: "center" }}>
            <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
              Loading announcements for moderation...
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
            rows={items}
            columns={[
              {
                key: "title",
                label: "Notice Title",
                render: (item) => (
                  <div>
                    <strong className="font-body-md" style={{ color: "var(--indigo-primary)", display: "block" }}>
                      {item.title}
                    </strong>
                    <span className="font-label-sm" style={{ color: "var(--sandstone-muted)" }}>
                      {item.departmentId ? "Department Notice" : "College-Wide Notice"}
                    </span>
                  </div>
                ),
              },
              {
                key: "createdAt",
                label: "Published Date",
                render: (item) => new Date(item.createdAt).toLocaleDateString(),
              },
              {
                key: "actions",
                label: "Moderation Action",
                render: (item) => (
                  <button
                    type="button"
                    onClick={() => remove(item._id)}
                    className="btn-ghost"
                    style={{ color: "var(--error-crimson)", padding: "4px 8px", fontSize: "12px" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                      delete
                    </span>
                    <span>Remove</span>
                  </button>
                ),
              },
            ]}
            empty="No announcements to moderate."
          />
        )}
      </div>
    </AdminLayout>
  );
}
