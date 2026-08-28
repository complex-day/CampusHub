"use client";

import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../components/AdminLayout";

export default function AdminDashboardPage() {
  const [state, setState] = useState({ loading: true, error: "", metrics: null });
  useEffect(() => { adminFetch("/api/admin/metrics").then((body) => setState({ loading: false, error: "", metrics: body.metrics })).catch((error) => setState({ loading: false, error: error.message, metrics: null })); }, []);
  return <AdminLayout title="Dashboard"><section aria-label="Campus metrics">{state.loading && <p>Loading metrics...</p>}{state.error && <p role="alert">{state.error}</p>}{state.metrics && Object.entries(state.metrics).map(([key, value]) => <article key={key}><strong>{value}</strong><span>{key}</span></article>)}</section></AdminLayout>;
}
