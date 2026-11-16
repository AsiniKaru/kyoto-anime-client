import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { animeApi, type SearchParams } from '../api/anime';
import { apiErrorMessage } from '../api/client';
import AnimeCard from '../components/AnimeCard';
import Spinner from '../components/Spinner';
import Dropdown, { type DropdownOption } from '../components/Dropdown';
import type { Anime, AnimeGenre } from '../types';
import useDebounce from '../hooks/useDebounce';

const SEASON_OPTIONS: DropdownOption[] = [
  { value: '', label: 'All seasons' },
  { value: 'winter', label: 'Winter' },
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
];

const TYPE_OPTIONS: DropdownOption[] = [
  { value: '', label: 'All types' },
  { value: 'tv', label: 'TV' },
  { value: 'movie', label: 'Movie' },
  { value: 'ova', label: 'OVA' },
  { value: 'ona', label: 'ONA' },
  { value: 'special', label: 'Special' },
];

const STATUS_OPTIONS: DropdownOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'airing', label: 'Airing' },
  { value: 'complete', label: 'Finished' },
  { value: 'upcoming', label: 'Upcoming' },
];

const SORT_OPTIONS: DropdownOption[] = [
  { value: 'popularity', label: 'Most popular' },
  { value: 'score', label: 'Highest rated' },
  { value: 'latest', label: 'Newest' },
  { value: 'title', label: 'Title A-Z' },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    genres: (searchParams.get('genres') || '').split(',').filter(Boolean),
    year: searchParams.get('year') || '',
    season: searchParams.get('season') || '',
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
    orderBy: searchParams.get('orderBy') || 'popularity',
    page: Number(searchParams.get('page')) || 1,
  });
  const debouncedQ = useDebounce(filters.q, 450);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<AnimeGenre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<{ page: number; lastPage: number; hasNextPage: boolean } | null>(null);
  const [genreOpen, setGenreOpen] = useState(false);

  useEffect(() => {
    animeApi.getGenres().then((response) => setGenres(response.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params: SearchParams = {
      q: debouncedQ,
      page: filters.page,
      limit: 24,
      genres: filters.genres.join(','),
      year: filters.year,
      season: filters.season,
      type: filters.type,
      status: filters.status,
      orderBy: filters.orderBy,
    };

    animeApi
      .search(params)
      .then((response) => {
        if (cancelled) return;
        setAnimeList(response.data || []);
        setPagination(response.meta?.pagination || null);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(apiErrorMessage(loadError));
        setAnimeList([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQ, filters]);

  const updateFilter = (key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const toggleGenre = (id: string) => {
    setFilters((prev) => {
      const current = prev.genres.includes(id)
        ? prev.genres.filter((item) => item !== id)
        : [...prev.genres, id];
      return { ...prev, genres: current, page: 1 };
    });
  };

  const yearOptions: DropdownOption[] = [
    { value: '', label: 'Any year' },
    ...Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i).map((y) => ({
      value: String(y),
      label: String(y),
    })),
  ];

  return (
    <div className="page container">
      <div className="page-heading">
        <div>
          <span className="page-heading__eyebrow">Browse</span>
          <h1>Discover anime</h1>
          <p className="page-heading__sub">Search by title, filter by genre, year, season, format and status.</p>
        </div>
      </div>

      <div className="filterbar">
        <div className="filterbar__top">
          <div className="filterbar__search">
            <input
              value={filters.q}
              onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value, page: 1 }))}
              placeholder="Search anime by title..."
            />
          </div>
          <span className="filterbar__count">{animeList.length} results</span>
        </div>
        <div className="filterbar__controls">
          <Dropdown label="Season" value={filters.season} options={SEASON_OPTIONS} onChange={(v) => updateFilter('season', v)} />
          <Dropdown label="Type" value={filters.type} options={TYPE_OPTIONS} onChange={(v) => updateFilter('type', v)} />
          <Dropdown label="Status" value={filters.status} options={STATUS_OPTIONS} onChange={(v) => updateFilter('status', v)} />
          <Dropdown label="Sort" value={filters.orderBy} options={SORT_OPTIONS} onChange={(v) => updateFilter('orderBy', v)} />
          <Dropdown label="Year" value={filters.year} options={yearOptions} onChange={(v) => updateFilter('year', v)} />

          <div className="genre-picker">
            <button
              type="button"
              className={`filter-btn ${filters.genres.length ? 'is-active' : ''}`}
              onClick={() => setGenreOpen((v) => !v)}
            >
              Genres {filters.genres.length ? `(${filters.genres.length})` : ''}
            </button>
            {genreOpen && (
              <div className="genre-panel">
                <div className="genre-panel__head">
                  <span>Genre</span>
                  <button type="button" onClick={() => setFilters((prev) => ({ ...prev, genres: [], page: 1 }))}>
                    Clear
                  </button>
                </div>
                <div className="genre-panel__list">
                  {genres.map((genre) => (
                    <button
                      key={genre.malId}
                      type="button"
                      className={`genre-option ${filters.genres.includes(String(genre.malId)) ? 'is-checked' : ''}`}
                      onClick={() => toggleGenre(String(genre.malId))}
                    >
                      <span className="genre-option__check" />
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="alert alert--error">{error}</p>}

      {loading ? (
        <Spinner label="Loading anime..." />
      ) : (
        <div className="anime-grid">
          {animeList.map((anime) => (
            <AnimeCard key={anime.malId} anime={anime} />
          ))}
          {!animeList.length && !error && (
            <p className="muted">No anime found for these filters.</p>
          )}
        </div>
      )}

      {pagination && pagination.lastPage > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="pagination__arrow"
            disabled={filters.page <= 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          >
            Previous
          </button>
          <span className="pagination__dots">
            {filters.page} / {pagination.lastPage}
          </span>
          <button
            type="button"
            className="pagination__arrow"
            disabled={!pagination.hasNextPage}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
