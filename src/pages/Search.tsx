import { useEffect, useState } from "react";
import { animeApi } from "../api/anime";
import { apiErrorMessage } from "../api/client";
import AnimeCard from "../components/AnimeCard";
import Spinner from "../components/Spinner";
import type { Anime } from "../types";
import useDebounce from "../hooks/useDebounce";

export default function Search() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 450);
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    animeApi
      .search({ q: debouncedQ, limit: 24, page: 1 })
      .then((response) => {
        if (cancelled) return;
        setResults(response.data || []);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(apiErrorMessage(loadError));
        setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Browse Anime</h1>
      <p className="text-slate-400 mb-6">Search titles and discover your next watch.</p>
      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search anime..."
          className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 outline-none focus:border-accent"
        />
      </form>
      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      {loading ? (
        <Spinner label="Searching..." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((a) => <AnimeCard key={a.malId} anime={a} />)}
          {!results.length && !error && <p className="text-slate-400 col-span-full">No results found.</p>}
        </div>
      )}
    </div>
  );
}
