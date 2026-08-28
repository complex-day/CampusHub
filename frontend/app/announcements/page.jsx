"use client";

import { useEffect, useState } from "react";
import AnnouncementCard from "../../components/AnnouncementCard";
import CreateAnnouncementForm from "../../components/CreateAnnouncementForm";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [feedResponse, meResponse, departmentsResponse] = await Promise.all([
          fetch("/api/announcements", { credentials: "include" }),
          fetch("/api/me", { credentials: "include" }),
          fetch("/api/departments", { credentials: "include" })
        ]);
        if (!feedResponse.ok) throw new Error("Unable to load announcements");
        const feed = await feedResponse.json();
        const me = meResponse.ok ? await meResponse.json() : {};
        const departmentData = departmentsResponse.ok ? await departmentsResponse.json() : {};
        setAnnouncements(feed.announcements || []);
        setAuth(me.auth || null);
        setDepartments(departmentData.departments || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="announcements-page">
      <header><p>CampusHub</p><h1>Announcements</h1></header>
      {auth && ["faculty", "admin"].includes(auth.role) && <CreateAnnouncementForm collegeId={auth.collegeId} departments={departments} onCreated={(announcement) => setAnnouncements([announcement, ...announcements])} />}
      {loading && <p>Loading announcements...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && announcements.length === 0 && <p>No announcements yet.</p>}
      <section aria-label="Announcement feed">{announcements.map((announcement) => <AnnouncementCard key={announcement._id} announcement={announcement} />)}</section>
    </main>
  );
}