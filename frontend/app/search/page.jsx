"use client";

import { useEffect, useState } from "react";
import SearchResults from "../../components/SearchResults";
import ToriiNav from "../../components/ToriiNav";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAuth(data.auth || null))
      .catch(() => {});
  }, []);

  async function performSearch(searchTerm) {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) {
      setError("Enter a keyword to search.");
      setResults(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to search campus content");
      setResults(body);
    } catch (searchError) {
      setError(searchError.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    performSearch();
  }

  function handleChipClick(chipText) {
    setQuery(chipText);
    performSearch(chipText);
  }

  function clear() {
    setQuery("");
    setResults(null);
    setError("");
  }

  return (
    <div className="app-shell">
      <ToriiNav auth={auth} activeSection="search" />

      <main className="main-content main-content-with-sidebar">
        <section style={{ marginBottom: "28px", marginTop: "8px" }}>
          <p className="font-body-lg" style={{ color: "var(--sandstone-text)", margin: "0 0 4px 0" }}>
            Campus Discovery
          </p>
          <h1 className="font-display" style={{ color: "var(--indigo-primary)", margin: 0 }}>
            Omni-Search
          </h1>
        </section>

        {/* Search Input Bar */}
        <form
          onSubmit={submit}
          role="search"
          className="card-surface"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <label htmlFor="campus-search" className="font-label-sm" style={{ color: "var(--sandstone-text)" }}>
            Search official circulars, exam schedules, events, and campus fests
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              id="campus-search"
              value={query}
              maxLength={100}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. Midterms, Hackathon, Robotics, Library..."
              style={{ flex: 1, minWidth: "240px", fontSize: "15px" }}
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ height: "40px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                search
              </span>
              <span>{loading ? "Searching..." : "Search"}</span>
            </button>
            <button
              type="button"
              onClick={clear}
              className="btn-ghost"
              disabled={!query && !results && !error}
            >
              Clear
            </button>
          </div>

          {/* Quick Search Suggestion Chips */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", paddingTop: "4px" }}>
            <span className="font-label-sm" style={{ color: "var(--sandstone-muted)" }}>
              Popular searches:
            </span>
            {["Hackathon", "Midterms", "Robotics", "Symposium", "Library"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="btn-ghost"
                style={{
                  fontSize: "11px",
                  padding: "3px 10px",
                  backgroundColor: "var(--surface-high)",
                  borderRadius: "14px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </form>

        {loading && (
          <div className="card-surface" style={{ padding: "36px", textAlign: "center", marginTop: "20px" }}>
            <p className="font-body-md" style={{ color: "var(--sandstone-text)" }}>
              Scanning institutional database...
            </p>
          </div>
        )}

        {error && (
          <div className="card-surface" style={{ padding: "16px", borderLeft: "4px solid var(--error-crimson)", marginTop: "20px" }} role="alert">
            <p className="font-body-sm" style={{ color: "var(--error-crimson)", margin: 0 }}>
              ⚠ {error}
            </p>
          </div>
        )}

        {!loading && !error && results && (
          <SearchResults announcements={results.announcements || []} events={results.events || []} />
        )}
      </main>
    </div>
  );
}