/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // The existing cinematic theme provides its own reset; Tailwind is used for
  // layout, spacing, responsive utilities and the newer dashboard components.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        ink: '#08090d',
        panel: '#131826',
        'panel-2': '#1a2030',
        brand: {
          DEFAULT: '#a855f7',
          dark: '#7e22ce',
          pink: '#ec4899',
          indigo: '#6366f1',
        },
        accent: '#22d3ee',
      },
      fontFamily: {
        display: ['Outfit', 'Segoe UI', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(168, 85, 247, 0.55)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
