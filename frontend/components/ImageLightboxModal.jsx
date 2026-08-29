"use client";

import { useEffect, useState } from "react";

export default function ImageLightboxModal({ src, alt, title, onClose }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling while modal is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox Viewer"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(18, 24, 38, 0.94)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        cursor: "zoom-out",
        animation: "fadeIn 200ms ease-out",
      }}
    >
      {/* Lightbox Top Header Toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#FFFFFF",
          padding: "8px 16px",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          borderRadius: "8px",
          cursor: "default",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "16px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "70%",
          }}
        >
          {title || alt || "Full Size View"}
        </span>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Zoom Controls */}
          <button
            type="button"
            onClick={() => setScale((prev) => Math.max(0.5, prev - 0.25))}
            title="Zoom Out"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#FFFFFF",
              borderRadius: "4px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            －
          </button>
          <span style={{ fontSize: "12px", minWidth: "45px", textAlign: "center" }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((prev) => Math.min(3, prev + 0.25))}
            title="Zoom In"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#FFFFFF",
              borderRadius: "4px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ＋
          </button>
          <button
            type="button"
            onClick={() => setScale(1)}
            title="Reset Zoom"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#FFFFFF",
              borderRadius: "4px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Reset
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            title="Close Lightbox (Esc)"
            style={{
              background: "var(--terracotta)",
              border: "none",
              color: "#FFFFFF",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "16px",
              marginLeft: "10px",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Centered Image Canvas */}
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
          padding: "16px",
        }}
      >
        <img
          src={src}
          alt={alt || "Full size poster"}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "92vw",
            maxHeight: "82vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            borderRadius: "6px",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
            transform: `scale(${scale})`,
            transition: "transform 150ms ease-out",
            cursor: scale > 1 ? "grab" : "default",
          }}
        />
      </div>

      {/* Footer Info */}
      <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "12px", textAlign: "center" }}>
        Press <strong>ESC</strong> or click outside to close • Use <strong>＋</strong> and <strong>－</strong> to zoom
      </div>
    </div>
  );
}
