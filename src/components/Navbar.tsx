import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) navigate(`/browse?q=${encodeURIComponent(trimmed)}`);
    else navigate('/browse');
    setQ('');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="logo">
          <span className="logo__mark">京</span>
          <span className="logo__text">Kyoto<span>Anime</span></span>
        </Link>
        <nav className="navbar__links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>Home</NavLink>
          <NavLink to="/browse" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>Browse</NavLink>
          {isAuthenticated && (
            <NavLink to="/my-list" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>My List</NavLink>
          )}
        </nav>

        {/* Search bar */}
        <form className="navbar__search" onSubmit={submitSearch} style={{ flex: 1, maxWidth: 420, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)' }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search anime..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.88rem' }}
          />
        </form>

        <div className="navbar__actions" style={{ marginLeft: 'auto' }}>
          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className="user-menu__trigger"
                onClick={() => setOpen((value) => !value)}
              >
                <span className="avatar avatar--sm">{(user?.name || user?.email || '?').charAt(0).toUpperCase()}</span>
                <span className="user-menu__name">{user?.name || user?.email}</span>
              </button>
              {open && (
                <div className="user-menu__dropdown">
                  <div className="user-menu__header">
                    <strong>{user?.name || user?.email}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <button
                    className="user-menu__item"
                    onClick={() => { setOpen(false); navigate('/profile'); }}
                  >
                    Profile & Settings
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      className="user-menu__item"
                      onClick={() => { setOpen(false); navigate('/admin'); }}
                    >
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    className="user-menu__item danger"
                    onClick={() => { setOpen(false); void logout(); navigate('/'); }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
