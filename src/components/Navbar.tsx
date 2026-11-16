import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

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
          {isAuthenticated && (
            <NavLink to="/ai" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>AI Picks</NavLink>
          )}
        </nav>
        <div className="navbar__actions">
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
