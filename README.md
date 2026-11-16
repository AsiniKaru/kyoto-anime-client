# Kyoto Anime - Full Stack Anime Discovery & Streaming Platform

Kyoto Anime is a full-stack web application that lets users discover, browse, track and
watch anime. It combines AniList metadata with a cinematic React UI, JWT-based
authentication, personal watchlists & watch history, reviews, and an admin analytics
dashboard with PDF report generation.

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Redux Toolkit (global state)
- TailwindCSS
- React Router v6
- Axios
- React Player
- Lucide icons

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT (access token) + httpOnly refresh cookie (rotation)
- bcryptjs (password hashing)
- Zod (input validation)
- Helmet, CORS, Morgan, express-rate-limit
- PDFKit (PDF reports)

**Database**
- MongoDB Atlas

## Features

- Browse & search anime by title, genre, year, season, type, status and rating
- Anime details: synopsis, episodes, characters, recommendations, trailers
- Placeholder video player with watch progress tracking
- Personal watchlist with statuses (watching, completed, plan to watch, on hold, dropped)
- Watch history with continue-watching
- Reviews & ratings (1-10)
- JWT authentication with refresh-token rotation and role-based authorization
- Admin dashboard: user management, analytics, platform & library PDF reports
- Responsive TailwindCSS UI

## Setup & Run

### Backend

```bash
cd "kyoto anime server"
npm install
cp .example.env .env   # then fill in the values
npm run dev            # http://localhost:5001
```

Required environment variables (see `.example.env`):

- `MONGODB_URI` - MongoDB Atlas connection string
- `PORT` - server port (default 5001)
- `JWT_SECRET` - secret for signing access tokens
- `JWT_EXPIRES_IN` - access token lifetime (e.g. 15m)
- `REFRESH_TOKEN_DAYS` - refresh token lifetime in days
- `CLIENT_URL` - frontend origin for CORS
- `ANILIST_API_URL` - AniList GraphQL endpoint
- `YOUTUBE_API_KEY` - (optional) YouTube Data API key
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` - (optional) seed an admin

### Frontend

```bash
cd "kyoto anime client"
npm install
npm run dev            # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend (default `http://localhost:5001`).

### Production build

```bash
# frontend
npm run build          # outputs to dist/

# backend
npm run build          # compiles to dist/
npm start              # runs dist/server.js
```

## Deployed URLs

- Frontend: _add your Vercel/Netlify URL here_
- Backend: _add your Render/Railway URL here_

## Project Structure

```
src/
  api/          # Axios client + endpoint helpers
  components/   # Reusable UI components
  context/      # Auth context (Redux-backed)
  hooks/        # Custom hooks
  pages/        # Route pages
  store/        # Redux store & slices
  types/        # TypeScript types
  utils/        # Formatters & helpers
```

## Screenshots

_Add screenshots of the home page, anime details, watch player, profile and admin dashboard here._

## License

This project was built as the final coursework for ITS2020 - Rapid Application Development (RAD).
