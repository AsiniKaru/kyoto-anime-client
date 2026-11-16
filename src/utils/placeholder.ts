/** Inline SVG poster used when AniList has no image (keeps the layout stable). */
export const POSTER_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1c2233"/>
        <stop offset="1" stop-color="#0b0e15"/>
      </linearGradient>
    </defs>
    <rect width="300" height="450" fill="url(#g)"/>
    <circle cx="150" cy="205" r="34" fill="none" stroke="#3c4560" stroke-width="2"/>
    <path d="M138 190l24 15-24 15z" fill="#3c4560"/>
    <text x="150" y="285" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" letter-spacing="4" fill="#4b5468">SAYONARA</text>
  </svg>`
)}`;

export const avatarFallback = (seed = 'SA'): string =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}`;

/** Original poster artwork bundled with the app (2:3, 400x600). */
export const LOCAL_POSTERS: string[] = [
  '/posters/poster-1.svg',
  '/posters/poster-2.svg',
  '/posters/poster-3.svg',
  '/posters/poster-4.svg',
  '/posters/poster-5.svg',
  '/posters/poster-6.svg',
  '/posters/poster-7.svg',
  '/posters/poster-8.svg',
];

/** Original wide artwork used behind the hero / details header (16:9). */
export const LOCAL_BACKDROPS: string[] = [
  '/backdrops/backdrop-1.svg',
  '/backdrops/backdrop-2.svg',
  '/backdrops/backdrop-3.svg',
];

/** Stable string -> non-negative integer hash (FNV-1a style). */
const hashSeed = (seed: string | number): number => {
  const text = String(seed ?? '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
};

const pick = (list: string[], seed: string | number): string => {
  const numeric =
    typeof seed === 'number' && Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : hashSeed(seed);
  return list[numeric % list.length] ?? list[0] ?? '';
};

/** Deterministic local poster so the same anime always gets the same art. */
export const posterFallback = (seed: string | number = 0): string => pick(LOCAL_POSTERS, seed);

/** Deterministic local backdrop for hero / detail banners. */
export const backdropFallback = (seed: string | number = 0): string => pick(LOCAL_BACKDROPS, seed);
