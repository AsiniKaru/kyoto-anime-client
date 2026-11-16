import { useEffect, useState } from "react";
import { libraryApi } from "../api/library";
import { apiErrorMessage } from "../api/client";
import type { Anime, WatchStatus } from "../types";
import toast from "react-hot-toast";

export default function AddToListButton({ anime }: { anime: Anime }) {
  const [entry, setEntry] = useState<{ status: WatchStatus } | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    libraryApi
      .getWatchlistEntry(anime.malId)
      .then((res: { data: { status: WatchStatus } | null }) => {
        if (!cancelled) setEntry(res.data ? { status: res.data.status } : null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [anime.malId]);

  const add = async (status: WatchStatus) => {
    setLoading(true);
    try {
      const res = await libraryApi.addToWatchlist({
        malId: anime.malId,
        title: anime.title,
        image: anime.image,
        year: anime.year,
        score: anime.score,
        type: anime.type,
        genres: anime.genres.map((g) => g.name),
        status,
      });
      setEntry({ status: res.data.status });
      toast.success("Added to your list");
    } catch (e) {
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
      toast.error(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (!entry) {
    return (
      <div className="list-btn">
        <button
          type="button"
          className="btn btn-ghost btn-lg"
          onClick={() => setOpen((v) => !v)}
          disabled={loading}
        >
          {loading ? "Adding..." : "+ Add to list"}
        </button>
        {open ? (
          <div className="list-btn__menu">
            {(["watching", "completed", "plan_to_watch", "on_hold", "dropped"] as WatchStatus[]).map((s) => (
              <button key={s} type="button" className="list-btn__option" onClick={() => add(s)}>
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <button type="button" className="btn btn-ghost btn-lg" onClick={remove} disabled={loading}>
      {loading ? "Removing..." : `In list: ${entry.status.replace(/_/g, " ")} (click to remove)`}
    </button>
  );
}
