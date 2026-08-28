function departmentLabel(item) {
  return item.departmentId ? `Department: ${item.departmentId}` : "College-wide";
}

export default function SearchResults({ announcements, events }) {
  const hasResults = announcements.length > 0 || events.length > 0;
  if (!hasResults) return <p>No announcements or events matched your search.</p>;

  return (
    <section aria-label="Search results">
      {announcements.length > 0 && <div><h2>Announcements</h2>{announcements.map((announcement) => <article key={announcement._id} className="announcement-card"><h3><a href={`/announcements/${announcement._id}`}>{announcement.title}</a></h3><time dateTime={announcement.createdAt}>{new Date(announcement.createdAt).toLocaleDateString()}</time><p>{announcement.description}</p><small>{departmentLabel(announcement)}</small></article>)}</div>}
      {events.length > 0 && <div><h2>Events</h2>{events.map((event) => <article key={event._id} className="event-card"><h3><a href={`/events/${event._id}`}>{event.title}</a></h3><time dateTime={event.eventDate}>{new Date(event.eventDate).toLocaleString()}</time><p>{event.location}</p><p>{event.description}</p><small>{departmentLabel(event)}</small></article>)}</div>}
    </section>
  );
}