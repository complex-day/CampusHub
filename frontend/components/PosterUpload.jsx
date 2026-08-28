"use client";

import { useEffect, useRef, useState } from "react";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

export default function PosterUpload({ onUploaded, disabled = false }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const inputReference = useRef(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function selectPoster(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!allowedTypes.has(file.type) || file.size > maxFileSize) {
      setStatus("error");
      setMessage(file.size > maxFileSize ? "Poster must be 5MB or smaller" : "Only JPG, PNG, or WebP images are allowed");
      event.target.value = "";
      onUploaded("");
      return;
    }
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
      setMessage("Poster uploaded");
    } catch (uploadError) {
      setStatus("error");
      setMessage(uploadError.message);
      onUploaded("");
    }
  }

  function removePoster() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setStatus("idle");
    setMessage("");
    onUploaded("");
    if (inputReference.current) inputReference.current.value = "";
  }

  return (
    <div className="poster-upload">
      <label htmlFor="announcement-poster">Poster (optional)</label>
      <input ref={inputReference} id="announcement-poster" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={selectPoster} disabled={disabled || status === "loading"} />
      {previewUrl && <img src={previewUrl} alt="Selected poster preview" loading="lazy" />}
      {status === "loading" && <p role="status">Uploading poster...</p>}
      {message && <p role={status === "error" ? "alert" : "status"}>{message}</p>}
      {previewUrl && <button type="button" onClick={removePoster} disabled={disabled || status === "loading"}>Remove poster</button>}
    </div>
  );
}