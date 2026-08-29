"use client";

import { useState } from "react";
import ImageLightboxModal from "./ImageLightboxModal";

export default function AnnouncementCard({ announcement }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isDept = Boolean(announcement.departmentId);
  const formattedDate = new Date(announcement.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
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

        {/* Poster Attachment (Responsive Aspect Ratio + Click to Full Size) */}
        {announcement.posterUrl && (
          <div
            onClick={() => setLightboxOpen(true)}
            title="Click to view full size image"
            style={{
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden",
              maxHeight: "450px",
              backgroundColor: "var(--surface-high)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "zoom-in",
              padding: "8px",
              transition: "transform 180ms ease, box-shadow 180ms ease",
            }}
          >
            <img
              src={announcement.posterUrl}
              alt={`${announcement.title} attachment`}
              loading="lazy"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "430px",
                objectFit: "contain",
                borderRadius: "4px",
              }}
            />

            {/* Hover Expand Badge */}
            <div
              style={{
                position: "absolute",
                bottom: "14px",
                right: "14px",
                backgroundColor: "rgba(30, 45, 66, 0.85)",
                color: "#FFFFFF",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                backdropFilter: "blur(4px)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                fullscreen
              </span>
              <span>Click for Full View</span>
            </div>
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
          {announcement.description || announcement.content}
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
            Issued by: {announcement.authorName || announcement.createdBy || "Academic Affairs"}
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-ghost"
              style={{ padding: "4px 8px", fontSize: "12px" }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: announcement.title, text: announcement.description || announcement.content });
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

      {/* Full-screen Lightbox Modal */}
      {lightboxOpen && (
        <ImageLightboxModal
          src={announcement.posterUrl}
          alt={announcement.title}
          title={announcement.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}