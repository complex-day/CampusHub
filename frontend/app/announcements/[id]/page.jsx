"use client";

import { useEffect, useState } from "react";

export default function AnnouncementDetailsPage({ params }) {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/announcements/${params.id}`, { credentials: "include" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load announcement");
        setAnnouncement(body.announcement);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) return <main><p>Loading announcement...</p></main>;
  if (error) return <main><p role="alert">{error}</p></main>;
  return (
    <main className="announcement-details">
      {announcement.posterUrl && <img src={announcement.posterUrl} alt={`${announcement.title} poster`} />}
      <h1>{announcement.title}</h1>
      <time dateTime={announcement.createdAt}>{new Date(announcement.createdAt).toLocaleDateString()}</time>
      <p>{announcement.departmentId ? `Department: ${announcement.departmentId}` : "College-wide announcement"}</p>
      <p>{announcement.description}</p>
    </main>
  );
}