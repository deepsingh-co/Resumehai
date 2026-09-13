import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  Sparkles, Loader2, Check, X, Download, FileText
} from 'lucide-react';
import ResumePreview from '../components/ResumePreview';
import AIAssistant from '../components/AIAssistant';

const SECTIONS = [
  { key: 'personalInfo', label: 'Personal Info', icon: 'user' },
  { key: 'experience', label: 'Experience', icon: 'briefcase' },
  { key: 'education', label: 'Education', icon: 'graduation-cap' },
  { key: 'skills', label: 'Skills', icon: 'code' },
  { key: 'projects', label: 'Projects', icon: 'folder-kanban' },
  { key: 'certifications', label: 'Certifications', icon: 'award' },
  { key: 'languages', label: 'Languages', icon: 'languages' },
];

const initialResume = {
  title: 'My Resume',
  template: 'modern',
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  customSections: []
};

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const [resume, setResume] = useState(initialResume);
  const [loading, setLoading] = useState(isNew ? false : true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [expandedSections, setExpandedSections] = useState({ personalInfo: true });
  const [aiOpen, setAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState({ section: '', field: '', value: '' });
  const previewRef = useRef(null);

  useEffect(() => {
    if (!isNew) {
      loadResume();
    }
  }, [id]);

  const loadResume = async () => {
    try {
      const res = await api.get(`/resumes/${id}`);
      setResume(res.data);
      setExpandedSections({ personalInfo: true });
    } catch (err) {
      toast.error('Failed to load resume');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async (redirect = false) => {
    setSaving(true);
    try {
      let res;
      if (isNew) {
        res = await api.post('/resumes', resume);
        toast.success('Resume created');
        if (redirect) return navigate(`/resume/${res.data._id}/edit`);
      } else {
        res = await api.put(`/resumes/${id}`, resume);
        toast.success('Resume saved');
      }
      if (redirect) navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const updateField = useCallback((section, field, value, index = null, subField = null) => {
    setResume(prev => {
      const next = { ...prev };
      if (index !== null && Array.isArray(next[section])) {
        next[section] = [...next[section]];
        if (subField) {
          next[section][index] = { ...next[section][index], [subField]: value };
        } else {
          next[section][index] = value;
        }
      } else if (typeof next[section] === 'object' && next[section] !== null) {
        next[section] = { ...next[section], [field]: value };
      }
      return next;
    });
  }, []);

  const addItem = (section, item) => {
    setResume(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), item]
    }));
    setExpandedSections(prev => ({ ...prev, [section]: true }));
  };

  const removeItem = (section, index) => {
    setResume(prev => {
      const next = { ...prev };
      next[section] = next[section].filter((_, i) => i !== index);
      return next;
    });
  };

  const moveItem = (section, fromIndex, toIndex) => {
    setResume(prev => {
      const next = { ...prev };
      const items = [...next[section]];
      const [removed] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, removed);
      next[section] = items;
      return next;
    });
  };

  const handleAIRequest = async (section, field, currentValue, context = {}) => {
    setAiContext({ section, field, value: currentValue, ...context });
    setAiOpen(true);
  };

  const handleAIAccept = (suggestion) => {
    const { section, field, index, subField } = aiContext;
    if (index !== undefined) {
      updateField(section, field, suggestion, index, subField);
    } else {
      updateField(section, field, suggestion);
    }
    setAiOpen(false);
    toast.success('AI suggestion applied');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div className="editor-layout">
        <div className="editor-sidebar" />
        <div className="editor-preview">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader2 className="loading" style={{ width: '2rem', height: '2rem' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-layout">
      <aside className="editor-sidebar">
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="editor-field">
            <label className="label">Resume Title</label>
            <input
              type="text"
              className="input"
              value={resume.title}
              onChange={e => setResume(prev => ({ ...prev, title: e.target.value }))}
              placeholder="My Resume"
            />
          </div>

          <div className="editor-field">
            <label className="label">Template</label>
            <select
              className="input"
              value={resume.template}
              onChange={e => setResume(prev => ({ ...prev, template: e.target.value }))}
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="creative">Creative</option>
            </select>
          </div>
        </div>

        <nav style={{ marginBottom: '1.5rem' }} aria-label="Resume sections">
          {SECTIONS.map(section => {
            const isExpanded = expandedSections[section.key];
            const count = Array.isArray(resume[section.key]) ? resume[section.key].length : 0;
            return (
              <button
                key={section.key}
                onClick={() => { setActiveSection(section.key); toggleSection(section.key); }}
                className={`btn btn-ghost ${activeSection === section.key ? 'btn-primary' : ''}`}
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  marginBottom: '0.375rem',
                  borderRadius: 'var(--radius-md)'
                }}
                aria-expanded={isExpanded}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {section.label}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {count > 0 && <span className="badge badge-primary">{count}</span>}
                  <span style={{ width: '20px', textAlign: 'right' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              const newSection = `custom_${Date.now()}`;
              setResume(prev => ({
                ...prev,
                customSections: [...(prev.customSections || []), { title: 'New Section', content: '' }]
              }));
              setActiveSection('customSections');
            }}
            className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Custom Section
          </button>
        </nav>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => saveResume(false)}
            className="btn btn-primary"
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? <Loader2 size={16} /> : 'Save'}
          </button>
          <button
            onClick={() => saveResume(true)}
            className="btn btn-secondary"
            disabled={saving}
            style={{ flex: 1 }}
          >
            <Download size={16} style={{ marginRight: '0.25rem' }} /> Save & Exit
          </button>
        </div>
      </aside>

      <div className="editor-preview">
        <ResumePreview
          ref={previewRef}
          resume={resume}
          editMode
          onAIRequest={handleAIRequest}
        />

        {aiOpen && (
          <AIAssistant
            context={aiContext}
            onAccept={handleAIAccept}
            onClose={() => setAiOpen(false)}
          />
        )}
      </div>
    </div>
  );
}