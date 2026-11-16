import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import AnimeCard from "../components/AnimeCard";
import Spinner from "../components/Spinner";
import type { Anime, HomeData } from "../types";

export default function Home() {
  const [home, setHome] = useState<HomeData | null>(null);
  const [season, setSeason] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const run = async () => {
      try {
        setError("");
        const [homeRes, seasonRes] = await Promise.all([
          api.get("/anime/home"),
          api.get("/anime/seasonal", { params: { limit: 18 } }),
        ]);
        setHome(homeRes.data.data || null);
        setSeason(seasonRes.data.data || []);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load anime data.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const heroList = (home?.hero?.length ? home.hero : home?.trending || []).slice(0, 6);
  const hero = heroList[active] || heroList[0];

  // Auto-rotate hero slides
  useEffect(() => {
    if (heroList.length <= 1) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % heroList.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroList.length]);

  const rows = [
    { title: "Trending Now", list: home?.trending || [] },
    { title: "This Season", list: season },
    { title: "Top Rated", list: home?.topRated || [] },
    { title: "Upcoming", list: home?.upcoming || [] },
  ];

  return (
    <div className="page--home">
      {/* Floating hero slides */}
      {loading ? (
        <div className="hero"><Spinner label="Loading..." /></div>
      ) : hero ? (
        <section className="hero">
          <div
            className="hero__backdrop"
            style={{ backgroundImage: `url(${hero.backdrop || hero.image})` }}
          />
          <div className="hero__scrim" />
          <div className="container hero__inner">
            <div className="hero__content">
              <span className="hero__eyebrow">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7" }} />
                Featured
              </span>
              <h1>{hero.title}</h1>
              {hero.titleJapanese ? <p className="hero__jp" style={{ color: "#9aa3b8", fontSize: "0.9rem", marginBottom: 10 }}>{hero.titleJapanese}</p> : null}
              <div className="hero__meta">
                {hero.score ? <span className="score-badge">★ {hero.score}</span> : null}
                {hero.year ? <span>{hero.year}</span> : null}
                {hero.episodes ? <span>{hero.episodes} eps</span> : null}
                {hero.type ? <span>{hero.type}</span> : null}
                {hero.status ? <span>{hero.status}</span> : null}
              </div>
              <p className="hero__synopsis" style={{ color: "#cfd5e6", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 600, marginBottom: 22, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {hero.synopsis || "No synopsis available."}
              </p>
              <div className="hero__actions">
                <Link to={`/watch/${hero.malId}`} className="btn btn-primary btn-lg">
                  ▶ Watch now
                </Link>
                <Link to={`/anime/${hero.malId}`} className="btn btn-ghost btn-lg">
                  More info
                </Link>
              </div>
            </div>
            <div className="hero__poster">
              <img src={hero.image} alt={hero.title} style={{ width: 230, height: 345, objectFit: "cover", borderRadius: 16, boxShadow: "0 20px 60px -20px rgba(0,0,0,0.8)" }} />
            </div>
          </div>

          {/* Slide dots */}
          {heroList.length > 1 && (
            <div className="hero__dots" style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 5 }}>
              {heroList.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  style={{
                    width: i === active ? 24 : 8,
                    height: 8,
                    borderRadius: 999,
                    border: "none",
                    background: i === active ? "#a855f7" : "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {error && (
        <div className="max-w-7xl mx-auto px-4 mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          <p className="font-medium">Couldn't load anime</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Horizontal rows */}
      {rows.map((section) =>
        !loading && section.list.length ? (
          <RowSection key={section.title} title={section.title} list={section.list} />
        ) : null
      )}

      {loading && <p className="max-w-7xl mx-auto px-4 text-slate-400">Loading...</p>}
    </div>
  );
}

function RowSection({ title, list }: { title: string; list: Anime[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section className="row-section max-w-7xl mx-auto px-4">
      <div className="row-section__head">
        <div>
          <h2>{title}</h2>
        </div>
        <Link to="/browse" className="row-section__link">View all →</Link>
      </div>
      <div className="row-section__viewport">
        <button type="button" className="row-arrow row-arrow--left" onClick={() => scroll(-1)} aria-label="Scroll left">
          ‹
        </button>
        <div className="row-section__scroller" ref={scrollerRef}>
          {list.map((a) => (
            <AnimeCard key={a.malId} anime={a} />
          ))}
        </div>
        <button type="button" className="row-arrow row-arrow--right" onClick={() => scroll(1)} aria-label="Scroll right">
          ›
        </button>
      </div>
    </section>
  );
}
