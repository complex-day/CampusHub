"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import ToriiNav from "../../../components/ToriiNav";

export default function AnnouncementDetailsPage({ params }) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const id = resolvedParams?.id;

  const [announcement, setAnnouncement] = useState(null);
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const [annResponse, meResponse] = await Promise.all([
          fetch(`/api/announcements/${id}`, { credentials: "include" }),
          fetch("/api/me", { credentials: "include" }),
        ]);
        const body = await annResponse.json();
        const me = meResponse.ok ? await meResponse.json() : {};
        if (!annResponse.ok) throw new Error(body.error || "Unable to load announcement");
        setAnnouncement(body.announcement);
        setAuth(me.auth || null);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className="app-shell">
      <ToriiNav auth={auth} activeSection="home" />

      <main className="main-content main-content-with-sidebar">
        <div style={{ marginBottom: "20px" }}>
          <Link href="/announcements" className="btn-ghost" style={{ padding: "6px 12px", fontSize: "13px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              arrow_back
            </span>
            <span>Back to Courtyard Feed</span>
          </Link>
        </div>

        {loading && (
          <div className="card-surface" style={{ padding: "40px", textAlign: "center" }}>
            <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
              Loading notice details...
            </p>
          </div>
        )}

        {error && (
          <div className="card-surface" style={{ padding: "24px", borderLeft: "4px solid var(--error-crimson)" }} role="alert">
            <p className="font-body-md" style={{ color: "var(--error-crimson)" }}>
              ⚠ {error}
            </p>
          </div>
        )}

        {!loading && !error && announcement && (
          <article
            className="card-surface"
            style={{
              padding: "36px",
              maxWidth: "860px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <span
                className="font-label-sm"
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  backgroundColor: announcement.departmentId ? "rgba(61, 78, 107, 0.12)" : "rgba(182, 92, 58, 0.12)",
                  color: announcement.departmentId ? "var(--indigo-dye)" : "var(--terracotta)",
                  fontWeight: 600,
                }}
              >
                {announcement.departmentId ? `Department: ${announcement.departmentId}` : "College-Wide Circular"}
              </span>
              <time
                dateTime={announcement.createdAt}
                className="font-body-sm"
                style={{ color: "var(--sandstone-text)" }}
              >
                {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </div>

            <h1 className="font-display" style={{ color: "var(--indigo-primary)", margin: 0, fontSize: "32px", lineHeight: "40px" }}>
              {announcement.title}
            </h1>

            {announcement.posterUrl && (
              <div
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  maxHeight: "480px",
                  backgroundColor: "var(--surface-high)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "8px 0",
                }}
              >
                <img
                  src={announcement.posterUrl}
                  alt={`${announcement.title} poster`}
                  style={{ width: "100%", height: "auto", maxHeight: "480px", objectFit: "contain" }}
                />
              </div>
            )}

            <p
              className="font-body-lg"
              style={{
                color: "var(--text-primary)",
                whiteSpace: "pre-line",
                lineHeight: 1.7,
              }}
            >
              {announcement.description}
            </p>

            <div
              style={{
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "12px",
              }}
            >
              <span className="font-label-sm" style={{ color: "var(--sandstone-muted)" }}>
                Author: {announcement.createdBy || "Academic Affairs"}
              </span>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}