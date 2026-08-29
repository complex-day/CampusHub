"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Invalid credentials. Please check your email and password.");
      }

      // Successful login -> Redirect to home courtyard
      router.push("/announcements");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email, password) {
    setForm({ email, password });
    setError("");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "var(--bg-washi)",
      }}
    >
      <div
        className="card-surface"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 8px 30px rgba(35, 33, 29, 0.08)",
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: "center" }}>
          <span
            className="font-headline-md"
            style={{ color: "var(--indigo-primary)", display: "block", letterSpacing: "-0.01em" }}
          >
            CampusHub
          </span>
          <span
            className="font-label-sm"
            style={{
              color: "var(--terracotta)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "block",
              marginTop: "2px",
            }}
          >
            Academic Sanctuary & Sign In
          </span>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              borderRadius: "6px",
              backgroundColor: "var(--error-container)",
              color: "var(--error-crimson)",
              fontSize: "13px",
              border: "1px solid rgba(186, 26, 26, 0.2)",
            }}
            role="alert"
          >
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              College Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. student@campus.apex.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px", marginTop: "4px", fontSize: "14px" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              login
            </span>
            <span>{loading ? "Signing in..." : "Enter Sanctuary"}</span>
          </button>
        </form>

        {/* Demo Account Quick-Fill */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
          <span className="font-label-sm" style={{ color: "var(--sandstone-muted)", display: "block", marginBottom: "8px", textAlign: "center" }}>
            Quick Demo Credentials:
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
            <button
              type="button"
              onClick={() => fillDemo("student@campus.apex.edu", "Student#2026")}
              className="btn-ghost"
              style={{ fontSize: "11px", padding: "6px 4px", justifyContent: "center", border: "1px solid var(--border-subtle)" }}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => fillDemo("faculty@campus.apex.edu", "Faculty#2026")}
              className="btn-ghost"
              style={{ fontSize: "11px", padding: "6px 4px", justifyContent: "center", border: "1px solid var(--border-subtle)" }}
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@campus.apex.edu", "Admin#2026")}
              className="btn-ghost"
              style={{ fontSize: "11px", padding: "6px 4px", justifyContent: "center", border: "1px solid var(--border-subtle)" }}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--sandstone-text)", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
          <Link href="/register" style={{ color: "var(--terracotta)", fontWeight: 600 }}>
            Create Account →
          </Link>
          <Link href="/announcements" style={{ color: "var(--sandstone-muted)" }}>
            Browse as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
