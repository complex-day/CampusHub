"use client";

import { useEffect, useRef, useState } from "react";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

export default function PosterUpload({ onUploaded, disabled = false }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileDetails, setFileDetails] = useState(null);
  const inputReference = useRef(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function processFile(file) {
    if (!file) return;
    if (!allowedTypes.has(file.type) || file.size > maxFileSize) {
      setStatus("error");
      setMessage(file.size > maxFileSize ? "Poster must be 5MB or smaller" : "Only JPG, PNG, or WebP images are allowed");
      onUploaded("");
      return;
    }
    setFileDetails({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    });
    setPreviewUrl(URL.createObjectURL(file));
    setStatus("loading");
    setMessage("");

    const data = new FormData();
    data.append("poster", file);
    try {
      const response = await fetch("/api/uploads/poster", { method: "POST", credentials: "include", body: data });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to upload poster");
      onUploaded(body.posterUrl);
      setStatus("success");
      setMessage("Poster uploaded to Cloudinary");
    } catch (uploadError) {
      setStatus("error");
      setMessage(uploadError.message);
      onUploaded("");
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    if (disabled || status === "loading") return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function removePoster() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setFileDetails(null);
    setStatus("idle");
    setMessage("");
    onUploaded("");
    if (inputReference.current) inputReference.current.value = "";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "10px 0" }}>
      <label
        htmlFor="announcement-poster"
        className="font-label-sm"
        style={{ color: "var(--sandstone-text)", textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        Poster / Circular Attachment (Optional, max 5MB)
      </label>

      {/* Hidden file input */}
      <input
        ref={inputReference}
        id="announcement-poster"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={(e) => processFile(e.target.files?.[0])}
        disabled={disabled || status === "loading"}
        style={{ display: "none" }}
      />

      {/* Dropzone Container */}
      {!previewUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputReference.current?.click()}
          style={{
            border: "1.5px dashed rgba(182, 92, 58, 0.35)",
            backgroundColor: "var(--surface-container-low)",
            borderRadius: "6px",
            padding: "24px 16px",
            textAlign: "center",
            cursor: disabled || status === "loading" ? "not-allowed" : "pointer",
            transition: "all 180ms ease",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "32px", color: "var(--terracotta)", marginBottom: "6px", display: "inline-block" }}
          >
            add_photo_alternate
          </span>
          <p className="font-body-md" style={{ color: "var(--text-primary)", fontWeight: 500, margin: 0 }}>
            Click to upload or drag & drop high-res poster
          </p>
          <p className="font-body-sm" style={{ color: "var(--sandstone-muted)", margin: "4px 0 0 0" }}>
            PNG, JPG, or WebP up to 5MB (16:9 or 4:5 recommended)
          </p>
        </div>
      ) : (
        /* Uploaded Preview Card */
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            backgroundColor: "var(--surface-lift)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            padding: "12px",
          }}
        >
          <img
            src={previewUrl}
            alt="Uploaded preview"
            style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "4px" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="font-body-sm" style={{ fontWeight: 600, display: "block", color: "var(--text-primary)" }}>
              {fileDetails?.name || "Uploaded poster"}
            </span>
            <span className="font-label-sm" style={{ color: "var(--sandstone-muted)" }}>
              {fileDetails?.size} • Cloudinary stream
            </span>
            {status === "loading" && (
              <p className="font-label-sm" style={{ color: "var(--indigo-dye)", marginTop: "2px" }} role="status">
                Uploading to media vault...
              </p>
            )}
            {status === "success" && (
              <p className="font-label-sm" style={{ color: "var(--sage-success)", marginTop: "2px" }} role="status">
                ✓ Ready for publishing
              </p>
            )}
            {status === "error" && (
              <p className="font-label-sm" style={{ color: "var(--error-crimson)", marginTop: "2px" }} role="alert">
                ⚠ {message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={removePoster}
            disabled={disabled || status === "loading"}
            className="btn-ghost"
            style={{ color: "var(--terracotta)", padding: "6px 10px" }}
            title="Remove attachment"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              delete
            </span>
          </button>
        </div>
      )}
    </div>
  );
}