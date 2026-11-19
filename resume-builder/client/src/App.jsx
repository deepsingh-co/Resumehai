import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Preview from './pages/Preview';
import Settings from './pages/Settings';
import ResumeChat from './components/ResumeChat';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/app-shell.css';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  const { isAuthenticated, loading } = useAuth();
  const { pathname } = useLocation();
  const isFullBleed = pathname === '/' || pathname === '/login' || pathname === '/register';
  const isWorkspace = pathname.startsWith('/resume');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      {isAuthenticated && <Navbar />}
      <main
        id="main-content"
        tabIndex={-1}
        className={[
          'app-main',
          isFullBleed ? 'app-main--bleed' : '',
          isWorkspace ? 'app-main--wide' : '',
        ].filter(Boolean).join(' ')}
      >
        <div className={isFullBleed ? undefined : 'app-shell'}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/resume/new" element={<PrivateRoute><Editor /></PrivateRoute>} />
            <Route path="/resume/:id/edit" element={<PrivateRoute><Editor /></PrivateRoute>} />
            <Route path="/resume/:id/preview" element={<PrivateRoute><Preview /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      {isAuthenticated && !isFullBleed && <ResumeChat />}
    </div>
  );
}

export default App;