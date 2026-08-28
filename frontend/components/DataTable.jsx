export default function DataTable({ columns, rows, empty = "No records found." }) {
  if (rows.length === 0) return <p>{empty}</p>;
  return <div role="region" aria-label="Data table" style={{ overflowX: "auto" }}><table><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row._id || row.id}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? "-"}</td>)}</tr>)}</tbody></table></div>;
}
