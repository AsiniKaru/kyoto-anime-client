import { useState } from 'react';
import { aiApi } from '../api/ai';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AnimeCard from '../components/AnimeCard';
import Spinner from '../components/Spinner';
import type { Anime } from '../types';

export default function MagicSearch() {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await aiApi.magicSearch(query);
      setResults(response.results || []);
    } catch (submitError) {
      setError(apiErrorMessage(submitError));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <div className="page-heading">
        <div>
          <span className="page-heading__eyebrow">Magic Search</span>
          <h1>Search by vibe</h1>
          <p className="page-heading__sub">
            Describe what you want in natural language — Kyoto will find the anime for you.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="filterbar mb-6">
        <div className="filterbar__top">
          <div className="filterbar__search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='e.g. "a sad romance where they don&apos;t end up together"'
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : '✨ Magic Search'}
          </button>
        </div>
      </form>

      {error && <p className="alert alert--error">{error}</p>}

      {loading ? (
        <Spinner label="Kyoto is thinking..." />
      ) : (
        <div className="anime-grid">
          {results.map((anime) => (
            <AnimeCard key={anime.malId} anime={anime} />
          ))}
          {!results.length && !error && (
            <p className="muted">Describe a vibe and hit Magic Search.</p>
          )}
        </div>
      )}
    </div>
  );
}
