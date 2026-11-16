import { useEffect, useState } from "react";
import { libraryApi } from "../api/library";
import { apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Anime, WatchStatus } from "../types";
import toast from "react-hot-toast";

const STATUSES: WatchStatus[] = ['watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped'];

export default function AddToListButton({ anime }: { anime: Anime }) {
  const { user, isAuthenticated } = useAuth();
  const [entry, setEntry] = useState<{ status: WatchStatus } | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    libraryApi
      .getWatchlistEntry(anime.malId)
      .then((res: { data: { status: WatchStatus } | null }) => {
        if (!cancelled) setEntry(res && res.data ? { status: res.data.status } : null);
      })
      .catch((e) => {
        console.error('getWatchlistEntry failed', e);
      });
    return () => {
      cancelled = true;
    };
  }, [anime.malId, isAuthenticated]);

  const add = async (status: WatchStatus = 'plan_to_watch') => {
    if (!isAuthenticated) {
      toast.error('Please log in to add to your list');
      return;
    }
    if (!anime || !anime.malId) {
      toast.error('Invalid anime');
      return;
    }
    setLoading(true);
    try {
      const res = await libraryApi.addToWatchlist({
        malId: anime.malId,
        title: anime.title || 'Untitled',
        image: anime.image || '',
        year: anime.year ?? null,
        score: anime.score ?? null,
        type: anime.type || '',
        genres: (anime.genres || []).map((g) => g.name),
        status,
      });
      const newStatus = (res && res.data && res.data.status) ? res.data.status : status;
      setEntry({ status: newStatus });
      toast.success(`Added to ${newStatus.replace(/_/g, ' ')}`);
    } catch (e) {
      console.error('addToWatchlist failed', e);
      toast.error(apiErrorMessage(e));
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const changeStatus = async (status: WatchStatus) => {
    setLoading(true);
    try {
      const res = await libraryApi.updateWatchlistStatus(anime.malId, status);
      const newStatus = (res && res.data && res.data.status) ? res.data.status : status;
      setEntry({ status: newStatus });
      toast.success(`Moved to ${newStatus.replace(/_/g, ' ')}`);
    } catch (e) {
      console.error('updateWatchlistStatus failed', e);
      toast.error(apiErrorMessage(e));
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    try {
      await libraryApi.removeFromWatchlist(anime.malId);
      setEntry(null);
      toast.success("Removed from your list");
    } catch (e) {
      console.error('removeFromWatchlist failed', e);
      toast.error(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (!entry) {
    return (
      <button
        type="button"
        className="btn btn-primary btn-lg"
        onClick={() => add('plan_to_watch')}
        disabled={loading}
      >
        {loading ? "Adding..." : "+ Add to list"}
      </button>
    );
  }

  return (
    <div className="list-btn">
      <button
        type="button"
        className="btn btn-ghost btn-lg"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
      >
        {loading ? "Updating..." : `In list: ${entry.status.replace(/_/g, " ")} ▾`}
      </button>
      {open && (
        <div className="list-btn__menu">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`list-btn__option ${entry.status === s ? 'is-active' : ''}`}
              onClick={() => changeStatus(s)}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
          <button type="button" className="list-btn__option danger" onClick={remove}>
            Remove from list
          </button>
        </div>
      )}
    </div>
  );
}
