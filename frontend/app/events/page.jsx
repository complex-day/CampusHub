"use client";

import { useEffect, useState } from "react";
import EventCard from "../../components/EventCard";
import CreateEventForm from "../../components/CreateEventForm";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [eventsResponse, meResponse, departmentsResponse] = await Promise.all([
          fetch("/api/events", { credentials: "include" }),
          fetch("/api/me", { credentials: "include" }),
          fetch("/api/departments", { credentials: "include" })
        ]);
        if (!eventsResponse.ok) throw new Error("Unable to load events");
        const eventData = await eventsResponse.json();
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
    load();
  }, []);

  return (
    <main className="events-page">
      <header><p>CampusHub</p><h1>Events</h1></header>
      {auth && ["faculty", "admin"].includes(auth.role) && <CreateEventForm collegeId={auth.collegeId} departments={departments} onCreated={(event) => setEvents((current) => [event, ...current])} />}
      {loading && <p>Loading events...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && events.length === 0 && <p>No upcoming events.</p>}
      <section aria-label="Upcoming event feed">{events.map((event) => <EventCard key={event._id} event={event} departments={departments} />)}</section>
    </main>
  );
}
