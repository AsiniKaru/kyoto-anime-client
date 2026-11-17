import { useEffect, useState } from "react";
import { libraryApi } from "../api/library";
import { apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Review } from "../types";
import toast from "react-hot-toast";

export default function ReviewSection({
  malId,
  animeTitle,
}: {
  malId: number;
  animeTitle: string;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [rating, setRating] = useState(8);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [hover, setHover] = useState(0);

  const load = () => {
    libraryApi
      .getReviews(malId)
      .then((res: { data: Review[]; meta?: { total: number; average: number | null } }) => {
        setReviews(res.data || []);
        setAverage(res.meta?.average ?? null);
        setTotal(res.meta?.total ?? (res.data?.length || 0));
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, [malId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to review");
      return;
    }
    setSaving(true);
    try {
      await libraryApi.saveReview(malId, { rating, comment, animeTitle });
      toast.success("Thanks for your review!");
      setComment("");
      setRating(8);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await libraryApi.deleteReview(id);
      toast.success("Review deleted");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const initials = (name?: string) =>
    (name || "A")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Reviews</h2>
        {average !== null && total > 0 && (
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-sm">
            <span className="text-amber-400 font-bold">★ {average.toFixed(1)}</span>
            <span className="text-slate-400">
              ({total} {total === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* Write a Review Box */}
      {user ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-sm mb-8">
          <form onSubmit={submit}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-white">Write a Review</h3>
              <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full border border-white/5">
                <span className="text-sm text-slate-300 font-medium">Your rating</span>
                <div className="flex items-center text-xl">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHover(n)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(n)}
                      className={`transition-colors duration-150 ${
                        n <= (hover || rating) ? "text-amber-400" : "text-white/20 hover:text-white/40"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-amber-400 ml-1 w-8 text-right">{rating}/10</span>
              </div>
            </div>

            <div className="relative mb-4">
              <textarea
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                placeholder="Share your thoughts about this anime..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-6 py-2.5 rounded-full hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
              >
                {saving ? "Posting..." : "Post review"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center mb-8">
          <p className="text-slate-400">Log in to leave a review.</p>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No reviews yet. Be the first to share your thoughts!
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r._id || r.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shrink-0">
                {initials(r.user?.name)}
              </div>
              
              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <strong className="text-white">{r.user?.name || "Anonymous"}</strong>
                  <span className="text-amber-400 text-sm font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                    ★ {r.rating}
                  </span>
                  <span className="text-slate-500 text-xs ml-auto">
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                      {user && r.user?.id === user._id && (                    
                    <button
                      onClick={() => remove(r._id || r.id || "")}
                      className="text-xs text-rose-400 hover:text-rose-300 ml-2"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-slate-300 whitespace-pre-wrap">{r.comment || "—"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}