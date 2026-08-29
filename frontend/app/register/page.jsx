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
    collegeId: "Apex Institute of Technology",
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

    // Client-side validation checks
    const trimmedEmail = form.email.trim();
    if (trimmedEmail.includes(".@") || !trimmedEmail.includes("@")) {
      setError("Please check your email format. Ensure there is no dot directly before the @ symbol.");
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter (A-Z).");
      setLoading(false);
      return;
    }

    if (!/[0-9]/.test(form.password)) {
      setError("Password must contain at least one number (0-9).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          email: trimmedEmail,
          password: form.password,
          role: form.role,
          collegeId: form.collegeId,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        if (body.details && Array.isArray(body.details) && body.details.length > 0) {
          const detailMessages = body.details.map((d) => `${d.path?.join(".") || "field"}: ${d.message}`).join(", ");
          throw new Error(detailMessages || body.error);
        }
        throw new Error(body.error || "Registration failed. Please verify your details.");
      }

      // Auto login after successful registration
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmedEmail, password: form.password }),
      });

      if (loginRes.ok) {
        router.push("/announcements");
        window.location.reload();
      } else {
        router.push("/login");
      }
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
              lineHeight: 1.4,
            }}
            role="alert"
          >
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Raja Sharma"
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
              placeholder="e.g. raja@campus.apex.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="font-label-sm" style={{ color: "var(--sandstone-text)", display: "block", marginBottom: "4px" }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <span className="font-label-sm" style={{ color: "var(--sandstone-muted)", fontSize: "10px", marginTop: "2px", display: "block" }}>
              Must include at least 1 uppercase letter and 1 number (e.g. Raja#2026)
            </span>
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
                  placeholder="e.g. Apex Institute"
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
