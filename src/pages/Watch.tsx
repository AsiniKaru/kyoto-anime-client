import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import ReactPlayer from "react-player";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";

export default function Watch() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const ep = sp.get("ep") || sp.get("n") || "1";
  const { user } = useAuth();
  const [anime, setAnime] = useState<any>(null);
  const [trailer, setTrailer] = useState<any>(null);
  const [playerUrl, setPlayerUrl] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const embedTemplate = (import.meta.env.VITE_EMBED_URL_TEMPLATE as string) || "";

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        const a = await api.get(`/anime/${id}`);
        setAnime(a.data.data.anime);
        setTrailer(a.data.data.trailer);
        const url = embedTemplate
          ? embedTemplate.replace("{malId}", id).replace("{episode}", ep)
          : (a.data.data.trailer?.embedUrl || "");
        setPlayerUrl(url);
        setNote("This player uses a placeholder stream because AniList provides metadata only and not streaming sources.");
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [id, ep, embedTemplate]);

  useEffect(() => {
    const save = async () => {
      if (!user || !anime || !id) return;
      try {
        await api.post("/library/history", {
          malId: Number(id),
          title: anime.title,
          image: anime.image,
          episode: Number(ep) || 1,
          progress: 0,
          durationSeconds: 0,
        });
      } catch {}
    };
    save();
  }, [user, anime, id, ep]);

  const trailerEmbed = useMemo(() => trailer?.embedUrl || anime?.trailer?.embedUrl, [trailer, anime]);

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
        <p>{note || "This player uses a placeholder video because AniList provides metadata only and not streaming sources."}</p>
        {!user && <p className="mt-2 text-amber-300">Login to save this episode to your watch history.</p>}
      </div>

      {trailerEmbed && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Official Trailer</h2>
          <div className="rounded-xl overflow-hidden glass aspect-video">
            <iframe src={trailerEmbed} className="w-full h-full" allowFullScreen title="Trailer" />
          </div>
        </div>
      )}
    </div>
  );
}
