import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent2 grid place-items-center font-bold">京</span>
            <span className="font-semibold tracking-wide text-lg">Kyoto Anime</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <NavLink to="/" className={({isActive})=> isActive?"text-white":"hover:text-white"}>Home</NavLink>
            <NavLink to="/search" className={({isActive})=> isActive?"text-white":"hover:text-white"}>Browse</NavLink>
            {user && <NavLink to="/profile" className={({isActive})=> isActive?"text-white":"hover:text-white"}>Profile</NavLink>}
          </nav>
          <div className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                <span className="hidden sm:inline text-slate-300">Hi, {user.name}</span>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1.5 rounded-md hover:bg-white/10">Login</Link>
                <Link to="/register" className="px-3 py-1.5 rounded-md bg-accent hover:bg-rose-600 font-medium">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 text-center text-xs text-slate-400 py-6">
        Kyoto Anime • Metadata powered by Jikan (MyAnimeList). Playback uses a placeholder video source.
      </footer>
    </div>
  );
}
