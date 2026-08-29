"use client";

import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../../components/AdminLayout";
import DataTable from "../../../components/DataTable";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [filters, setFilters] = useState({ search: "", role: "", collegeId: "" });
  const [status, setStatus] = useState({ loading: true, error: "", success: "" });

  async function load() {
    setStatus({ loading: true, error: "", success: "" });
    try {
      const query = new URLSearchParams({
        limit: "20",
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.collegeId ? { collegeId: filters.collegeId } : {}),
      });
      const body = await adminFetch(`/api/admin/users?${query}`);
      setUsers(body.users || []);
      setStatus({ loading: false, error: "", success: "" });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  }

  useEffect(() => {
    adminFetch("/api/admin/colleges")
      .then((body) => setColleges(body.colleges || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, []);

  async function updateRole(id, role) {
    try {
      await adminFetch(`/api/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
      setStatus({ loading: false, error: "", success: "User role permissions updated." });
      await load();
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "" });
    }
  }

  return (
    <AdminLayout title="User & Role Governance">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Search & Filter Bar */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            load();
          }}
          className="card-surface"
          style={{
            padding: "18px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            alignItems: "end",
          }}
        >
          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Search Members
            </label>
            <input
              aria-label="Search name or email"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
          </div>

          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Filter by Role
            </label>
            <select
              aria-label="Role filter"
              value={filters.role}
              onChange={(event) => setFilters({ ...filters, role: event.target.value })}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Institution
            </label>
            <select
              aria-label="College filter"
              value={filters.collegeId}
              onChange={(event) => setFilters({ ...filters, collegeId: event.target.value })}
            >
              <option value="">All Institutions</option>
              {colleges.map((college) => (
                <option key={college._id} value={college._id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ height: "42px", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              search
            </span>
            <span>Filter Users</span>
          </button>
        </form>

        {status.loading && (
          <div className="card-surface" style={{ padding: "32px", textAlign: "center" }}>
            <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
              Loading user registry...
            </p>
          </div>
        )}

        {status.error && (
          <div className="card-surface" style={{ padding: "16px", borderLeft: "4px solid var(--error-crimson)" }} role="alert">
            <p className="font-body-sm" style={{ color: "var(--error-crimson)", margin: 0 }}>
              ⚠ {status.error}
            </p>
          </div>
        )}

        {status.success && (
          <div className="card-surface" style={{ padding: "16px", borderLeft: "4px solid var(--sage-success)" }} role="status">
            <p className="font-body-sm" style={{ color: "var(--sage-success)", margin: 0 }}>
              ✓ {status.success}
            </p>
          </div>
        )}

        {!status.loading && !status.error && (
          <DataTable
            rows={users}
            columns={[
              { key: "name", label: "Full Name" },
              { key: "email", label: "Email Address" },
              {
                key: "role",
                label: "Access Tier / Role",
                render: (user) => (
                  <select
                    value={user.role}
                    aria-label={`Role for ${user.email}`}
                    onChange={(event) => updateRole(user._id, event.target.value)}
                    style={{
                      padding: "6px 10px",
                      fontSize: "13px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--surface-high)",
                      color: "var(--indigo-primary)",
                      fontWeight: 600,
                    }}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                ),
              },
            ]}
            empty="No users match the selected query."
          />
        )}
      </div>
    </AdminLayout>
  );
}
