import { POSTER_PLACEHOLDER } from '../utils/placeholder';

export default function PosterImage({
  src,
  alt,
  className,
  loading,
  seed,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  seed?: number | string;
}) {
  void seed;
  return (
    <img
      src={src || POSTER_PLACEHOLDER}
      alt={alt || ''}
      loading={loading || 'lazy'}
      className={className}
      onError={(event) => {
        (event.target as HTMLImageElement).src = POSTER_PLACEHOLDER;
      }}
    />
  );
}

export function BackdropImage({
  src,
  className,
  seed,
}: {
  src?: string | null;
  className?: string;
  seed?: number | string;
}) {
  void seed;
  return (
    <div
      className={className}
      style={src ? { backgroundImage: `url(${src})` } : undefined}
    />
  );
}
