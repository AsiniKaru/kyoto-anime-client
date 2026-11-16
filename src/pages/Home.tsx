import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import AnimeCard from "../components/AnimeCard";
import type { AnimeCardData } from "../types";

export default function Home() {
  const [popular, setPopular] = useState<AnimeCardData[]>([]);
  const [season, setSeason] = useState<AnimeCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setError("");
        const [p, s] = await Promise.all([
          api.get("/anime/top", { params: { filter: "bypopularity", page: 1 } }),
          api.get("/anime/season/now", { params: { page: 1 } }),
        ]);
        setPopular(p.data.data?.slice(0, 12) || []);
        setSeason(s.data.data?.slice(0, 12) || []);
        setUsingMock(p.data.source === "mock" || s.data.source === "mock");
      } catch (e: any) {
        console.error(e);
        setError(e?.response?.data?.message || e?.message || "Failed to load anime data.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-6">
        <div className="rounded-3xl overflow-hidden glass p-8 md:p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-accent2/20" />
          <div className="relative max-w-2xl">
            <p className="text-accent font-medium mb-2">Welcome to Kyoto Anime</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">Discover, track, and enjoy anime in a cinematic space.</h1>
            <p className="text-slate-300 mb-6">Browse titles, explore details, and stream in our player UI powered by Jikan metadata with placeholder playback.</p>
            <div className="flex gap-3">
              <Link to="/search" className="px-5 py-2.5 rounded-lg bg-accent hover:bg-rose-600 font-medium">Start Browsing</Link>
              <Link to="/register" className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20">Create Account</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6">
        {usingMock && !error && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
            <p className="font-medium">Showing sample anime data</p>
            <p className="text-sm mt-1">Jikan API couldn’t be reached from your network/server, so the app is using a local fallback so you can continue using and demoing the site.</p>
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
            <p className="font-medium">Couldn’t load anime from Jikan</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2 text-rose-100/80">Check your internet connection, make sure the server is running, and try again. Jikan may be temporarily slow, rate-limited, or unreachable from your network.</p>
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Popular Anime</h2>
          <Link to="/search" className="text-sm text-slate-400 hover:text-white">View all</Link>
        </div>
        {loading ? <p className="text-slate-400">Loading...</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popular.map((a) => <AnimeCard key={a.mal_id} anime={a} />)}
            {!popular.length && !error && <p className="text-slate-400 col-span-full">No popular anime loaded.</p>}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6 pb-12">
        <h2 className="text-xl font-semibold mb-4">This Season</h2>
        {loading ? <p className="text-slate-400">Loading...</p> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {season.map((a) => <AnimeCard key={a.mal_id} anime={a} />)}
            {!season.length && !error && <p className="text-slate-400 col-span-full">No seasonal anime loaded.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
