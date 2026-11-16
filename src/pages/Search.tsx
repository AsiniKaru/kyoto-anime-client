import { useEffect, useState } from "react";
import api from "../api/client";
import AnimeCard from "../components/AnimeCard";
import type { AnimeCardData } from "../types";

export default function Search() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<AnimeCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usingMock, setUsingMock] = useState(false);

  const runSearch = async (query: string) => {
    setLoading(true);
    try {
      setError("");
      const { data } = await api.get("/anime/search", { params: { q: query, limit: 24, page: 1 } });
      setResults(data.data || []);
      setUsingMock(data.source === "mock");
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || e?.message || "Search failed.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runSearch(""); }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(q);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Browse Anime</h1>
      <p className="text-slate-400 mb-6">Search titles and discover your next watch (metadata from Jikan/MyAnimeList).</p>
      <form onSubmit={onSubmit} className="flex gap-2 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search anime..."
          className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 outline-none focus:border-accent"
        />
        <button className="px-5 py-2.5 rounded-lg bg-accent hover:bg-rose-600 font-medium">Search</button>
      </form>
      {usingMock && !error && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
          <p className="font-medium">Showing sample anime data</p>
          <p className="text-sm mt-1">Jikan API is unreachable right now, so search is using local fallback results.</p>
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          <p className="font-medium">Couldn’t fetch anime</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      {loading ? <p className="text-slate-400">Searching...</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((a) => <AnimeCard key={a.mal_id} anime={a} />)}
          {!results.length && !error && <p className="text-slate-400 col-span-full">No results found.</p>}
        </div>
      )}
    </div>
  );
}
