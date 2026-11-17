import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import AnimePlayer from "../components/AnimePlayer";
import api, { apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Anime } from "../types";

export default function Watch() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const ep = sp.get("ep") || sp.get("n") || "1";
  const { user } = useAuth();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [trailer, setTrailer] = useState<any>(null);
  const [playerUrl, setPlayerUrl] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");

  const embedTemplate = (import.meta.env.VITE_EMBED_URL_TEMPLATE as string) || "";

  // 1. Check if the URL is from YouTube
  const isYouTubeEmbed = useMemo(() => {
    return /youtube\.com|youtu\.be/i.test(playerUrl);
  }, [playerUrl]);

  // 2. Format the URL so it always uses the safe /embed/ format
  const formattedPlayerUrl = useMemo(() => {
    if (isYouTubeEmbed && !playerUrl.includes('/embed/')) {
      const videoId = playerUrl.split('v=')[1]?.split('&')[0] || playerUrl.split('youtu.be/')[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : playerUrl;
    }
    return playerUrl;
  }, [playerUrl, isYouTubeEmbed]);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        setError("");
        const a = await api.get(`/anime/${id}`);
        const fetchedAnime = a.data?.data?.anime ?? a.data?.anime ?? a.data;
        setAnime(fetchedAnime);
        setTrailer(a.data?.data?.trailer ?? a.data?.trailer ?? null);

        let customStreamUrl = "";

        if (fetchedAnime?.type === "Movie" || fetchedAnime?.type === "MOVIE") {
          customStreamUrl = fetchedAnime.videoUrl || "";
        } else if (Array.isArray(fetchedAnime?.episodes) && fetchedAnime.episodes.length > 0) {
          const currentEpisodeData = fetchedAnime.episodes.find(
            (episode: any) => episode.episodeNumber === Number(ep)
          );
          if (currentEpisodeData) {
            customStreamUrl = currentEpisodeData.videoUrl || "";
          }
        }

        if (customStreamUrl) {
          setPlayerUrl(customStreamUrl);
          setNote("Playing directly from Kyoto Anime's custom streaming server.");
        } else {
          const fallbackUrl = embedTemplate
            ? embedTemplate.replace("{malId}", id).replace("{episode}", ep)
            : (fetchedAnime?.trailer?.embedUrl || fetchedAnime?.trailer?.url || "");
          setPlayerUrl(fallbackUrl);
          setNote("Custom video not found. Showing the official trailer instead.");
        }
      } catch (e) {
        console.error(e);
        setError(apiErrorMessage(e));
      }
    };
    void run();
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
      } catch {
        // best effort; ignore duplicate-key races
      }
    };
    void save();
  }, [user, anime, id, ep]);

  const trailerEmbed = useMemo(
    () => trailer?.embedUrl || anime?.trailer?.embedUrl,
    [trailer, anime]
  );

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-rose-400">{error}</p>
        <Link to="/" className="text-accent hover:underline">Back home</Link>
      </div>
    );
  }

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
          isYouTubeEmbed ? (
            <iframe
              src={formattedPlayerUrl} // <-- Now correctly using the formatted URL
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Player"
            />
          ) : (
            <AnimePlayer videoUrl={playerUrl} />
          )
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-400">Loading player...</div>
        )}
      </div>

      <div className="mt-4 glass rounded-xl p-4 text-sm text-slate-300">
        <p className="font-medium text-white mb-1">Playback note</p>
        <p>{note || "No stream available yet."}</p>
        {!user && <p className="mt-2 text-amber-300">Login to save this episode to your watch history.</p>}
      </div>

      {trailerEmbed && trailerEmbed !== playerUrl && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Official Trailer</h2>
          <div className="rounded-xl overflow-hidden glass aspect-video">
            <iframe
              src={trailerEmbed}
              className="w-full h-full"
              allowFullScreen
              title="Trailer"
            />
          </div>
        </div>
      )}
    </div>
  );
}