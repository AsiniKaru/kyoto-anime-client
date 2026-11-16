import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import ReactPlayer from "react-player";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Watch() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const ep = sp.get("ep") || sp.get("n") || "1";
  const { user } = useAuth();
  const [anime, setAnime] = useState<any>(null);
  const [playerUrl, setPlayerUrl] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        const [a, cfg] = await Promise.all([api.get(`/anime/${id}`), api.get("/anime/player-config")]);
        setAnime(a.data.data);
        setPlayerUrl(cfg.data.placeholderVideoUrl);
        setNote(cfg.data.note);
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [id]);

  useEffect(() => {
    const save = async () => {
      if (!user || !anime || !id) return;
      try {
        await api.post("/user/history", {
          animeId: Number(id),
          episodeId: ep,
          episodeNumber: Number(ep) || undefined,
          title: anime.title,
          image: anime.images?.jpg?.image_url,
        });
      } catch {}
    };
    save();
  }, [user, anime, id, ep]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm">Now Playing (Placeholder Stream)</p>
          <h1 className="text-2xl font-bold">{anime?.title || "Loading..."} <span className="text-slate-400 font-normal">• Episode {ep}</span></h1>
        </div>
        {id && <Link to={`/anime/${id}`} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Back to Details</Link>}
      </div>

      <div className="rounded-2xl overflow-hidden glass shadow-glow aspect-video bg-black">
        {playerUrl ? (
          <ReactPlayer url={playerUrl} controls width="100%" height="100%" />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-400">Loading player...</div>
        )}
      </div>

      <div className="mt-4 glass rounded-xl p-4 text-sm text-slate-300">
        <p className="font-medium text-white mb-1">Playback note</p>
        <p>{note || "This player uses a placeholder video because Jikan provides metadata only and not streaming sources."}</p>
        {!user && <p className="mt-2 text-amber-300">Login to save this episode to your watch history.</p>}
      </div>

      {anime?.trailer?.embed_url && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Official Trailer</h2>
          <div className="rounded-xl overflow-hidden glass aspect-video">
            <iframe src={anime.trailer.embed_url} className="w-full h-full" allowFullScreen title="Trailer" />
          </div>
        </div>
      )}
    </div>
  );
}
