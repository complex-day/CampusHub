export default function EventCard({ event, departments = [] }) {
  const department = departments.find((item) => item._id === event.departmentId);
  return (
    <article className="event-card">
      {event.posterUrl && <img src={event.posterUrl} alt={`${event.title} poster`} loading="lazy" />}
      <div>
        <h2><a href={`/events/${event._id}`}>{event.title}</a></h2>
        <p>{new Date(event.eventDate).toLocaleString()}</p>
        <p>{event.location}</p>
        <p>{event.departmentId ? `Department event: ${department?.name || event.departmentId}` : "College-wide event"}</p>
        <p>{event.description}</p>
      </div>
    </article>
  );
}
