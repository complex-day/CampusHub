"use client";

import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../../components/AdminLayout";
import DataTable from "../../../components/DataTable";

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [state, setState] = useState({ loading: true, error: "", success: "" });

  async function load() {
    try {
      const body = await adminFetch("/api/admin/colleges");
      const records = body.colleges || [];
      setColleges(records);
      if (records[0]) setForm({ name: records[0].name, description: records[0].description });
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
      const existing = colleges[0];
      await adminFetch(existing ? `/api/admin/colleges/${existing._id}` : "/api/admin/colleges", {
        method: existing ? "PATCH" : "POST",
        body: JSON.stringify(form),
      });
      setForm({ name: "", description: "" });
      setState({ loading: false, error: "", success: existing ? "College profile updated." : "College sanctuary registered." });
      await load();
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  }

  return (
    <AdminLayout title="Institutional Profile">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Form Card */}
        <form
          onSubmit={save}
          className="card-surface"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            borderLeft: "4px solid var(--indigo-dye)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--indigo-dye)" }}>
              apartment
            </span>
            <h2 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
              {colleges.length ? "Update Institution Details" : "Register Institution Profile"}
            </h2>
          </div>

          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Institution Name
            </label>
            <input
              required
              minLength={2}
              maxLength={200}
              placeholder="e.g. Apex Institute of Technology"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              style={{ fontFamily: "var(--font-serif)", fontSize: "16px", fontWeight: 600 }}
            />
          </div>

          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Charter / Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe campus vision, affiliations, and institutional mandates..."
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                save
              </span>
              <span>{colleges.length ? "Update Profile" : "Register Institution"}</span>
            </button>
          </div>
        </form>

        {state.loading && (
          <div className="card-surface" style={{ padding: "32px", textAlign: "center" }}>
            <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
              Loading institution profile...
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
            rows={colleges}
            columns={[
              { key: "name", label: "Institution" },
              { key: "description", label: "Charter / Description" },
              {
                key: "createdAt",
                label: "Established",
                render: (c) => new Date(c.createdAt).toLocaleDateString(),
              },
            ]}
            empty="No institution assigned to this administrator."
          />
        )}
      </div>
    </AdminLayout>
  );
}
