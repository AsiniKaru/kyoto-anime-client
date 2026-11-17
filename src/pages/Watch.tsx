import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ReactPlayer from "react-player";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { animeApi } from "../api/anime";
import ReviewSection from "../components/ReviewSection";
import Spinner from "../components/Spinner";
import PosterImage from "../components/PosterImage";
import type { Anime, Character, Episode, Recommendation, ResolvedTrailer } from "../types";

export default function Watch() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const ep = sp.get("ep") || sp.get("n") || "1";
  const { user } = useAuth();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [trailer, setTrailer] = useState<ResolvedTrailer | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string>("");
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeMeta, setEpisodeMeta] = useState<{ pagination: { lastPage: number; hasNextPage: boolean } } | null>(null);
  const [episodePage, setEpisodePage] = useState(1);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const embedTemplate = (import.meta.env.VITE_EMBED_URL_TEMPLATE as string) || "";

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    animeApi
      .getById(id)
      .then((res) => {
        if (cancelled) return;
        setAnime(res.data.anime);
        setTrailer(res.data.trailer);
        const url = embedTemplate
          ? embedTemplate.replace("{malId}", id).replace("{episode}", ep)
          : (res.data.trailer?.embedUrl || "");
        setPlayerUrl(url);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    animeApi.getCharacters(id).then((r) => { if (!cancelled) setCharacters(r.data || []); }).catch(() => {});
    animeApi.getRecommendations(id).then((r) => { if (!cancelled) setRecommendations(r.data || []); }).catch(() => {});

    return () => { cancelled = true; };
  }, [id, ep, embedTemplate]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    animeApi
      .getEpisodes(id, episodePage)
      .then((r) => {
        if (cancelled) return;
        setEpisodes(r.data || []);
        setEpisodeMeta(r.meta ? { pagination: r.meta.pagination } : null);
      })
      .catch(() => { if (!cancelled) setEpisodes([]); });
    return () => { cancelled = true; };
  }, [id, episodePage]);

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

  const trailerEmbed = trailer?.embedUrl || anime?.trailer?.embedUrl;

  if (loading) return <Spinner label="Loading player..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm">Now Playing</p>
          <h1 className="text-2xl font-bold">
            {anime?.title || "Loading..."}{" "}
            <span className="text-slate-400 font-normal">• Episode {ep}</span>
          </h1>
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

      {trailerEmbed && trailerEmbed !== playerUrl && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Official Trailer</h2>
          <div className="rounded-xl overflow-hidden glass aspect-video">
            <iframe src={trailerEmbed} className="w-full h-full" allowFullScreen title="Trailer" />
          </div>
        </div>
      )}

      {/* Where to watch officially */}
      {anime?.streaming?.length ? (
        <section className="detail-section mt-8">
          <h2>Where to watch officially</h2>
          <div className="stream-links">
            {anime.streaming.map((platform) => (
              <a key={platform.name} href={platform.url} target="_blank" rel="noreferrer" className="stream-link">
                {platform.name}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {/* Episodes */}
      {episodes.length ? (
        <section className="detail-section mt-8">
          <div className="section-title-row">
            <h2>Episodes</h2>
            {episodeMeta?.pagination ? (
              <span className="muted">
                Page {episodePage} {episodeMeta.pagination.lastPage > 1 ? `of ${episodeMeta.pagination.lastPage}` : ''}
              </span>
            ) : null}
          </div>
          <div className="episode-grid">
            {episodes.map((episode) => (
              <Link key={episode.number} to={`/watch/${anime?.malId}?ep=${episode.number}`} className="episode-tile">
                <span className="episode-tile__number">{episode.number}</span>
                <span className="episode-tile__title">{episode.title}</span>
                <span className="episode-tile__meta">
                  {episode.filler ? 'Filler' : episode.recap ? 'Recap' : 'Episode'}
                </span>
              </Link>
            ))}
          </div>
          {episodeMeta?.pagination && episodeMeta.pagination.lastPage > 1 && (
            <div className="episode-pager">
              <button type="button" className="btn btn-ghost" disabled={episodePage <= 1} onClick={() => setEpisodePage((p) => Math.max(1, p - 1))}>
                Previous
              </button>
              <span className="muted">{episodePage} / {episodeMeta.pagination.lastPage}</span>
              <button type="button" className="btn btn-ghost" disabled={!episodeMeta.pagination.hasNextPage} onClick={() => setEpisodePage((p) => p + 1)}>
                Next
              </button>
            </div>
          )}
        </section>
      ) : null}

      {/* Main characters */}
      {characters.length ? (
        <section className="detail-section mt-8">
          <h2>Main characters</h2>
          <div className="character-grid">
            {characters.map((character) => (
              <div className="character-card" key={character.malId}>
                <PosterImage src={character.image} alt={character.name} seed={character.malId} />
                <div>
                  <strong>{character.name}</strong>
                  <span>{character.role}</span>
                  {character.voiceActor ? <small>{character.voiceActor}</small> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* You might also like */}
      {recommendations.length ? (
        <section className="detail-section mt-8">
          <h2>You might also like</h2>
          <div className="mini-grid">
            {recommendations.map((item) => (
              <Link key={item.malId} to={`/anime/${item.malId}`} className="mini-card">
                <PosterImage src={item.image} alt={item.title} seed={item.malId} />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Reviews */}
      {anime ? (
        <section className="detail-section mt-8">
          <ReviewSection malId={anime.malId} animeTitle={anime.title} />
        </section>
      ) : null}
    </div>
  );
}
