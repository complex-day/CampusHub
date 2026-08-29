"use client";

import { useEffect, useState } from "react";
import CreateEventForm from "../../components/CreateEventForm";
import EventCard from "../../components/EventCard";
import ToriiNav from "../../components/ToriiNav";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  async function loadData() {
    try {
      const [eventResponse, meResponse, departmentsResponse] = await Promise.all([
        fetch("/api/events", { credentials: "include" }),
        fetch("/api/me", { credentials: "include" }),
        fetch("/api/departments", { credentials: "include" }),
      ]);
      if (!eventResponse.ok) throw new Error("Unable to load events");
      const eventData = await eventResponse.json();
      const me = meResponse.ok ? await meResponse.json() : {};
      const departmentData = departmentsResponse.ok ? await departmentsResponse.json() : {};
      setEvents(eventData.events || []);
      setAuth(me.auth || null);
      setDepartments(departmentData.departments || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (filter === "dept") return Boolean(ev.departmentId);
    if (filter === "college") return !ev.departmentId;
    return true;
  });

  const featuredEvent = events[0];

  return (
    <div className="app-shell">
      <ToriiNav auth={auth} activeSection="events" />

      <main className="main-content main-content-with-sidebar">
        {/* Header */}
        <section style={{ marginBottom: "32px", marginTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p className="font-body-lg" style={{ color: "var(--sandstone-text)", margin: "0 0 4px 0" }}>
                Campus Life & Celebrations
              </p>
              <h1 className="font-display" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                Utsav Cultural & Tech Hub
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setShowCreateModal(!showCreateModal)}
                className="btn-primary"
                style={{ fontSize: "13px", padding: "8px 16px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  add_circle
                </span>
                <span>{showCreateModal ? "Close Creator" : "Create Campus Event"}</span>
              </button>
              <span
                className="font-label-sm"
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  backgroundColor: "rgba(182, 92, 58, 0.12)",
                  color: "var(--terracotta)",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  confirmation_number
                </span>
                <span>{events.length} Upcoming Gatherings</span>
              </span>
            </div>
          </div>
        </section>

        {/* Creator Studio Toggle */}
        {showCreateModal && (
          <section style={{ marginBottom: "32px" }}>
            <CreateEventForm
              collegeId={auth?.collegeId || "507f1f77bcf86cd799439011"}
              departments={departments}
              onCreated={(newEvent) => {
                setEvents([newEvent, ...events]);
                setShowCreateModal(false);
              }}
            />
          </section>
        )}

        {/* Featured Event Hero Banner */}
        {featuredEvent && (
          <section
            className="card-surface"
            style={{
              marginBottom: "36px",
              padding: "28px",
              backgroundColor: "var(--surface-high)",
              border: "1px solid var(--border-subtle)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <div>
              <span
                className="font-label-sm"
                style={{
                  backgroundColor: "var(--terracotta)",
                  color: "#FFFFFF",
                  padding: "3px 10px",
                  borderRadius: "4px",
                  fontWeight: 600,
                  display: "inline-block",
                  marginBottom: "12px",
                }}
              >
                Featured Spotlight
              </span>
              <h2 className="font-headline-lg" style={{ color: "var(--indigo-primary)", margin: "0 0 10px 0" }}>
                {featuredEvent.title}
              </h2>
              <p className="font-body-md" style={{ color: "var(--sandstone-text)", margin: "0 0 16px 0", lineHeight: 1.6 }}>
                {featuredEvent.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--terracotta)", fontSize: "18px" }}>
                    event
                  </span>
                  <span className="font-body-sm" style={{ fontWeight: 500 }}>
                    {new Date(featuredEvent.eventDate).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--indigo-dye)", fontSize: "18px" }}>
                    location_on
                  </span>
                  <span className="font-body-sm" style={{ fontWeight: 500 }}>
                    {featuredEvent.location}
                  </span>
                </div>
              </div>
            </div>

            {featuredEvent.posterUrl && (
              <div
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  maxHeight: "220px",
                  backgroundColor: "var(--bg-washi)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={featuredEvent.posterUrl}
                  alt={`${featuredEvent.title} spotlight`}
                  style={{ width: "100%", height: "100%", maxHeight: "220px", objectFit: "cover" }}
                />
              </div>
            )}
          </section>
        )}

        {/* Events Gallery & Feed */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
            <h2 className="font-headline-md" style={{ color: "var(--indigo-primary)", margin: 0 }}>
              All Campus Events ({filteredEvents.length})
            </h2>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "6px", backgroundColor: "var(--surface-lift)", padding: "4px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
              <button
                onClick={() => setFilter("all")}
                className="btn-ghost"
                style={{
                  padding: "4px 12px",
                  fontSize: "12px",
                  backgroundColor: filter === "all" ? "var(--indigo-dye)" : "transparent",
                  color: filter === "all" ? "#FFFFFF" : "var(--sandstone-text)",
                  borderRadius: "4px",
                }}
              >
                All Events
              </button>
              <button
                onClick={() => setFilter("college")}
                className="btn-ghost"
                style={{
                  padding: "4px 12px",
                  fontSize: "12px",
                  backgroundColor: filter === "college" ? "var(--indigo-dye)" : "transparent",
                  color: filter === "college" ? "#FFFFFF" : "var(--sandstone-text)",
                  borderRadius: "4px",
                }}
              >
                Campus-Wide
              </button>
              <button
                onClick={() => setFilter("dept")}
                className="btn-ghost"
                style={{
                  padding: "4px 12px",
                  fontSize: "12px",
                  backgroundColor: filter === "dept" ? "var(--indigo-dye)" : "transparent",
                  color: filter === "dept" ? "#FFFFFF" : "var(--sandstone-text)",
                  borderRadius: "4px",
                }}
              >
                Departmental
              </button>
            </div>
          </div>

          {loading && (
            <div className="card-surface" style={{ padding: "36px", textAlign: "center" }}>
              <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
                Loading event calendar...
              </p>
            </div>
          )}

          {error && (
            <div className="card-surface" style={{ padding: "20px", borderLeft: "4px solid var(--error-crimson)" }} role="alert">
              <p className="font-body-md" style={{ color: "var(--error-crimson)" }}>
                ⚠ {error}
              </p>
            </div>
          )}

          {!loading && !error && filteredEvents.length === 0 && (
            <div className="card-surface" style={{ padding: "48px 24px", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--sandstone-muted)", marginBottom: "12px" }}>
                celebration
              </span>
              <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: "0 0 6px 0" }}>
                No events scheduled in this category yet.
              </h3>
              <p className="font-body-sm" style={{ color: "var(--sandstone-text)", maxWidth: "420px", margin: "0 auto 16px auto" }}>
                Click the <strong>Create Campus Event</strong> button above to publish the first campus fest or hackathon!
              </p>
            </div>
          )}

          {!loading && filteredEvents.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}
            >
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} departments={departments} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
