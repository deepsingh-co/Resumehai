import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ResumePreview from '../components/ResumePreview';
import ATSScore from '../components/ATSScore';
import { templateInfo } from '../data/demoResumes';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Download,
  Edit3,
  FileText,
  Loader2,
  ShieldCheck,
  Target,
} from 'lucide-react';
import '../styles/preview.css';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function Preview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [atsOpen, setAtsOpen] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    loadResume();
  }, [id]);

  useEffect(() => {
    if (!atsOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setAtsOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [atsOpen]);

  const loadResume = async () => {
    try {
      const res = await api.get(`/resumes/${id}`);
      setResume(res.data);
    } catch (err) {
      toast.error('Failed to load resume');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!previewRef.current) {
      toast.error('Preview not ready');
      return;
    }
    setExporting(true);
    try {
      await previewRef.current.exportPDF();
      toast.success('PDF downloaded to your device');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="preview-page">
        <div className="preview-loading">
          <Loader2 size={30} className="preview-spin" />
          <p>Preparing your preview…</p>
        </div>
      </div>
    );
  }

  if (!resume) return null;

  const template = templateInfo[resume.template]?.name || resume.template;

  return (
    <div className="preview-page">
      <header className="preview-head">
        <div className="preview-head__copy">
          <Link to="/dashboard" className="preview-back">
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
          <h1>{resume.title}</h1>
          <div className="preview-meta">
            <span className="preview-chip">
              <FileText size={13} />
              {template} template
            </span>
            <span className="preview-meta__item">
              <Calendar size={13} />
              Updated {formatDate(resume.updatedAt)}
            </span>
          </div>
        </div>

        <div className="preview-head__actions">
          <button
            type="button"
            onClick={() => setAtsOpen(true)}
            className="btn btn-secondary btn-sm"
            aria-expanded={atsOpen}
          >
            <Target size={15} />
            ATS score
          </button>
          <button
            type="button"
            onClick={() => navigate(`/resume/${id}/edit`)}
            className="btn btn-secondary btn-sm"
          >
            <Edit3 size={15} />
            Edit
          </button>
          <button
            type="button"
            onClick={exportPDF}
            className="btn btn-primary btn-sm"
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 size={15} className="preview-spin" />
            ) : (
              <Download size={15} />
            )}
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>
      </header>

      <div className="preview-layout">
        <section className="preview-canvas" aria-label="Resume preview">
          <div className="preview-canvas__toolbar">
            <span className="preview-canvas__status">
              <span className="preview-canvas__dot" aria-hidden="true" />
              Live preview
            </span>
            <span className="preview-canvas__page">Letter · PDF ready</span>
          </div>

          <div className="preview-paper">
            <ResumePreview ref={previewRef} resume={resume} />
          </div>
        </section>

        <aside className="preview-rail" aria-label="Export and checks">
          <div className="preview-card">
            <span className="preview-card__eyebrow">Ready to send?</span>
            <h2>Turn this into a PDF</h2>
            <p>
              Export a clean, recruiter-ready file with your template, colors, and formatting
              intact.
            </p>
            <button
              type="button"
              onClick={exportPDF}
              className="btn btn-primary btn-block"
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 size={16} className="preview-spin" />
              ) : (
                <Download size={16} />
              )}
              {exporting ? 'Exporting…' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/resume/${id}/edit`)}
              className="btn btn-secondary btn-block"
            >
              <Edit3 size={16} />
              Keep editing
            </button>
          </div>

          <button type="button" className="preview-ats" onClick={() => setAtsOpen(true)}>
            <span className="preview-ats__icon" aria-hidden="true">
              <Target size={19} />
            </span>
            <span className="preview-ats__copy">
              <strong>Check your ATS score</strong>
              <span>See keyword matches before you apply.</span>
            </span>
            <ChevronRight size={17} className="preview-ats__chevron" aria-hidden="true" />
          </button>

          <div className="preview-privacy">
            <ShieldCheck size={18} aria-hidden="true" />
            <div>
              <strong>Private to your account</strong>
              <span>Only you can open this preview and its files.</span>
            </div>
          </div>
        </aside>
      </div>

      {atsOpen && (
        <>
          <button
            type="button"
            className="preview-scrim"
            onClick={() => setAtsOpen(false)}
            aria-label="Close ATS score panel"
          />
          <ATSScore resume={resume} onClose={() => setAtsOpen(false)} />
        </>
      )}
    </div>
  );
}
