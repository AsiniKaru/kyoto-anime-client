import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { AnimeCardData, EpisodeData } from "../types";

export default function AnimeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        const [a, e] = await Promise.all([
          api.get(`/anime/${id}`),
          api.get(`/anime/${id}/episodes`, { params: { page: 1 } }),
        ]);
        setAnime(a.data.data);
        setEpisodes(e.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const addWatchlist = async () => {
    if (!user || !anime) return;
    try {
      await api.post("/user/watchlist", {
        animeId: anime.mal_id,
        title: anime.title,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        status: anime.status,
      });
      setMsg("Added to watchlist");
    } catch {
      setMsg("Failed to add to watchlist");
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-10 text-slate-400">Loading...</div>;
  if (!anime) return <div className="max-w-7xl mx-auto px-4 py-10">Anime not found.</div>;

  const img = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        <div>
          <div className="rounded-2xl overflow-hidden glass">
            {img && <img src={img} alt={anime.title} className="w-full" />}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Link to={`/watch/${anime.mal_id}`} className="text-center px-4 py-2.5 rounded-lg bg-accent hover:bg-rose-600 font-medium">Open Player</Link>
            {user && <button onClick={addWatchlist} className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20">Add to Watchlist</button>}
            {msg && <p className="text-sm text-emerald-400">{msg}</p>}
          </div>
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{anime.title}</h1>
          <p className="text-slate-400 mb-4">{anime.title_japanese || ""}</p>
          <div className="flex flex-wrap gap-2 text-xs mb-4">
            {anime.score && <span className="px-2 py-1 rounded bg-white/10">★ {anime.score}</span>}
            {anime.year && <span className="px-2 py-1 rounded bg-white/10">{anime.year}</span>}
            {anime.status && <span className="px-2 py-1 rounded bg-white/10">{anime.status}</span>}
            {anime.episodes && <span className="px-2 py-1 rounded bg-white/10">{anime.episodes} eps</span>}
            {anime.type && <span className="px-2 py-1 rounded bg-white/10">{anime.type}</span>}
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {anime.genres?.map((g: any) => <span key={g.mal_id} className="text-xs px-2.5 py-1 rounded-full border border-white/15 text-slate-300">{g.name}</span>)}
          </div>
          <h2 className="font-semibold mb-2">Synopsis</h2>
          <p className="text-slate-300 leading-relaxed mb-8 whitespace-pre-line">{anime.synopsis || "No synopsis available."}</p>

          <h2 className="font-semibold mb-3">Episodes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[420px] overflow-auto pr-1">
            {episodes.length ? episodes.map((ep) => (
              <Link key={ep.mal_id} to={`/watch/${anime.mal_id}?ep=${ep.mal_id}&n=${ep.mal_id}`} className="glass rounded-lg px-3 py-2 hover:bg-white/10">
                <div className="text-sm font-medium">Episode {ep.mal_id}</div>
                <div className="text-xs text-slate-400 line-clamp-1">{ep.title || "Untitled"}</div>
              </Link>
            )) : <p className="text-slate-400">No episode data available from Jikan.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
