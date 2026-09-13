import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Eye, Copy, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/resumes/${id}`);
      toast.success('Resume deleted');
      setResumes(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      toast.error('Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/resumes/${id}/duplicate`);
      toast.success('Resume duplicated');
      navigate(`/resume/${res.data._id}/edit`);
    } catch (err) {
      toast.error('Failed to duplicate resume');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Resumes</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Welcome back, {user?.name}! Manage your resumes here.
          </p>
        </div>
        <Link to="/resume/new" className="btn btn-primary">
          <Plus size={18} />
          New Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h3 className="empty-state-title">No resumes yet</h3>
            <p className="empty-state-text">Create your first resume to get started</p>
            <Link to="/resume/new" className="btn btn-primary">
              <Plus size={18} />
              Create Resume
            </Link>
          </div>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map(resume => (
            <div key={resume._id} className="card resume-card">
              <div className="resume-card-header">
                <div>
                  <h3 className="resume-card-title">{resume.title}</h3>
                  <span className="badge badge-outline resume-card-template">{resume.template}</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === resume._id ? null : resume._id)}
                    className="btn btn-ghost btn-sm"
                    aria-label="More options"
                    aria-expanded={dropdownOpen === resume._id}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {dropdownOpen === resume._id && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '0.25rem',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: '160px',
                      zIndex: 10,
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => { navigate(`/resume/${resume._id}/edit`); setDropdownOpen(null); }}
                        className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.625rem 1rem' }}
                      >
                        <Edit size={16} style={{ marginRight: '0.5rem' }} /> Edit
                      </button>
                      <button
                        onClick={() => { navigate(`/resume/${resume._id}/preview`); setDropdownOpen(null); }}
                        className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.625rem 1rem' }}
                      >
                        <Eye size={16} style={{ marginRight: '0.5rem' }} /> Preview
                      </button>
                      <button
                        onClick={() => { handleDuplicate(resume._id); setDropdownOpen(null); }}
                        className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.625rem 1rem' }}
                      >
                        <Copy size={16} style={{ marginRight: '0.5rem' }} /> Duplicate
                      </button>
                      <div className="divider" style={{ margin: '0.25rem 0' }} />
                      <button
                        onClick={() => { handleDelete(resume._id); setDropdownOpen(null); }}
                        className="btn btn-ghost btn-danger" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.625rem 1rem' }}
                        disabled={deletingId === resume._id}
                      >
                        {deletingId === resume._id ? <Loader2 size={16} /> : <Trash2 size={16} style={{ marginRight: '0.5rem' }} />}
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="resume-card-meta">
                <span>Updated {formatDate(resume.updatedAt)}</span>
                <span>{resume.experience?.length || 0} experience</span>
                <span>{resume.education?.length || 0} education</span>
              </div>

              <div className="resume-card-actions">
                <Link to={`/resume/${resume._id}/edit`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  <Edit size={16} />
                  Edit
                </Link>
                <Link to={`/resume/${resume._id}/preview`} className="btn btn-secondary btn-sm">
                  <Eye size={16} />
                  Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}