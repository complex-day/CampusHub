export default function DataTable({ rows = [], columns = [], empty = "No records found." }) {
  if (rows.length === 0) {
    return (
      <div className="card-surface" style={{ padding: "40px", textAlign: "center" }}>
        <p className="font-body-md" style={{ color: "var(--sandstone-muted)", margin: 0 }}>
          {empty}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: "auto",
        backgroundColor: "var(--surface-lift)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "8px",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--surface-high)" }}>
            {columns.map((column) => (
              <th
                key={column.key}
                className="font-label-sm"
                style={{
                  padding: "12px 16px",
                  color: "var(--sandstone-text)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row._id || index}
              style={{
                borderBottom: index < rows.length - 1 ? "1px solid var(--border-subtle)" : "none",
                transition: "background-color 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-high)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {columns.map((column) => (
                <td key={column.key} style={{ padding: "14px 16px", color: "var(--text-primary)" }}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
