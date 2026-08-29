"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ToriiNav({ auth, activeSection = "home" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [saarthiOpen, setSaarthiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Initialize and persist desktop sidebar collapse state
  useEffect(() => {
    const saved = localStorage.getItem("campushub_sidebar_open");
    if (saved === "false") {
      setSidebarOpen(false);
      document.body.classList.add("sidebar-closed");
    } else {
      setSidebarOpen(true);
      document.body.classList.remove("sidebar-closed");
    }
  }, []);

  function handleUnifiedToggle() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      setSidebarOpen((prev) => {
        const nextState = !prev;
        localStorage.setItem("campushub_sidebar_open", String(nextState));
        if (nextState) {
          document.body.classList.remove("sidebar-closed");
        } else {
          document.body.classList.add("sidebar-closed");
        }
        return nextState;
      });
    }
  }

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
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =========================================================================
          COLLAPSIBLE SIDEBAR DOCK (Clean, 0 Extra Buttons)
          ========================================================================= */}
      <aside className={`torii-desktop-sidebar ${mobileDrawerOpen ? "mobile-open" : ""}`}>
        {/* Brand Header */}
        <div style={{ padding: "0 8px 20px 8px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "16px" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }} onClick={() => setMobileDrawerOpen(false)}>
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
                onClick={() => setMobileDrawerOpen(false)}
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

        {/* AI & User Dock */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
          {/* Saarthi AI trigger button */}
          <button
            type="button"
            onClick={() => setSaarthiOpen(!saarthiOpen)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px 14px",
              borderRadius: "6px",
              border: "1px solid var(--border-terracotta)",
              backgroundColor: saarthiOpen ? "rgba(182, 92, 58, 0.08)" : "#FFFFFF",
              color: "var(--terracotta)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 180ms ease",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              auto_awesome
            </span>
            <span>Ask Saarthi AI</span>
          </button>

          {/* User Profile / Auth State */}
          {auth ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                backgroundColor: "var(--surface-high)",
                borderRadius: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "var(--indigo-primary)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "13px",
                    flexShrink: 0,
                  }}
                >
                  {auth.name ? auth.name.charAt(0).toUpperCase() : "S"}
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
          TOP UTILITY APP BAR (Includes Exactly ONE Sidebar Toggle Button)
          ========================================================================= */}
      <header className="torii-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* THE SINGLE UNIFIED TOGGLE BUTTON */}
          <button
            type="button"
            onClick={handleUnifiedToggle}
            className="btn-ghost"
            title="Toggle Sidebar"
            style={{
              padding: "6px 10px",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              backgroundColor: "#FFFFFF",
              color: "var(--indigo-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              menu
            </span>
          </button>

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
              textDecoration: "none",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              search
            </span>
            <span>Search notices, events...</span>
          </Link>

          {auth && (
            <Link
              href="/passes"
              className="btn-ghost"
              style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid var(--border-subtle)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--terracotta)" }}>
                badge
              </span>
              <span>Passbook</span>
            </Link>
          )}

          {auth ? (
            <button
              onClick={handleLogout}
              className="btn-ghost"
              style={{ padding: "6px 10px", fontSize: "12px", color: "var(--error-crimson)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                logout
              </span>
              <span className="hide-on-mobile">Logout</span>
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <Link href="/login" className="btn-ghost" style={{ padding: "6px 12px", fontSize: "12px" }}>
                Sign In
              </Link>
              <Link href="/register" className="btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }}>
                Join Campus
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          MOBILE BOTTOM THUMB BAR (<= 1023px)
          ========================================================================= */}
      <nav className="torii-mobile-nav">
        {navItems.slice(0, 4).map((item) => {
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
                padding: "2px 8px",
              }}
            >
              <span
                className="material-symbols-outlined"
                data-fill={active ? "true" : "false"}
                style={{ fontSize: "20px" }}
              >
                {item.icon}
              </span>
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}

        {/* Mobile Menu Drawer Toggle */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            background: "transparent",
            border: "none",
            color: "var(--sandstone-text)",
            fontSize: "10px",
            fontWeight: 500,
            cursor: "pointer",
            padding: "2px 8px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            menu
          </span>
          <span>Menu</span>
        </button>
      </nav>

      {/* =========================================================================
          SAARTHI AI OVERLAY DRAWER
          ========================================================================= */}
      {saarthiOpen && (
        <div
          role="dialog"
          aria-label="Saarthi AI Academic Sanctuary"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "360px",
            maxWidth: "calc(100vw - 32px)",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0 12px 36px rgba(35, 33, 29, 0.18)",
            border: "1px solid var(--border-subtle)",
            zIndex: 100,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              backgroundColor: "var(--indigo-primary)",
              color: "#FFFFFF",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--ochre-warning)", fontSize: "20px" }}>
                auto_awesome
              </span>
              <strong style={{ fontFamily: "var(--font-serif)", fontSize: "16px" }}>Saarthi AI</strong>
            </div>
            <button
              type="button"
              onClick={() => setSaarthiOpen(false)}
              style={{ background: "transparent", border: "none", color: "#FFFFFF", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "280px", overflowY: "auto", fontSize: "13px" }}>
            <div style={{ padding: "10px 14px", backgroundColor: "var(--bg-washi)", borderRadius: "8px", color: "var(--text-primary)", lineHeight: 1.5 }}>
              Namaste {auth?.name || "Scholar"}. I am your academic guide. You can ask me about midterm exam schedules, club events, or your attendance buffers.
            </div>
          </div>

          <div style={{ padding: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Ask Saarthi a question..."
              style={{ flex: 1, fontSize: "13px", padding: "8px 12px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  alert("Saarthi AI Query Engine is connected to institutional syllabus.");
                }
              }}
            />
            <button
              type="button"
              className="btn-primary"
              style={{ padding: "8px 12px" }}
              onClick={() => alert("Saarthi AI Query Engine is connected to institutional syllabus.")}
            >
              Ask
            </button>
          </div>
        </div>
      )}
    </>
  );
}
