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
      router.push("/announcements");
      window.location.reload();
    } catch {
      window.location.href = "/announcements";
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
          DESKTOP SIDEBAR DOCK (256px Fixed Torii Gateway)
          ========================================================================= */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "256px",
          backgroundColor: "var(--surface-lift)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          padding: "28px 16px",
          zIndex: 40,
        }}
        className="hidden lg:flex"
      >
        {/* Brand Header */}
        <div style={{ padding: "0 12px 28px 12px" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <span
              className="font-headline-md"
              style={{ color: "var(--indigo-dye)", display: "block", letterSpacing: "-0.01em" }}
            >
              CampusHub
            </span>
            <span
              className="font-label-sm"
              style={{
                color: "var(--sandstone-text)",
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
                  borderRadius: "4px",
                  textDecoration: "none",
                  backgroundColor: active ? "var(--surface-highest)" : "transparent",
                  color: active ? "var(--terracotta)" : "var(--sandstone-text)",
                  borderRight: active ? "3px solid var(--terracotta)" : "3px solid transparent",
                  fontWeight: active ? 600 : 400,
                  fontSize: "14px",
                  transition: "all 180ms ease",
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

        {/* Bottom Utility & Saarthi Launch */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto" }}>
          <button
            onClick={() => setSaarthiOpen(true)}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", fontSize: "12px", padding: "10px 12px" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              temp_preferences_custom
            </span>
            <span>Launch Saarthi AI</span>
          </button>

          {auth ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderTop: "1px solid var(--border-subtle)",
                marginTop: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                  }}
                >
                  {auth.name ? auth.name.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="font-body-sm" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {auth.name || "Student"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--sandstone-muted)",
                  cursor: "pointer",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  logout
                </span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "8px", paddingTop: "8px" }}>
              <Link
                href="/announcements"
                className="btn-ghost"
                style={{ flex: 1, justifyContent: "center", fontSize: "12px" }}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================================
          TOP UTILITY APP BAR
          ========================================================================= */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: "rgba(247, 243, 234, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "14px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className="lg:ml-[256px]"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="font-headline-sm" style={{ color: "var(--indigo-dye)", fontWeight: 700 }}>
            CampusHub
          </span>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: "4px",
              backgroundColor: "var(--surface-high)",
              color: "var(--sandstone-text)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Apex Institute • Semester 4
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link
            href="/search"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "var(--surface-lift)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "20px",
              padding: "6px 16px",
              color: "var(--sandstone-text)",
              textDecoration: "none",
              fontSize: "13px",
              width: "220px",
            }}
            className="hidden md:flex"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              search
            </span>
            <span>Search notices, events...</span>
          </Link>

          <button
            onClick={() => setSaarthiOpen(true)}
            className="btn-primary"
            style={{ fontSize: "12px", padding: "6px 14px" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              temp_preferences_custom
            </span>
            <span>Ask Saarthi</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          MOBILE BOTTOM THUMB BAR (< 1024px)
          ========================================================================= */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "var(--surface-lift)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "8px 0 14px 0",
          zIndex: 50,
        }}
        className="flex lg:hidden"
        aria-label="Mobile Bottom Navigation"
      >
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
          SAARTHI AI COMPANION MODAL (NON-FUNCTIONAL VISUAL PLACEHOLDER)
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
              backgroundColor: "var(--surface-lift)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "580px",
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
                  <h3 className="font-headline-sm" style={{ color: "var(--indigo-dye)", margin: 0 }}>
                    Saarthi AI Sanctuary
                  </h3>
                  <span className="font-label-sm" style={{ color: "var(--sandstone-text)" }}>
                    Tenant-Bounded Campus Guide (Preview)
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

            <p className="font-body-md" style={{ color: "var(--sandstone-text)", marginBottom: "20px" }}>
              Saarthi is your personal academic companion. Ask questions regarding exam dates, official circulars, timetable conflicts, and campus life.
            </p>

            <div style={{ backgroundColor: "var(--bg-washi)", border: "1px solid var(--border-subtle)", borderRadius: "6px", padding: "14px", marginBottom: "20px" }}>
              <span className="font-label-sm" style={{ color: "var(--terracotta)", display: "block", marginBottom: "8px" }}>
                Try asking:
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span className="font-body-sm" style={{ color: "var(--text-primary)" }}>
                  • "When is the internal submission deadline for DSP?"
                </span>
                <span className="font-body-sm" style={{ color: "var(--text-primary)" }}>
                  • "Summarize the latest college-wide circular."
                </span>
                <span className="font-body-sm" style={{ color: "var(--text-primary)" }}>
                  • "Are there any hackathons scheduled this weekend?"
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
