import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="app-nav-wrap">
      <nav className="app-nav" aria-label="Main navigation">
        <Link to="/dashboard" className="app-nav__brand" aria-label="Resumehai dashboard">
          <span className="app-nav__mark" aria-hidden="true">
            <FileText size={18} strokeWidth={2.2} />
          </span>
          <span className="app-nav__brand-name">Resumehai</span>
        </Link>

        <div className="app-nav__links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}
          >
            <Settings size={16} />
            Settings
          </NavLink>
        </div>

        <div className="app-nav__actions">
          <Link to="/resume/new" className="btn btn-accent btn-sm app-nav__cta">
            <Plus size={16} />
            New resume
          </Link>

          <div className="app-nav__user">
            <div className="app-nav__avatar" aria-hidden="true">
              {initials || 'U'}
            </div>
            <span className="app-nav__name">{user?.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="app-nav__icon-btn"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>

          <button
            type="button"
            className="app-nav__toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="app-nav-mobile"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {menuOpen && (
          <div className="app-nav__mobile" id="app-nav-mobile">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}
            >
              <Settings size={16} />
              Settings
            </NavLink>
            <Link to="/resume/new" className="app-nav__link">
              <Plus size={16} />
              New resume
            </Link>

            <div className="app-nav__mobile-divider" />

            <div className="app-nav__mobile-user">
              <div className="app-nav__avatar" aria-hidden="true">
                {initials || 'U'}
              </div>
              <div>
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="app-nav__link"
              style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
