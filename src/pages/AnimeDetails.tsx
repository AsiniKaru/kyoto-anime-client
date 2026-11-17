import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  ExternalLink,
  Film,
  ListVideo,
  Play,
  Star,
  Trophy,
  Tv,
  Users,
} from 'lucide-react';
import { animeApi } from '../api/anime';
import { apiErrorMessage } from '../api/client';
import AddToListButton from '../components/AddToListButton';
import PosterImage, { BackdropImage } from '../components/PosterImage';
import ReviewSection from '../components/ReviewSection';
import Spinner from '../components/Spinner';
import TrailerModal from '../components/TrailerModal';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { cleanSynopsis, formatCount, formatScore } from '../utils/format';
import type {
  Anime,
  Character,
  Episode,
  Pagination,
  Recommendation,
  ResolvedTrailer,
} from '../types';

interface DetailsData {
  anime: Anime;
  trailer: ResolvedTrailer;
}

interface EpisodeMeta {
  pagination: Pagination;
  totalEpisodes: number;
}

export default function AnimeDetails() {
  const { id } = useParams<{ id: string }>();

  const [details, setDetails] = useState<DetailsData | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeMeta, setEpisodeMeta] = useState<EpisodeMeta | null>(null);
  const [episodePage, setEpisodePage] = useState(1);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const anime = details?.anime;
  const trailer = details?.trailer;

  useDocumentTitle(anime?.title || 'Anime details');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Invalid anime id.');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    animeApi
      .getById(id)
      .then((response) => {
        if (!cancelled) setDetails(response.data);
      })
      .catch((loadError) => {
        if (!cancelled) setError(apiErrorMessage(loadError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    animeApi
      .getRecommendations(id)
      .then((response) => {
        if (!cancelled) setRecommendations(response.data || []);
      })
      .catch(() => {});

    animeApi
      .getCharacters(id)
      .then((response) => {
        if (!cancelled) setCharacters(response.data || []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;

    let cancelled = false;
    animeApi
      .getEpisodes(id, episodePage)
      .then((response) => {
        if (cancelled) return;
        setEpisodes(response.data || []);
        setEpisodeMeta(response.meta || null);
      })
      .catch(() => {
        if (!cancelled) setEpisodes([]);
      });
    return () => {
      cancelled = true;
    };
  }, [id, episodePage]);

  const stats = useMemo(() => {
    if (!anime) return [];
    return [
      { icon: Star, label: 'Score', value: `${formatScore(anime.score)} / 10` },
      { icon: Trophy, label: 'Ranked', value: anime.rank ? `#${anime.rank}` : '—' },
      { icon: Users, label: 'Members', value: formatCount(anime.members) },
      { icon: Film, label: 'Favourites', value: formatCount(anime.favorites) },
    ];
  }, [anime]);

  if (loading) return <Spinner label="Loading anime details..." />;

  if (error || !anime) {
    return (
      <div className="container page">
        <div className="error-box">
          <h2>We could not load this anime</h2>
          <p>{error || 'Unknown anime.'}</p>
          <Link to="/browse" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to browse
          </Link>
        </div>
      </div>
    );
  }

  const synopsis = cleanSynopsis(anime.synopsis);
  const isLongSynopsis = synopsis.length > 420;
  const shownSynopsis = expanded || !isLongSynopsis ? synopsis : `${synopsis.slice(0, 420)}…`;
  const episodePagination = episodeMeta?.pagination;

  const episodeCount = Array.isArray(anime.episodes) ? anime.episodes.length : anime.episodes;
  
  return (
    <div className="page page--details">
      <div className="detail-hero">
        <BackdropImage
          className="detail-hero__backdrop"
          src={anime.backdrop || trailer?.image || anime.trailer?.image || anime.image}
          seed={anime.malId}
        />
        <div className="detail-hero__scrim" />

        <div className="container detail-hero__inner">
          <div className="detail-poster">
            <PosterImage src={anime.image} alt={anime.title} seed={anime.malId} loading="eager" />
          </div>

          <div className="detail-info">
            <div className="detail-info__badges">
              {anime.type ? <span className="tag">{anime.type}</span> : null}
              {anime.status ? <span className="tag tag--soft">{anime.status}</span> : null}
              {anime.airing ? <span className="tag tag--live">Airing now</span> : null}
              {anime.rating ? <span className="tag tag--soft">{anime.rating}</span> : null}
              {anime.cached ? <span className="tag tag--soft">Cached</span> : null}
            </div>

            <h1>{anime.title}</h1>
            {anime.titleJapanese ? <p className="detail-info__jp">{anime.titleJapanese}</p> : null}

            <div className="detail-info__meta">
              {anime.year ? (
                <span>
                  <CalendarDays size={14} />{' '}
                  {anime.season
                    ? `${anime.season.charAt(0).toUpperCase()}${anime.season.slice(1)} `
                    : ''}
                  {anime.year}
                </span>
              ) : null}
             {episodeCount ? (
                <span>
                  <Tv size={14} /> {episodeCount as number}{' '}
                  {episodeCount === 1 ? 'episode' : 'episodes'}
                </span>
              ) : null}
              {anime.duration ? (
                <span>
                  <Clock3 size={14} /> {anime.duration}
                </span>
              ) : null}
              {anime.studios?.length ? <span>{anime.studios.join(', ')}</span> : null}
            </div>

            <div className="detail-info__score">
              <span className="big-score">
                <Star size={18} fill="currentColor" /> {formatScore(anime.score)}
              </span>
              <span className="muted">
                {anime.scoredBy ? `${formatCount(anime.scoredBy)} ratings · ` : ''}
                {formatCount(anime.members)} members
              </span>
            </div>

            <div className="detail-info__genres">
              {[...anime.genres, ...anime.themes].map((genre) => (
                <Link
                  key={`${genre.malId}-${genre.name}`}
                  to={`/browse?genres=${genre.malId}`}
                  className="genre-pill"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            <div className="detail-info__actions">
              <Link to={`/watch/${anime.malId}`} className="btn btn-primary btn-lg">
                <Play size={18} fill="currentColor" /> Watch now
              </Link>
              {trailer?.videoId || trailer?.embedUrl ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-lg"
                  onClick={() => setTrailerOpen(true)}
                >
                  <Film size={18} /> Trailer
                </button>
              ) : null}
              <AddToListButton anime={anime} />
              {anime.externalUrl ? (
                <a
                  href={anime.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-lg"
                  title="View on AniList"
                >
                  <ExternalLink size={17} /> AniList
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="container detail-body">
        <section className="detail-section">
          <h2>Synopsis</h2>
          <p className="synopsis">{shownSynopsis}</p>
          {isLongSynopsis ? (
            <button
              type="button"
              className="link-btn"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? (
                <>
                  Show less <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Read more <ChevronDown size={14} />
                </>
              )}
            </button>
          ) : null}

          <div className="stat-grid">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <stat.icon size={18} />
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </section>

        {anime.streaming?.length ? (
          <section className="detail-section">
            <h2>Where to watch officially</h2>
            <div className="stream-links">
              {anime.streaming.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noreferrer"
                  className="stream-link"
                >
                  {platform.name} <ExternalLink size={13} />
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <section className="detail-section">
          <div className="section-title-row">
            <h2>
              <ListVideo size={20} /> Episodes
            </h2>
            {episodeMeta?.pagination ? (
              <span className="muted">
                Page {episodeMeta.pagination.page}
                {episodeMeta.pagination.lastPage > 1
                  ? ` of ${episodeMeta.pagination.lastPage}`
                  : ''}
              </span>
            ) : null}
          </div>

          {episodes.length ? (
            <>
              <div className="episode-grid">
                {episodes.map((episode) => (
                  <Link
                    key={episode.number}
                    to={`/watch/${anime.malId}?ep=${episode.number}`}
                    className="episode-tile"
                  >
                    <span className="episode-tile__number">{episode.number}</span>
                    <span className="episode-tile__title">{episode.title}</span>
                    <span className="episode-tile__meta">
                      {episode.filler ? 'Filler' : episode.recap ? 'Recap' : 'Episode'}
                    </span>
                  </Link>
                ))}
              </div>

              {episodePagination && episodePagination.lastPage > 1 ? (
                <div className="episode-pager">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={episodePage <= 1}
                    onClick={() => setEpisodePage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </button>
                  <span className="muted">
                    {episodePage} / {episodePagination.lastPage}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={!episodePagination.hasNextPage}
                    onClick={() => setEpisodePage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <p className="muted">Episode information is not available for this title yet.</p>
          )}
        </section>

        {characters.length ? (
          <section className="detail-section">
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

        {recommendations.length ? (
          <section className="detail-section">
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

        <ReviewSection malId={anime.malId} animeTitle={anime.title} />
      </div>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={anime.title}
        trailer={trailer ?? null}
      />
    </div>
  );
}
