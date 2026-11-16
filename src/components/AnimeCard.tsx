import { Link } from "react-router-dom";
import type { AnimeCardData } from "../types";

export default function AnimeCard({ anime }: { anime: AnimeCardData }) {
  const img = anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  return (
    <Link to={`/anime/${anime.mal_id}`} className="group block rounded-xl overflow-hidden glass hover:shadow-glow transition">
      <div className="aspect-[2/3] overflow-hidden bg-white/5">
        {img ? <img src={img} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy" /> : null}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-white">{anime.title}</h3>
        <div className="mt-1 text-xs text-slate-400 flex items-center gap-2">
          {anime.score ? <span>★ {anime.score}</span> : <span>★ N/A</span>}
          {anime.year ? <span>• {anime.year}</span> : null}
        </div>
      </div>
    </Link>
  );
}
