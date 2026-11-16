import { Link } from "react-router-dom";
import type { Anime } from "../types";

export default function AnimeCard({ anime }: { anime: Anime }) {
  const img = anime.image || anime.imageSmall;
  return (
    <Link to={`/anime/${anime.malId}`} className="anime-card block">
      <div className="anime-card__poster">
        {anime.score ? (
          <span className="score-badge">{anime.score.toFixed(1)}</span>
        ) : null}
        {anime.airing ? <span className="airing-badge">Airing</span> : null}
        {img ? (
          <img src={img} alt={anime.title} loading="lazy" />
        ) : null}
        <div className="anime-card__overlay">
          <span className="anime-card__play">▶</span>
          <span className="anime-card__overlay-text">View details</span>
        </div>
      </div>
      <div className="anime-card__info">
        <h3>{anime.title}</h3>
        <p>
          {anime.year ? anime.year : '—'} • {anime.type || 'Anime'}
        </p>
      </div>
    </Link>
  );
}
