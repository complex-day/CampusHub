"use client";

import Link from "next/link";

function departmentLabel(item) {
  return item.departmentId ? `Department ${item.departmentId}` : "College-Wide";
}

export default function SearchResults({ announcements = [], events = [] }) {
  const hasResults = announcements.length > 0 || events.length > 0;
  if (!hasResults) {
    return (
      <div className="card-surface" style={{ padding: "48px 24px", textAlign: "center", marginTop: "24px" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--sandstone-muted)", marginBottom: "8px" }}>
          search_off
        </span>
        <p className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
          No campus records found.
        </p>
        <p className="font-body-sm" style={{ color: "var(--sandstone-muted)", marginTop: "4px" }}>
          Try checking for spelling or searching with broader keywords.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Search results" style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "24px" }}>
      {/* Announcements Search Match */}
      {announcements.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--terracotta)", fontSize: "20px" }}>
              feed
            </span>
            <h2 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
              Matching Institutional Notices ({announcements.length})
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {announcements.map((announcement) => (
              <article
                key={announcement._id}
                className="card-surface"
                style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-label-sm" style={{ color: "var(--terracotta)", fontWeight: 600 }}>
                    {departmentLabel(announcement)}
                  </span>
                  <time dateTime={announcement.createdAt} className="font-body-sm" style={{ color: "var(--sandstone-text)" }}>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <h3 className="font-headline-sm" style={{ margin: "2px 0 0 0" }}>
                  <Link
                    href={`/announcements/${announcement._id}`}
                    style={{ color: "var(--indigo-primary)", textDecoration: "none" }}
                  >
                    {announcement.title}
                  </Link>
                </h3>
                <p className="font-body-sm" style={{ color: "var(--sandstone-text)", margin: "4px 0", lineHeight: 1.5 }}>
                  {announcement.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Events Search Match */}
      {events.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--ochre-warning)", fontSize: "20px" }}>
              celebration
            </span>
            <h2 className="font-headline-sm" style={{ color: "var(--indigo-primary)", margin: 0 }}>
              Matching Campus Events ({events.length})
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {events.map((event) => (
              <article
                key={event._id}
                className="card-surface"
                style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-label-sm" style={{ color: "var(--ochre-warning)", fontWeight: 600 }}>
                    {departmentLabel(event)}
                  </span>
                  <span className="font-body-sm" style={{ color: "var(--sandstone-text)" }}>
                    {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-headline-sm" style={{ margin: "2px 0 0 0" }}>
                  <Link
                    href={`/events/${event._id}`}
                    style={{ color: "var(--indigo-primary)", textDecoration: "none" }}
                  >
                    {event.title}
                  </Link>
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--sandstone-text)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--terracotta)" }}>
                    location_on
                  </span>
                  <span className="font-body-sm">{event.location}</span>
                </div>
                <p
                  className="font-body-sm"
                  style={{
                    color: "var(--sandstone-text)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    margin: "4px 0",
                  }}
                >
                  {event.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}