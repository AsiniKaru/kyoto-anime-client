import type { ResolvedTrailer } from "../types";

export default function TrailerModal({
  open,
  onClose,
  title,
  trailer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  trailer: ResolvedTrailer | null;
}) {
  if (!open) return null;
  const embed = trailer?.embedUrl || trailer?.videoId
    ? `https://www.youtube.com/embed/${trailer?.videoId}`
    : null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{title} - Trailer</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
        <div className="modal__video">
          {embed ? (
            <iframe
              src={embed}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="modal__fallback">
              <p>No trailer available.</p>
              {trailer?.watchUrl ? (
                <a href={trailer.watchUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                  Search on YouTube
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
