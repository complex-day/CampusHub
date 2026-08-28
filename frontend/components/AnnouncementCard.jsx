export default function AnnouncementCard({ announcement }) {
  return (
    <article className="announcement-card">
      <div className="announcement-card__meta">
        <span>{announcement.departmentId ? "Department announcement" : "College-wide"}</span>
        <time dateTime={announcement.createdAt}>{new Date(announcement.createdAt).toLocaleDateString()}</time>
      </div>
      <h2>{announcement.title}</h2>
      <p>{announcement.description}</p>
      <small>Published by {announcement.createdBy}</small>
    </article>
  );
}