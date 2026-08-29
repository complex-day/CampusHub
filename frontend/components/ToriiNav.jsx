"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function ToriiNav({ auth, activeSection = "home" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [saarthiOpen, setSaarthiOpen] = useState(false);

  const navItems = [
    { label: "Aangan Courtyard", href: "/announcements", icon: "school", match: ["/", "/announcements"] },
    { label: "Pathshala Academics", href: "/academic", icon: "auto_stories", match: ["/academic"] },
    { label: "Utsav Campus Life", href: "/events", icon: "location_city", match: ["/events"] },
    { label: "Passbook & ID", href: "/passes", icon: "badge", match: ["/passes"] },
    { label: "Omni-Search", href: "/search", icon: "search", match: ["/search"] },
  ];

  if (auth?.role === "admin") {
    navItems.push({ label: "Admin Sanctuary", href: "/admin", icon: "admin_panel_settings", match: ["/admin"] });
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
      window.location.reload();
    } catch {
      window.location.href = "/login";
    }
  }

  const isCurrentActive = (item) => {
    if (item.match.includes(pathname)) return true;
    if (pathname.startsWith(item.href) && item.href !== "/" && item.href !== "/announcements") return true;
    return false;
  };

  return (
    <>
      {/* =========================================================================
          DESKTOP SIDEBAR DOCK (Fixed 250px on >=1024px)
          ========================================================================= */}
      <aside className="torii-desktop-sidebar">
        {/* Brand Header */}
        <div style={{ padding: "0 12px 24px 12px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "16px" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
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
              Academic Sanctuary
            </span>
          </Link>
        </div>

        {/* Primary Navigation Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          {navItems.map((item) => {
            const active = isCurrentActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  backgroundColor: active ? "var(--surface-high)" : "transparent",
                  color: active ? "var(--terracotta)" : "var(--sandstone-text)",
                  borderRight: active ? "3px solid var(--terracotta)" : "3px solid transparent",
                  fontWeight: active ? 600 : 500,
                  fontSize: "14px",
                  transition: "all 160ms ease",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  data-fill={active ? "true" : "false"}
                  style={{
                    fontSize: "20px",
                    color: active ? "var(--terracotta)" : "var(--sandstone-muted)",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Utility & Auth Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
          <button
            onClick={() => setSaarthiOpen(true)}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", fontSize: "12px", padding: "8px 12px" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              temp_preferences_custom
            </span>
            <span>Ask Saarthi AI</span>
          </button>

          {auth ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px",
                backgroundColor: "var(--surface-high)",
                borderRadius: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    backgroundColor: "var(--indigo-dye)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {auth.name ? auth.name.charAt(0).toUpperCase() : "U"}
                </span>
                <div style={{ minWidth: 0 }}>
                  <strong className="font-body-sm" style={{ color: "var(--text-primary)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {auth.name || "Student"}
                  </strong>
                  <span className="font-label-sm" style={{ color: "var(--sandstone-muted)", textTransform: "capitalize", display: "block" }}>
                    {auth.role || "student"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--error-crimson)",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  logout
                </span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Link
                href="/login"
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", fontSize: "12px", padding: "8px 12px" }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-ghost"
                style={{ width: "100%", justifyContent: "center", fontSize: "12px", padding: "6px 12px" }}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================================
          TOP UTILITY APP BAR
          ========================================================================= */}
      <header className="torii-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }} className="hide-on-desktop">
            <span className="font-headline-sm" style={{ color: "var(--indigo-primary)", fontWeight: 700 }}>
              CampusHub
            </span>
          </Link>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              backgroundColor: "var(--surface-high)",
              color: "var(--sandstone-text)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {auth ? `Logged in: ${auth.name || "Student"} (${auth.role || "student"})` : "Apex Institute of Technology"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/search"
            className="hide-on-mobile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              borderRadius: "20px",
              padding: "6px 16px",
              color: "var(--sandstone-text)",
              fontSize: "13px",
              width: "220px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--sandstone-muted)" }}>
              search
            </span>
            <span>Search notices, events...</span>
          </Link>

          {auth ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link href="/passes" className="btn-ghost" style={{ fontSize: "12px", padding: "6px 10px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  badge
                </span>
                <span className="hide-on-mobile">Passbook</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{ fontSize: "12px", padding: "6px 10px", color: "var(--error-crimson)" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  logout
                </span>
                <span className="hide-on-mobile">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link href="/login" className="btn-primary" style={{ fontSize: "12px", padding: "6px 14px" }}>
                Sign In
              </Link>
              <Link href="/register" className="btn-secondary hide-on-mobile" style={{ fontSize: "12px", padding: "6px 14px" }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          MOBILE BOTTOM THUMB BAR (<1024px)
          ========================================================================= */}
      <nav className="torii-mobile-nav" aria-label="Mobile Navigation">
        {navItems.slice(0, 5).map((item) => {
          const active = isCurrentActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                textDecoration: "none",
                color: active ? "var(--terracotta)" : "var(--sandstone-text)",
                fontSize: "10px",
                fontWeight: active ? 600 : 500,
              }}
            >
              <span
                className="material-symbols-outlined"
                data-fill={active ? "true" : "false"}
                style={{ fontSize: "22px" }}
              >
                {item.icon}
              </span>
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* =========================================================================
          SAARTHI AI COMPANION MODAL
          ========================================================================= */}
      {saarthiOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(29, 27, 23, 0.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setSaarthiOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 16px 40px rgba(38, 55, 83, 0.2)",
              padding: "28px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    backgroundColor: "var(--indigo-dye)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    temp_preferences_custom
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                    Saarthi AI Sanctuary
                  </h3>
                  <span className="font-label-sm" style={{ color: "var(--sandstone-text)" }}>
                    Tenant-Bounded Campus Assistant (Preview)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSaarthiOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--sandstone-muted)",
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="font-body-md" style={{ color: "var(--sandstone-text)", marginBottom: "18px" }}>
              Saarthi is your personal academic companion. Ask questions regarding exam dates, official circulars, and campus life.
            </p>

            <div style={{ backgroundColor: "var(--surface-high)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "14px", marginBottom: "20px" }}>
              <span className="font-label-sm" style={{ color: "var(--terracotta)", display: "block", marginBottom: "6px" }}>
                Sample Prompts:
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span className="font-body-sm" style={{ color: "var(--text-primary)" }}>
                  • "When is the internal submission deadline for DSP?"
                </span>
                <span className="font-body-sm" style={{ color: "var(--text-primary)" }}>
                  • "Summarize the latest college-wide circular."
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Ask Saarthi anything about your campus..."
                style={{ flex: 1 }}
                readOnly
                value="[Preview Mode — Backend AI pipeline in phase 2]"
              />
              <button className="btn-primary" onClick={() => setSaarthiOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
