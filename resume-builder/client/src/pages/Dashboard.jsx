import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Eye, Copy, Trash2, MoreVertical, Loader2, X, Sparkles, FileText } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { demoResumes, templateInfo } from '../data/demoResumes';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStep, setPickerStep] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

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

  const handleCreateWithDemo = (demoKey) => {
    const demoData = demoResumes[demoKey];
    const data = encodeURIComponent(JSON.stringify(demoData));
    navigate(`/resume/new?demo=${demoKey}&template=${selectedTemplate}`);
    setShowPicker(false);
    setPickerStep('template');
  };

  const handleCreateBlank = () => {
    navigate(`/resume/new?template=${selectedTemplate}`);
    setShowPicker(false);
    setPickerStep('template');
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
        <button onClick={() => setShowPicker(true)} className="btn btn-primary">
          <Plus size={18} />
          New Resume
        </button>
      </div>

      {showPicker && (
        <div className="modal-overlay" onClick={() => { setShowPicker(false); setPickerStep('template'); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{pickerStep === 'template' ? 'Choose a Template' : 'Start with a Demo'}</h2>
              <button onClick={() => { setShowPicker(false); setPickerStep('template'); }} className="btn btn-ghost btn-sm">
                <X size={20} />
              </button>
            </div>

            {pickerStep === 'template' && (
              <div className="modal-body">
                <div className="template-grid">
                  {Object.entries(templateInfo).map(([key, info]) => (
                    <button
                      key={key}
                      className={`template-card ${selectedTemplate === key ? 'selected' : ''}`}
                      onClick={() => setSelectedTemplate(key)}
                    >
                      <div className="template-preview" style={{ background: info.color }}>
                        <div className="template-preview-lines">
                          <div className="tpl-line long" style={{ background: 'rgba(255,255,255,0.9)' }} />
                          <div className="tpl-line short" style={{ background: 'rgba(255,255,255,0.5)' }} />
                          <div className="tpl-line" style={{ background: 'rgba(255,255,255,0.3)' }} />
                          <div className="tpl-line long" style={{ background: 'rgba(255,255,255,0.3)' }} />
                        </div>
                      </div>
                      <div className="template-info">
                        <strong>{info.name}</strong>
                        <span className="template-best">{info.bestFor}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button onClick={handleCreateBlank} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                    <FileText size={18} /> Start Blank
                  </button>
                  <button onClick={() => setPickerStep('demo')} className="btn btn-secondary btn-lg" style={{ flex: 1 }}>
                    <Sparkles size={18} /> Use a Demo
                  </button>
                </div>
              </div>
            )}

            {pickerStep === 'demo' && (
              <div className="modal-body">
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
                  Start with a pre-filled resume and customize it to your needs.
                </p>
                <div className="demo-grid">
                  {Object.entries(demoResumes).map(([key, demo]) => (
                    <button key={key} className="demo-card" onClick={() => handleCreateWithDemo(key)}>
                      <div className="demo-card-icon" style={{ background: templateInfo[demo.template]?.color || '#2563eb' }}>
                        <Sparkles size={20} color="white" />
                      </div>
                      <div className="demo-card-info">
                        <strong>{demo.title}</strong>
                        <span>{demo.personalInfo.fullName} &middot; {templateInfo[demo.template]?.name} template</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="modal-actions">
                  <button onClick={() => setPickerStep('template')} className="btn btn-ghost btn-lg">
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
            <button onClick={() => setShowPicker(true)} className="btn btn-primary">
              <Plus size={18} />
              Create Resume
            </button>
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
