import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import AnimePlayer from "../components/animePlayer"; // Replaced ReactPlayer with your custom HLS player
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

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
        const fetchedAnime = a.data.data?.anime || a.data; // Adapting to your backend response structure
        
        setAnime(fetchedAnime);
        setTrailer(a.data.data?.trailer || null);

        // 1. Logic to extract your custom Cloudinary HLS link from the database
        let customStreamUrl = "";
        
        if (fetchedAnime.type === "Movie" || fetchedAnime.type === "MOVIE") {
          customStreamUrl = fetchedAnime.videoUrl;
        } else if (fetchedAnime.episodes && fetchedAnime.episodes.length > 0) {
          // Find the specific episode in the array
          const currentEpisodeData = fetchedAnime.episodes.find(
            (episode: any) => episode.episodeNumber === Number(ep)
          );
          if (currentEpisodeData) {
            customStreamUrl = currentEpisodeData.videoUrl;
          }
        }

        // 2. Set the player URL (Custom HLS first, fallback to placeholders if empty)
        if (customStreamUrl) {
          setPlayerUrl(customStreamUrl);
          setNote("Playing directly from Kyoto Anime's custom streaming server.");
        } else {
          const fallbackUrl = embedTemplate
            ? embedTemplate.replace("{malId}", id).replace("{episode}", ep)
            : (fetchedAnime.trailer?.embedUrl || "");
          setPlayerUrl(fallbackUrl);
          setNote("Custom video not found. This player uses a fallback stream.");
        }

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
          <p className="text-slate-400 text-sm">Now Playing</p>
          <h1 className="text-2xl font-bold">
            {anime?.title || "Loading..."} <span className="text-slate-400 font-normal">Episode {ep}</span>
          </h1>
        </div>
        {id && <Link to={`/anime/${id}`} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Back to Details</Link>}
      </div>

      <div className="rounded-2xl overflow-hidden glass shadow-glow aspect-video bg-black">
        {playerUrl ? (
          // 3. Render your custom HLS Player
          <AnimePlayer videoUrl={playerUrl} />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-400">Loading player...</div>
        )}
      </div>

      <div className="mt-4 glass rounded-xl p-4 text-sm text-slate-300">
        <p className="font-medium text-white mb-1">Playback note</p>
        <p>{note}</p>
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