import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const [w, h] = await Promise.all([api.get("/user/watchlist"), api.get("/user/history")]);
        setWatchlist(w.data.watchlist || []);
        setHistory(h.data.history || []);
      } catch (e) { console.error(e); }
    };
    run();
  }, []);

  const remove = async (animeId: number) => {
    try {
      const { data } = await api.delete(`/user/watchlist/${animeId}`);
      setWatchlist(data.watchlist || []);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{user?.username}'s Profile</h1>
        <p className="text-slate-400">{user?.email}</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">Watchlist</h2>
          <div className="space-y-3">
            {watchlist.length ? watchlist.map((item) => (
              <div key={item.animeId} className="glass rounded-xl p-3 flex items-center gap-3">
                {item.image && <img src={item.image} alt={item.title} className="w-14 h-20 object-cover rounded-md" />}
                <div className="flex-1 min-w-0">
                  <Link to={`/anime/${item.animeId}`} className="font-medium hover:text-white line-clamp-1">{item.title}</Link>
                  <p className="text-xs text-slate-400">{item.status || "Saved"}</p>
                </div>
                <button onClick={() => remove(item.animeId)} className="text-xs px-3 py-1.5 rounded bg-white/10 hover:bg-white/20">Remove</button>
              </div>
            )) : <p className="text-slate-400">No items in watchlist yet.</p>}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">Watch History</h2>
          <div className="space-y-3">
            {history.length ? history.map((item, idx) => (
              <Link key={`${item.animeId}-${item.episodeId}-${idx}`} to={`/watch/${item.animeId}?ep=${item.episodeId || 1}`} className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/10">
                {item.image && <img src={item.image} alt={item.title} className="w-14 h-20 object-cover rounded-md" />}
                <div className="min-w-0">
                  <div className="font-medium line-clamp-1">{item.title}</div>
                  <p className="text-xs text-slate-400">Episode {item.episodeNumber || item.episodeId || 1} • {new Date(item.watchedAt).toLocaleString()}</p>
                </div>
              </Link>
            )) : <p className="text-slate-400">No watch history yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
