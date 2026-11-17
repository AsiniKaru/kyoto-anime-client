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
    <div className="reviews">
      <div className="reviews__head">
        <h2>Reviews</h2>
        {average !== null ? (
          <div className="reviews__summary">
            <span className="reviews__avg">★ {average}</span>
            <span className="reviews__count">{total} review{total === 1 ? "" : "s"}</span>
          </div>
        ) : null}
      </div>

      {user ? (
        <form className="review-form" onSubmit={submit}>
          <div className="rating-picker">
            <label>Your rating</label>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    color: n <= (hover || rating) ? "#fbbf24" : "rgba(255,255,255,0.25)",
                    transition: "color 0.12s ease",
                    padding: 0,
                  }}
                  aria-label={`Rate ${n}`}
                >
                  ★
                </button>
              ))}
              <span className="rating-picker__value">{rating}/10</span>
            </div>
          </div>
          <textarea
            className="field"
            placeholder="Share your thoughts about this anime..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <div className="review-form__actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Posting..." : "Post review"}
            </button>
          </div>
        </form>
      ) : (
        <p className="review-form__guest">Log in to leave a review.</p>
      )}

      <div className="review-list" style={{ marginTop: 16 }}>
        {reviews.length === 0 ? (
          <div className="reviews__empty" style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)" }}>
            No reviews yet. Be the first to share your thoughts!
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r._id || r.id} className="review" style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
              <div className="avatar avatar--sm" style={{ flexShrink: 0 }}>
                {initials(r.user?.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="review__head" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <strong>{r.user?.name || "Anonymous"}</strong>
                  <span className="review__score">★ {r.rating}</span>
                  <span className="muted" style={{ fontSize: "0.75rem", marginLeft: "auto" }}>
                    {new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {user && r.user?.id === user._id ? (
                    <button className="btn btn-ghost btn-sm" onClick={() => remove(r._id || r.id || "")}>
                      Delete
                    </button>
                  ) : null}
                </div>
                <p style={{ margin: 0, color: "var(--text)", lineHeight: 1.5 }}>{r.comment || "—"}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
