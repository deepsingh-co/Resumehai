import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, Plus } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand" aria-label="Resume Builder Home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          ResumeBuilder
        </Link>

        <div className="navbar-nav">
          <Link to="/resume/new" className="btn btn-primary btn-sm">
            <Plus size={16} />
            New Resume
          </Link>

          <Link to="/settings" className="btn btn-ghost btn-sm" aria-label="Settings">
            <Settings size={18} />
          </Link>

          <div className="navbar-user">
            <div className="navbar-avatar" aria-hidden="true">
              {initials || 'U'}
            </div>
            <span className="navbar-name">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}