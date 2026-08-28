"use client";

import { useState } from "react";
import SearchResults from "../../components/SearchResults";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!query.trim()) {
      setError("Enter a keyword to search.");
      setResults(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { credentials: "include" });
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

  function clear() {
    setQuery("");
    setResults(null);
    setError("");
  }

  return (
    <main className="search-page">
      <header><p>CampusHub</p><h1>Search</h1></header>
      <form onSubmit={submit} role="search">
        <label htmlFor="campus-search">Search announcements and events</label>
        <input id="campus-search" value={query} maxLength={100} onChange={(event) => setQuery(event.target.value)} placeholder="Search by keyword" />
        <button type="submit" disabled={loading}>{loading ? "Searching..." : "Search"}</button>
        <button type="button" onClick={clear} disabled={!query && !results && !error}>Clear</button>
      </form>
      {loading && <p>Searching campus content...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && results && <SearchResults announcements={results.announcements || []} events={results.events || []} />}
    </main>
  );
}