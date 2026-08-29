"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ToriiNav from "./ToriiNav";

export default function AdminLayout({ title, children }) {
  const pathname = usePathname();
  const [state, setState] = useState({ loading: true, error: "", auth: null });

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error("Please sign in to continue.");
        if (response.status === 403 || body.auth?.role !== "admin") throw new Error("Administrator access is required.");
        if (!response.ok) throw new Error(body.error || "Unable to verify access.");
        setState({ loading: false, error: "", auth: body.auth });
      })
      .catch((error) => setState({ loading: false, error: error.message, auth: null }));
  }, []);

  const adminTabs = [
    { label: "Overview Metrics", href: "/admin", matchExact: true },
    { label: "User Governance", href: "/admin/users" },
    { label: "Colleges", href: "/admin/colleges" },
    { label: "Departments", href: "/admin/departments" },
    { label: "Announcements", href: "/admin/announcements" },
    { label: "Events Moderation", href: "/admin/events" },
  ];

  const isTabActive = (tab) => {
    if (tab.matchExact) return pathname === tab.href;
    return pathname.startsWith(tab.href);
  };

  return (
    <div className="app-shell">
      <ToriiNav auth={state.auth} activeSection="admin" />

      <main className="main-content main-content-with-sidebar">
        {/* =========================================================================
            ADMIN SANCTUARY HEADER & TENANT BADGE
            ========================================================================= */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--indigo-dye)", fontSize: "20px" }}>
                  admin_panel_settings
                </span>
                <span className="font-label-sm" style={{ color: "var(--sandstone-text)", letterSpacing: "0.06em" }}>
                  Institutional Governance
                </span>
              </div>
              <h1 className="font-display" style={{ color: "var(--indigo-primary)", margin: 0, fontSize: "36px" }}>
                {title}
              </h1>
            </div>

            {/* Tenant Status Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "20px",
                backgroundColor: "var(--surface-high)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--sage-success)" }}></span>
              <span className="font-label-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {state.auth?.collegeId ? `Tenant Boundary Active (${state.auth.collegeId})` : "Apex Institute #892"}
              </span>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "12px",
            }}
            aria-label="Admin Navigation Tabs"
          >
            {adminTabs.map((tab) => {
              const active = isTabActive(tab);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="btn-ghost"
                  style={{
                    padding: "6px 14px",
                    fontSize: "13px",
                    backgroundColor: active ? "var(--indigo-dye)" : "transparent",
                    color: active ? "#FFFFFF" : "var(--sandstone-text)",
                    border: active ? "1px solid var(--indigo-primary)" : "1px solid transparent",
                    borderRadius: "4px",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content Body */}
        {state.loading && (
          <div className="card-surface" style={{ padding: "48px", textAlign: "center" }}>
            <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
              Loading administrator sanctuary...
            </p>
          </div>
        )}

        {state.error && (
          <div className="card-surface" style={{ padding: "24px", borderLeft: "4px solid var(--error-crimson)" }} role="alert">
            <p className="font-body-md" style={{ color: "var(--error-crimson)", margin: 0 }}>
              ⚠ {state.error}
            </p>
          </div>
        )}

        {!state.loading && !state.error && children}
      </main>
    </div>
  );
}

export async function adminFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) throw new Error("Your session has expired. Please sign in again.");
  if (response.status === 403) throw new Error("Administrator access is required.");
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
}
