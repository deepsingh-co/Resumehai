import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  Eye,
  FileText,
  GraduationCap,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { demoResumes, templateInfo } from '../data/demoResumes';
import '../styles/dashboard.css';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatRelative = (date) => {
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return 'Unknown';

  const days = Math.floor((Date.now() - time) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
};

const templateName = (key) =>
  templateInfo[key]?.name || (key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Modern');

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStep, setPickerStep] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!event.target.closest('.dash-menu')) setDropdownOpen(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setDropdownOpen(null);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!confirmDelete) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setConfirmDelete(null);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [confirmDelete]);

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

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete._id);
    try {
      await api.delete(`/resumes/${confirmDelete._id}`);
      toast.success('Resume deleted');
      setResumes((prev) => prev.filter((resume) => resume._id !== confirmDelete._id));
      setConfirmDelete(null);
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
    navigate(`/resume/new?demo=${demoKey}&template=${selectedTemplate}`);
    setShowPicker(false);
    setPickerStep('template');
  };

  const handleCreateBlank = () => {
    navigate(`/resume/new?template=${selectedTemplate}`);
    setShowPicker(false);
    setPickerStep('template');
  };

  const closePicker = () => {
    setShowPicker(false);
    setPickerStep('template');
  };

  const firstName = user?.name?.trim().split(' ')[0] || 'there';

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    const updatedThisWeek = resumes.filter(
      (resume) => new Date(resume.updatedAt).getTime() >= weekAgo
    ).length;
    const templates = new Set(resumes.map((resume) => resume.template)).size;
    const latest = resumes.reduce((newest, resume) => {
      if (!newest) return resume;
      return new Date(resume.updatedAt) > new Date(newest.updatedAt) ? resume : newest;
    }, null);

    return { updatedThisWeek, templates, latest };
  }, [resumes]);

  const visibleResumes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? resumes.filter((resume) => {
          const template = templateName(resume.template).toLowerCase();
          return resume.title?.toLowerCase().includes(needle) || template.includes(needle);
        })
      : [...resumes];

    return filtered.sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'created') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  }, [resumes, query, sortBy]);

  if (loading) {
    return (
      <div className="dash">
        <div className="dash-loading">
          <LoadingSpinner size="lg" />
          <p>Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash">
      <header className="dash-hero">
        <div className="dash-hero__copy">
          <p className="dash-eyebrow">
            <span className="dash-eyebrow__dot" aria-hidden="true" />
            Your workspace
          </p>
          <h1>Welcome back, {firstName}.</h1>
          <p className="dash-hero__lead">
            Pick up where you left off, or start a fresh, ATS-ready resume tailored to the role
            you are chasing next.
          </p>
          <div className="dash-hero__actions">
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="btn btn-accent btn-lg"
            >
              <Plus size={18} />
              New resume
            </button>
            <span className="dash-hero__note">
              <Check size={14} />
              Recruiter-ready templates
            </span>
          </div>
        </div>
        <div className="dash-hero__art" aria-hidden="true">
          <div className="dash-hero__sheet">
            <span className="dash-hero__sheet-name" />
            <span className="dash-hero__sheet-role" />
            <span className="dash-hero__sheet-line" />
            <span className="dash-hero__sheet-line short" />
            <div className="dash-hero__sheet-chips">
              <span />
              <span />
              <span />
            </div>
            <div className="dash-hero__sheet-block">
              <span className="dash-hero__sheet-line" />
              <span className="dash-hero__sheet-line" />
              <span className="dash-hero__sheet-line short" />
            </div>
          </div>
          <span className="dash-hero__score">
            <span>ATS</span>
            <strong>92</strong>
          </span>
        </div>
      </header>

      {resumes.length > 0 && (
        <section className="dash-stats" aria-label="Resume overview">
          <article className="dash-stat">
            <span className="dash-stat__icon" aria-hidden="true">
              <FileText size={18} />
            </span>
            <div>
              <span className="dash-stat__value">{resumes.length}</span>
              <span className="dash-stat__label">Total resumes</span>
            </div>
          </article>
          <article className="dash-stat">
            <span className="dash-stat__icon dash-stat__icon--green" aria-hidden="true">
              <Clock size={18} />
            </span>
            <div>
              <span className="dash-stat__value">{stats.updatedThisWeek}</span>
              <span className="dash-stat__label">Updated this week</span>
            </div>
          </article>
          <article className="dash-stat">
            <span className="dash-stat__icon dash-stat__icon--amber" aria-hidden="true">
              <Layers size={18} />
            </span>
            <div>
              <span className="dash-stat__value">{stats.templates}</span>
              <span className="dash-stat__label">Templates in use</span>
            </div>
          </article>
          <article className="dash-stat">
            <span className="dash-stat__icon dash-stat__icon--rose" aria-hidden="true">
              <Sparkles size={18} />
            </span>
            <div>
              <span className="dash-stat__value dash-stat__value--text">
                {stats.latest ? formatRelative(stats.latest.updatedAt) : '—'}
              </span>
              <span className="dash-stat__label">Last activity</span>
            </div>
          </article>
        </section>
      )}

      {resumes.length === 0 ? (
        <section className="dash-empty">
          <div className="dash-empty__art" aria-hidden="true">
            <div className="dash-empty__sheet">
              <span className="dash-empty__sheet-bar" />
              <span className="dash-empty__sheet-line" />
              <span className="dash-empty__sheet-line short" />
              <div className="dash-empty__sheet-grid">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <span className="dash-empty__badge">
              <Sparkles size={14} />
              AI ready
            </span>
          </div>
          <div className="dash-empty__copy">
            <p className="dash-eyebrow">
              <span className="dash-eyebrow__dot" aria-hidden="true" />
              Start here
            </p>
            <h2>Your first great resume starts now</h2>
            <p>
              Choose a template, drop in your experience, and use AI to sharpen every bullet
              before you hit apply.
            </p>
            <ul className="dash-empty__list">
              <li>
                <Check size={15} /> ATS-friendly, recruiter-tested templates
              </li>
              <li>
                <Check size={15} /> Job-specific keyword matching
              </li>
              <li>
                <Check size={15} /> One-click PDF export
              </li>
            </ul>
            <div className="dash-empty__actions">
              <button type="button" className="btn btn-accent" onClick={() => setShowPicker(true)}>
                <Plus size={17} />
                Create your first resume
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowPicker(true);
                  setPickerStep('demo');
                }}
              >
                <Sparkles size={16} />
                Try a demo
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="dash-toolbar" aria-label="Resume filters">
            <div className="dash-search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search resumes by title or template"
                aria-label="Search resumes"
              />
              {query && (
                <button
                  type="button"
                  className="dash-search__clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="dash-toolbar__right">
              <label className="dash-sort">
                <span>Sort</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  aria-label="Sort resumes"
                >
                  <option value="updated">Last updated</option>
                  <option value="created">Newest first</option>
                  <option value="title">Title A–Z</option>
                </select>
              </label>

              <div className="dash-view" role="group" aria-label="Resume layout">
                <button
                  type="button"
                  className={viewMode === 'grid' ? 'is-active' : ''}
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  className={viewMode === 'list' ? 'is-active' : ''}
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  aria-label="List view"
                  title="List view"
                >
                  <List size={17} />
                </button>
              </div>
            </div>
          </section>

          <p className="dash-count" aria-live="polite">
            Showing {visibleResumes.length} of {resumes.length}{' '}
            {resumes.length === 1 ? 'resume' : 'resumes'}
            {query ? ` matching “${query}”` : ''}
          </p>

          {visibleResumes.length === 0 ? (
            <div className="dash-no-results">
              <span className="dash-no-results__icon" aria-hidden="true">
                <Search size={22} />
              </span>
              <h3>No resumes match “{query}”</h3>
              <p>Try a different title or template name.</p>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setQuery('')}>
                Clear search
              </button>
            </div>
          ) : (
            <div className={`dash-grid${viewMode === 'list' ? ' is-list' : ''}`}>
              {visibleResumes.map((resume) => {
                const accent =
                  resume.accentColor || templateInfo[resume.template]?.color || '#0284c7';
                const skillCount = (resume.skills || []).reduce(
                  (total, group) => total + (group.items?.length || 0),
                  0
                );

                return (
                  <article
                    key={resume._id}
                    className="dash-card"
                    style={{ '--resume-accent': accent }}
                  >
                    <div className="dash-card__preview">
                      <div className="dash-card__sheet" aria-hidden="true">
                        <span className="dash-card__sheet-head" />
                        <span className="dash-card__sheet-name" />
                        <span className="dash-card__sheet-line" />
                        <span className="dash-card__sheet-line short" />
                        <div className="dash-card__sheet-chips">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                      <span className="dash-card__template">{templateName(resume.template)}</span>
                    </div>

                    <div className="dash-card__body">
                      <div className="dash-card__top">
                        <div className="dash-card__heading">
                          <h3 className="dash-card__title">{resume.title}</h3>
                          <p className="dash-card__updated">
                            <Clock size={13} />
                            Updated {formatRelative(resume.updatedAt)}
                          </p>
                        </div>

                        <div className="dash-menu">
                          <button
                            type="button"
                            onClick={() =>
                              setDropdownOpen(dropdownOpen === resume._id ? null : resume._id)
                            }
                            className="dash-menu__trigger"
                            aria-label={`More options for ${resume.title}`}
                            aria-haspopup="menu"
                            aria-expanded={dropdownOpen === resume._id}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {dropdownOpen === resume._id && (
                            <div className="dash-menu__panel" role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  navigate(`/resume/${resume._id}/edit`);
                                  setDropdownOpen(null);
                                }}
                                className="dash-menu__item"
                              >
                                <Edit3 size={15} />
                                Edit resume
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  navigate(`/resume/${resume._id}/preview`);
                                  setDropdownOpen(null);
                                }}
                                className="dash-menu__item"
                              >
                                <Eye size={15} />
                                Preview
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  handleDuplicate(resume._id);
                                  setDropdownOpen(null);
                                }}
                                className="dash-menu__item"
                              >
                                <Copy size={15} />
                                Duplicate
                              </button>
                              <div className="dash-menu__divider" />
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setConfirmDelete(resume);
                                  setDropdownOpen(null);
                                }}
                                className="dash-menu__item dash-menu__item--danger"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="dash-card__meta">
                        <span>
                          <FileText size={14} />
                          {resume.experience?.length || 0} experience
                        </span>
                        <span>
                          <GraduationCap size={14} />
                          {resume.education?.length || 0} education
                        </span>
                        <span>
                          <Sparkles size={14} />
                          {skillCount} skills
                        </span>
                      </div>

                      <div className="dash-card__actions">
                        <Link
                          to={`/resume/${resume._id}/edit`}
                          className="btn btn-primary btn-sm dash-card__edit"
                        >
                          Continue editing
                          <ArrowRight size={15} />
                        </Link>
                        <Link
                          to={`/resume/${resume._id}/preview`}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={15} />
                          Preview
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {showPicker && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePicker();
          }}
        >
          <div
            className="modal-content picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="picker-title"
          >
            <div className="picker__head">
              <div>
                <span className="picker__step">
                  {pickerStep === 'template' ? 'Step 1 of 2' : 'Step 2 of 2'}
                </span>
                <h2 id="picker-title">
                  {pickerStep === 'template' ? 'Choose a starting point' : 'Start from a demo'}
                </h2>
                <p>
                  {pickerStep === 'template'
                    ? 'Every template is ATS-friendly. Pick the look that fits the role.'
                    : 'Pre-filled examples you can edit into your own story in minutes.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closePicker}
                className="picker__close"
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>

            {pickerStep === 'template' && (
              <div className="picker__body">
                <div className="picker-templates">
                  {Object.entries(templateInfo).map(([key, info]) => {
                    const selected = selectedTemplate === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`picker-tpl${selected ? ' is-selected' : ''}`}
                        onClick={() => setSelectedTemplate(key)}
                        aria-pressed={selected}
                      >
                        <span
                          className="picker-tpl__preview"
                          style={{ '--tpl-color': info.color }}
                          aria-hidden="true"
                        >
                          <span className="picker-tpl__sheet">
                            <span className="picker-tpl__bar" />
                            <span className="picker-tpl__line" />
                            <span className="picker-tpl__line short" />
                            <span className="picker-tpl__line" />
                            <span className="picker-tpl__line short" />
                          </span>
                          {selected && (
                            <span className="picker-tpl__check">
                              <Check size={13} />
                            </span>
                          )}
                        </span>
                        <span className="picker-tpl__info">
                          <strong>{info.name}</strong>
                          <span>{info.bestFor}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="picker__actions">
                  <button type="button" onClick={handleCreateBlank} className="btn btn-accent btn-lg">
                    <FileText size={17} />
                    Start blank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerStep('demo')}
                    className="btn btn-secondary btn-lg"
                  >
                    <Sparkles size={17} />
                    Use a demo
                  </button>
                </div>
                <p className="picker__hint">You can switch templates any time in the editor.</p>
              </div>
            )}

            {pickerStep === 'demo' && (
              <div className="picker__body">
                <div className="picker-demos">
                  {Object.entries(demoResumes).map(([key, demo]) => (
                    <button
                      key={key}
                      type="button"
                      className="picker-demo"
                      onClick={() => handleCreateWithDemo(key)}
                    >
                      <span
                        className="picker-demo__icon"
                        style={{ background: templateInfo[demo.template]?.color || '#0284c7' }}
                        aria-hidden="true"
                      >
                        <Sparkles size={18} />
                      </span>
                      <span className="picker-demo__info">
                        <strong>{demo.title}</strong>
                        <span>
                          {demo.personalInfo.fullName} · {templateName(demo.template)} template
                        </span>
                      </span>
                      <ChevronRight size={17} className="picker-demo__chevron" aria-hidden="true" />
                    </button>
                  ))}
                </div>

                <div className="picker__actions">
                  <button
                    type="button"
                    onClick={() => setPickerStep('template')}
                    className="btn btn-ghost btn-lg"
                  >
                    Back to templates
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmDelete(null);
          }}
        >
          <div
            className="modal-content dash-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
          >
            <span className="dash-confirm__icon" aria-hidden="true">
              <Trash2 size={22} />
            </span>
            <h2 id="delete-title">Delete this resume?</h2>
            <p id="delete-description">
              <strong>{confirmDelete.title}</strong> will be permanently removed. This action
              cannot be undone.
            </p>
            <div className="dash-confirm__actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmDelete(null)}
                autoFocus
              >
                Keep resume
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deletingId === confirmDelete._id}
              >
                {deletingId === confirmDelete._id ? (
                  <Loader2 size={16} className="dash-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
