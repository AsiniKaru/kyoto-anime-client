import { useState } from 'react';
import { aiApi } from '../api/ai';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AnimeCard from '../components/AnimeCard';
import Spinner from '../components/Spinner';
import type { Anime } from '../types';

export default function AIRecommender() {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState('');
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
      const response = await aiApi.recommend(prompt);
      setResults(response.recommendations || []);
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
          <span className="page-heading__eyebrow">AI</span>
          <h1>Anime recommender</h1>
          <p className="page-heading__sub">
            Describe what you want in natural language and get tailored suggestions.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="filterbar mb-6">
        <div className="filterbar__top">
          <div className="filterbar__search">
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="e.g. a short, emotional sports anime with great music"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Thinking...' : 'Recommend'}
          </button>
        </div>
      </form>

      {error && <p className="alert alert--error">{error}</p>}

      {loading ? (
        <Spinner label="Generating recommendations..." />
      ) : (
        <div className="anime-grid">
          {results.map((anime) => (
            <AnimeCard key={anime.malId} anime={anime} />
          ))}
          {!results.length && !error && (
            <p className="muted">Describe what you want and hit Recommend.</p>
          )}
        </div>
      )}
    </div>
  );
}
