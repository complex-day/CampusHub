"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminLayout({ title, children }) {
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

  if (state.loading) return <main><p>Loading administrator workspace...</p></main>;
  if (state.error) return <main><p role="alert">{state.error}</p></main>;

  return (
    <main className="admin-layout">
      <nav aria-label="Admin navigation">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/colleges">College</Link>
        <Link href="/admin/departments">Departments</Link>
        <Link href="/admin/announcements">Announcements</Link>
        <Link href="/admin/events">Events</Link>
      </nav>
      <header><p>CampusHub administration</p><h1>{title}</h1></header>
      {children}
    </main>
  );
}

export async function adminFetch(url, options = {}) {
  const response = await fetch(url, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) throw new Error("Your session has expired. Please sign in again.");
  if (response.status === 403) throw new Error("Administrator access is required.");
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
}
