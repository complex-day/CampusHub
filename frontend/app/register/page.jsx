"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    collegeId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/colleges")
      .then((res) => (res.ok ? res.json() : { colleges: [] }))
      .then((data) => {
        const list = data.colleges || [];
        setColleges(list);
        if (list.length > 0) {
          setForm((prev) => ({ ...prev, collegeId: list[0]._id }));
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Registration failed. Please check your details.");
      }

      router.push("/announcements");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          maxWidth: "460px",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          boxShadow: "0 8px 30px rgba(35, 33, 29, 0.08)",
        }}
      >
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
            New Member Registration
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rohan Varma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              College Email
            </label>
            <input
              type="email"
              required
              placeholder="e.g. rohan.varma@campus.apex.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Password (Min 8 chars, 1 uppercase, 1 number)
            </label>
            <input
              type="password"
              required
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
              </select>
            </div>

            <div>
              <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
                College
              </label>
              {colleges.length > 0 ? (
                <select
                  value={form.collegeId}
                  onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
                >
                  {colleges.map((col) => (
                    <option key={col._id} value={col._id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="College ID"
                  value={form.collegeId}
                  onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px", marginTop: "6px", fontSize: "14px" }}
          >
            <span>{loading ? "Registering..." : "Create Account & Join"}</span>
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "12px", color: "var(--sandstone-text)", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--terracotta)", fontWeight: 600 }}>
            Sign In Here →
          </Link>
        </div>
      </div>
    </div>
  );
}
