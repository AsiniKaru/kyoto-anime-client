/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b12",
        panel: "#141420",
        accent: "#e11d48",
        accent2: "#7c3aed",
      },
      boxShadow: {
        glow: "0 0 40px rgba(225,29,72,0.25)",
      },
    },
  },
  plugins: [],
};
