"use client";

export default function AnnouncementCard({ announcement }) {
  const isDept = Boolean(announcement.departmentId);
  const formattedDate = new Date(announcement.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      className="card-surface"
      style={{
        padding: "24px",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Card Header Meta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <span
          className="font-label-sm"
          style={{
            padding: "3px 8px",
            borderRadius: "4px",
            backgroundColor: isDept ? "rgba(61, 78, 107, 0.1)" : "rgba(182, 92, 58, 0.12)",
            color: isDept ? "var(--indigo-dye)" : "var(--terracotta)",
            fontWeight: 600,
          }}
        >
          {isDept ? "Department Circular" : "Institutional Notice"}
        </span>
        <time
          dateTime={announcement.createdAt}
          className="font-body-sm"
          style={{ color: "var(--sandstone-text)" }}
        >
          {formattedDate}
        </time>
      </div>

      {/* Title */}
      <h2
        className="font-headline-sm"
        style={{ color: "var(--indigo-primary)", margin: 0, lineHeight: 1.3 }}
      >
        {announcement.title}
      </h2>

      {/* Poster Attachment */}
      {announcement.posterUrl && (
        <div
          style={{
            borderRadius: "6px",
            overflow: "hidden",
            maxHeight: "360px",
            backgroundColor: "var(--surface-high)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={announcement.posterUrl}
            alt={`${announcement.title} poster`}
            loading="lazy"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "360px",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* Content */}
      <p
        className="font-body-md"
        style={{
          color: "var(--text-primary)",
          whiteSpace: "pre-line",
          lineHeight: 1.6,
        }}
      >
        {announcement.description}
      </p>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "4px",
        }}
      >
        <span className="font-label-sm" style={{ color: "var(--sandstone-muted)" }}>
          Issued by: {announcement.createdBy || "Academic Affairs"}
        </span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-ghost"
            style={{ padding: "4px 8px", fontSize: "12px" }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: announcement.title, text: announcement.description });
              }
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              share
            </span>
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}