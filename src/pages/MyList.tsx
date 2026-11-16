import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchLibrary, removeFromWatchlist, updateWatchlistStatus } from "../store/slices/librarySlice";
import { WATCH_STATUS_LABELS, WATCH_STATUS_OPTIONS } from "../utils/format";
import type { WatchStatus } from "../types";

export default function MyList() {
  const dispatch = useAppDispatch();
  const { watchlist, status } = useAppSelector((state) => state.library);
  const [filter, setFilter] = useState<WatchStatus | "all">("all");

  useEffect(() => {
    void dispatch(fetchLibrary());
  }, [dispatch]);

  const visible = filter === "all" ? watchlist : watchlist.filter((w) => w.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My List</h1>
      <p className="text-slate-400 mb-6">Track what you are watching, planning, or completed.</p>

      <div className="library-tabs mb-6">
        <button
          className={`filter-btn ${filter === "all" ? "is-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({watchlist.length})
        </button>
        {WATCH_STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-btn ${filter === opt.value ? "is-active" : ""}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label} ({watchlist.filter((w) => w.status === opt.value).length})
          </button>
        ))}
      </div>

      {status === "loading" ? <p className="text-slate-400">Loading...</p> : null}

      {visible.length === 0 ? (
        <div className="empty-state">
          <p className="muted">No titles in this list yet.</p>
          <Link to="/search" className="btn btn-primary btn-sm">Browse anime</Link>
        </div>
      ) : (
        <div className="saved-grid">
          {visible.map((entry) => (
            <div key={entry._id} className="saved-card">
              <Link to={`/anime/${entry.malId}`} className="saved-card__poster">
                {entry.image ? <img src={entry.image} alt={entry.title} /> : null}
              </Link>
              <div className="saved-card__body">
                <Link to={`/anime/${entry.malId}`} className="saved-card__title">{entry.title}</Link>
                <span className="saved-card__status">
                  {WATCH_STATUS_LABELS[entry.status]}
                </span>
                <div className="saved-card__actions">
                  <select
                    value={entry.status}
                    onChange={(e) =>
                      dispatch(updateWatchlistStatus({ malId: entry.malId, status: e.target.value as WatchStatus }))
                    }
                    className="filter-select__control"
                  >
                    {WATCH_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => dispatch(removeFromWatchlist(entry.malId))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
