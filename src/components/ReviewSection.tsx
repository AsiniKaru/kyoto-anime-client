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

  return (
    <section className="reviews">
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
            <label>Rating</label>
            <input
              type="range"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
            <span className="rating-picker__value">{rating}/10</span>
          </div>
          <textarea
            className="field"
            placeholder="Share your thoughts..."
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

      <div className="review-list">
        {reviews.length === 0 ? (
          <p className="reviews__empty">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id || r.id} className="review">
              <div className="review__head">
                <strong>{r.user?.name || "Anonymous"}</strong>
                <span className="review__score">★ {r.rating}</span>
                {user && r.user?.id === user._id ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => remove(r._id || r.id || "")}>
                    Delete
                  </button>
                ) : null}
              </div>
              <p>{r.comment}</p>
              <small className="muted">{new Date(r.createdAt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
