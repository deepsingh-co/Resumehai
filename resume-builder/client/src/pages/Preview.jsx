import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ResumePreview from '../components/ResumePreview';
import ATSScore from '../components/ATSScore';
import { ArrowLeft, Download, Edit, FileText, Share2, Loader2, Target } from 'lucide-react';

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

  const handleAnalyze = async () => {
    if (!resume) return;
    try {
      const res = await api.post('/ai/analyze', { resume });
      alert(res.data.analysis);
    } catch (err) {
      toast.error('Failed to analyze resume');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="loading" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  if (!resume) return null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
            <ArrowLeft size={16} style={{ marginRight: '0.25rem' }} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{resume.title}</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Template: <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{resume.template}</span>
            {' | '}
            Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setAtsOpen(!atsOpen)} className={`btn btn-sm ${atsOpen ? 'btn-primary' : 'btn-secondary'}`}>
            <Target size={16} style={{ marginRight: '0.25rem' }} /> ATS Score
          </button>
          <button onClick={() => navigate(`/resume/${id}/edit`)} className="btn btn-secondary btn-sm">
            <Edit size={16} style={{ marginRight: '0.25rem' }} /> Edit
          </button>
          <button onClick={exportPDF} className="btn btn-primary btn-sm" disabled={exporting}>
            {exporting ? <Loader2 size={16} /> : <Download size={16} style={{ marginRight: '0.25rem' }} />} Export PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
          <ResumePreview
            ref={previewRef}
            resume={resume}
          />
        </div>

        {atsOpen && (
          <div style={{ width: '380px', flexShrink: 0 }}>
            <ATSScore resume={resume} onClose={() => setAtsOpen(false)} />
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Share & Export</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={exportPDF} disabled={exporting}>
            <Download size={18} style={{ marginRight: '0.5rem' }} /> Download PDF
          </button>
          <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(window.location.href)}>
            <Share2 size={18} style={{ marginRight: '0.5rem' }} /> Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}