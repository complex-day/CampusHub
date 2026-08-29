"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../components/AdminLayout";

export default function AdminDashboardPage() {
  const [state, setState] = useState({ loading: true, error: "", metrics: null });

  useEffect(() => {
    adminFetch("/api/admin/metrics")
      .then((body) => setState({ loading: false, error: "", metrics: body.metrics }))
      .catch((error) => setState({ loading: false, error: error.message, metrics: null }));
  }, []);

  const metricLabels = {
    totalUsers: { label: "Registered Campus Members", icon: "groups", color: "var(--indigo-dye)", growth: "+12% this sem" },
    totalAnnouncements: { label: "Verified Circulars", icon: "campaign", color: "var(--terracotta)", growth: "Active in feed" },
    totalEvents: { label: "Campus Gatherings", icon: "celebration", color: "var(--ochre-warning)", growth: "Scheduled" },
    totalColleges: { label: "Active Institutions", icon: "apartment", color: "var(--sage-success)", growth: "Isolated tenants" },
    totalDepartments: { label: "Academic Departments", icon: "account_tree", color: "var(--indigo-primary)", growth: "Configured" },
  };

  return (
    <AdminLayout title="Governance & Metrics Sanctuary">
      <section aria-label="Campus metrics">
        {state.loading && (
          <div className="card-surface" style={{ padding: "36px", textAlign: "center" }}>
            <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
              Fetching campus telemetries...
            </p>
          </div>
        )}

        {state.error && (
          <div className="card-surface" style={{ padding: "20px", borderLeft: "4px solid var(--error-crimson)" }} role="alert">
            <p className="font-body-md" style={{ color: "var(--error-crimson)", margin: 0 }}>
              ⚠ {state.error}
            </p>
          </div>
        )}

        {state.metrics && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* KPI Metric Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              {Object.entries(state.metrics).map(([key, value]) => {
                const meta = metricLabels[key] || {
                  label: key,
                  icon: "analytics",
                  color: "var(--indigo-dye)",
                  growth: "Recorded",
                };
                return (
                  <article
                    key={key}
                    className="card-surface"
                    style={{
                      padding: "22px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span className="font-label-sm" style={{ color: "var(--sandstone-text)", textTransform: "uppercase" }}>
                        {meta.label}
                      </span>
                      <span className="material-symbols-outlined" style={{ color: meta.color, fontSize: "24px" }}>
                        {meta.icon}
                      </span>
                    </div>

                    <div>
                      <strong className="font-display" style={{ color: "var(--indigo-primary)", fontSize: "36px", display: "block", lineHeight: 1 }}>
                        {value}
                      </strong>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                      <span className="font-label-sm" style={{ color: "var(--sage-success)", fontWeight: 600 }}>
                        {meta.growth}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Quick Governance Links */}
            <div
              className="card-surface"
              style={{
                padding: "24px",
                backgroundColor: "var(--surface-high)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h2 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: "0 0 16px 0" }}>
                Governance Quick Actions
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <Link
                  href="/admin/users"
                  className="card-surface"
                  style={{
                    padding: "16px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "var(--indigo-dye)", fontSize: "24px" }}>
                    manage_accounts
                  </span>
                  <div>
                    <strong className="font-body-md" style={{ color: "var(--indigo-primary)", display: "block" }}>
                      User Roles
                    </strong>
                    <span className="font-body-sm" style={{ color: "var(--sandstone-muted)" }}>
                      Elevate student / faculty permissions
                    </span>
                  </div>
                </Link>

                <Link
                  href="/admin/announcements"
                  className="card-surface"
                  style={{
                    padding: "16px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "var(--terracotta)", fontSize: "24px" }}>
                    feed
                  </span>
                  <div>
                    <strong className="font-body-md" style={{ color: "var(--indigo-primary)", display: "block" }}>
                      Notices Vault
                    </strong>
                    <span className="font-body-sm" style={{ color: "var(--sandstone-muted)" }}>
                      Audit and review circulars
                    </span>
                  </div>
                </Link>

                <Link
                  href="/admin/events"
                  className="card-surface"
                  style={{
                    padding: "16px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "var(--ochre-warning)", fontSize: "24px" }}>
                    event_seat
                  </span>
                  <div>
                    <strong className="font-body-md" style={{ color: "var(--indigo-primary)", display: "block" }}>
                      Events Moderator
                    </strong>
                    <span className="font-body-sm" style={{ color: "var(--sandstone-muted)" }}>
                      Approve and monitor gatherings
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
