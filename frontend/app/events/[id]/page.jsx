"use client";

import { useEffect, useState } from "react";

export default function EventDetailsPage({ params }) {
  const [event, setEvent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [response, departmentsResponse] = await Promise.all([
          fetch(`/api/events/${params.id}`, { credentials: "include" }),
          fetch("/api/departments", { credentials: "include" })
        ]);
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Unable to load event");
        setEvent(body.event);
        if (departmentsResponse.ok) setDepartments((await departmentsResponse.json()).departments || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) return <main><p>Loading event...</p></main>;
  if (error) return <main><p role="alert">{error}</p></main>;
  return (
    <main className="event-details">
      {event.posterUrl && <img src={event.posterUrl} alt={`${event.title} poster`} />}
      <h1>{event.title}</h1>
      <p>{new Date(event.eventDate).toLocaleString()}</p>
      <p>{event.location}</p>
      <p>{event.departmentId ? `Department event: ${departments.find((department) => department._id === event.departmentId)?.name || event.departmentId}` : "College-wide event"}</p>
      <p>{event.description}</p>
    </main>
  );
}
