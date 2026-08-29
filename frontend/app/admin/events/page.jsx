"use client";

import { useEffect, useState } from "react";
import AdminLayout, { adminFetch } from "../../../components/AdminLayout";
import DataTable from "../../../components/DataTable";

export default function AdminEventsPage() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: "", success: "" });
  const [attendeeModal, setAttendeeModal] = useState({ open: false, eventTitle: "", attendees: [], loading: false, error: "" });

  async function load() {
    try {
      const body = await adminFetch("/api/admin/events?limit=20");
      setItems(body.events || []);
      setState({ loading: false, error: "", success: "" });
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!confirm("Are you sure you want to delete this campus event?")) return;
    try {
      await adminFetch(`/api/admin/events/${id}`, { method: "DELETE" });
      setState({ loading: false, error: "", success: "Event cancelled and removed." });
      await load();
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  }

  async function viewAttendees(event) {
    setAttendeeModal({ open: true, eventTitle: event.title, attendees: [], loading: true, error: "" });
    try {
      const body = await adminFetch(`/api/admin/events/${event._id}/attendees`);
      setAttendeeModal({ open: true, eventTitle: event.title, attendees: body.attendees || [], loading: false, error: "" });
    } catch (err) {
      setAttendeeModal({ open: true, eventTitle: event.title, attendees: [], loading: false, error: err.message });
    }
  }

  return (
    <AdminLayout title="Campus Events & Participation Moderation">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {state.loading && (
          <div className="card-surface" style={{ padding: "32px", textAlign: "center" }}>
            <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
              Loading event calendar for moderation...
            </p>
          </div>
        )}

        {state.error && (
          <div className="card-surface" style={{ padding: "16px", borderLeft: "4px solid var(--error-crimson)" }} role="alert">
            <p className="font-body-sm" style={{ color: "var(--error-crimson)", margin: 0 }}>
              ⚠ {state.error}
            </p>
          </div>
        )}

        {state.success && (
          <div className="card-surface" style={{ padding: "16px", borderLeft: "4px solid var(--sage-success)" }} role="status">
            <p className="font-body-sm" style={{ color: "var(--sage-success)", margin: 0 }}>
              ✓ {state.success}
            </p>
          </div>
        )}

        {!state.loading && !state.error && (
          <DataTable
            rows={items}
            columns={[
              {
                key: "title",
                label: "Event Title",
                render: (item) => (
                  <div>
                    <strong className="font-body-md" style={{ color: "var(--indigo-primary)", display: "block" }}>
                      {item.title}
                    </strong>
                    <span className="font-label-sm" style={{ color: "var(--sandstone-muted)" }}>
                      {item.location}
                    </span>
                  </div>
                ),
              },
              {
                key: "eventDate",
                label: "Scheduled Time",
                render: (item) => new Date(item.eventDate).toLocaleString(),
              },
              {
                key: "attendance",
                label: "Participation",
                render: (item) => (
                  <span className="font-label-sm" style={{ color: "var(--sage-success)", fontWeight: 600 }}>
                    {item.attendeeCount || 0}
                    {item.capacity ? ` / ${item.capacity}` : " RSVPs"}
                  </span>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (item) => (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => viewAttendees(item)}
                      className="btn-ghost"
                      style={{ color: "var(--indigo-dye)", padding: "4px 8px", fontSize: "12px" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        groups
                      </span>
                      <span>Roster</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item._id)}
                      className="btn-ghost"
                      style={{ color: "var(--error-crimson)", padding: "4px 8px", fontSize: "12px" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        delete
                      </span>
                      <span>Cancel</span>
                    </button>
                  </div>
                ),
              },
            ]}
            empty="No events to moderate."
          />
        )}

        {/* Attendee Roster Modal */}
        {attendeeModal.open && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(29, 27, 23, 0.5)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "20px",
            }}
            onClick={() => setAttendeeModal({ ...attendeeModal, open: false })}
          >
            <div
              style={{
                backgroundColor: "var(--surface-lift)",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                width: "100%",
                maxWidth: "640px",
                maxHeight: "85vh",
                overflowY: "auto",
                padding: "24px",
                boxShadow: "0 16px 40px rgba(38, 55, 83, 0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
                    Attendee Roster
                  </h3>
                  <span className="font-label-sm" style={{ color: "var(--sandstone-text)" }}>
                    {attendeeModal.eventTitle}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttendeeModal({ ...attendeeModal, open: false })}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--sandstone-muted)" }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {attendeeModal.loading && (
                <p className="font-body-md" style={{ color: "var(--sandstone-text)", textAlign: "center", padding: "20px" }}>
                  Loading attendees...
                </p>
              )}

              {attendeeModal.error && (
                <p className="font-body-sm" style={{ color: "var(--error-crimson)" }} role="alert">
                  ⚠ {attendeeModal.error}
                </p>
              )}

              {!attendeeModal.loading && !attendeeModal.error && attendeeModal.attendees.length === 0 && (
                <p className="font-body-sm" style={{ color: "var(--sandstone-muted)", textAlign: "center", padding: "20px" }}>
                  No confirmed RSVPs yet.
                </p>
              )}

              {!attendeeModal.loading && !attendeeModal.error && attendeeModal.attendees.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {attendeeModal.attendees.map((attendee) => (
                    <div
                      key={attendee._id}
                      style={{
                        padding: "12px",
                        backgroundColor: "var(--bg-washi)",
                        borderRadius: "6px",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong className="font-body-md" style={{ color: "var(--text-primary)", display: "block" }}>
                          {attendee.userId?.name || "Student"}
                        </strong>
                        <span className="font-label-sm" style={{ color: "var(--sandstone-muted)" }}>
                          {attendee.userId?.email} • {attendee.userId?.role}
                        </span>
                      </div>
                      <span className="font-label-sm" style={{ backgroundColor: "var(--surface-high)", padding: "4px 8px", borderRadius: "4px", color: "var(--indigo-dye)", fontWeight: 700 }}>
                        {attendee.ticketNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
