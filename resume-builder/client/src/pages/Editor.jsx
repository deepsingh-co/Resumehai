import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, ChevronDown, ChevronUp,
  Loader2, Download, FileText, X, Sparkles, Upload, Image, File
} from 'lucide-react';
import ResumePreview from '../components/ResumePreview';
import AIAssistant from '../components/AIAssistant';

const SECTIONS = [
  { key: 'personalInfo', label: 'Personal Info' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'languages', label: 'Languages' },
  { key: 'customSections', label: 'Custom Sections' },
];

const emptyExp = { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '', achievements: [''] };
const emptyEdu = { institution: '', degree: '', fieldOfStudy: '', location: '', startDate: '', endDate: '', gpa: '', achievements: [''] };
const emptySkill = { category: '', items: [''] };
const emptyProject = { name: '', description: '', technologies: [''], link: '', startDate: '', endDate: '' };
const emptyCert = { name: '', issuer: '', date: '', credentialId: '', url: '', file: '', fileName: '' };
const emptyLang = { language: '', proficiency: 'Intermediate' };
const emptyCustom = { title: '', content: '' };

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const initialResume = {
  title: 'My Resume',
  template: 'modern',
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', summary: '', profilePhoto: '' },
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
  const [expandedSections, setExpandedSections] = useState({ personalInfo: true });
  const [aiOpen, setAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState({ section: '', field: '', value: '' });
  const previewRef = useRef(null);

  useEffect(() => {
    if (!isNew) loadResume();
  }, [id]);

  const loadResume = async () => {
    try {
      const res = await api.get(`/resumes/${id}`);
      setResume(res.data);
    } catch {
      toast.error('Failed to load resume');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const saveResume = async (redirect = false) => {
    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post('/resumes', resume);
        toast.success('Resume created');
        if (redirect) { navigate('/dashboard'); return; }
        navigate(`/resume/${res.data._id}/edit`, { replace: true });
      } else {
        await api.put(`/resumes/${id}`, resume);
        toast.success('Resume saved');
        if (redirect) navigate('/dashboard');
      }
    } catch {
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const update = (path, value) => {
    setResume(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateArrayItem = (section, index, field, value) => {
    setResume(prev => {
      const next = { ...prev, [section]: [...prev[section]] };
      next[section][index] = { ...next[section][index], [field]: value };
      return next;
    });
  };

  const addArrayItem = (section, item) => {
    setResume(prev => ({ ...prev, [section]: [...prev[section], item] }));
    setExpandedSections(prev => ({ ...prev, [section]: true }));
  };

  const removeArrayItem = (section, index) => {
    setResume(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  };

  const toggle = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const handleAIRequest = (section, field, value, ctx = {}) => {
    setAiContext({ section, field, value, ...ctx });
    setAiOpen(true);
  };

  const handleAIAccept = (suggestion) => {
    const { section, field, index, subField } = aiContext;
    if (index !== undefined) {
      if (subField) {
        const arr = [...resume[section]];
        arr[index] = { ...arr[index], [subField]: suggestion };
        setResume(prev => ({ ...prev, [section]: arr }));
      } else {
        updateArrayItem(section, index, field, suggestion);
      }
    } else {
      update(`personalInfo.${field}`, suggestion);
    }
    setAiOpen(false);
    toast.success('AI suggestion applied');
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
        <div style={{ marginBottom: '1rem' }}>
          <div className="editor-field">
            <label className="label">Resume Title</label>
            <input
              type="text"
              className="input"
              value={resume.title}
              onChange={e => update('title', e.target.value)}
              placeholder="My Resume"
            />
          </div>
          <div className="editor-field">
            <label className="label">Template</label>
            <select className="input" value={resume.template} onChange={e => update('template', e.target.value)}>
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="creative">Creative</option>
            </select>
          </div>
        </div>

        <div className="editor-sections">
          {SECTIONS.map(sec => (
            <div key={sec.key} className="editor-section">
              <button
                onClick={() => toggle(sec.key)}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'space-between', fontWeight: 600, marginBottom: expandedSections[sec.key] ? '0.75rem' : 0 }}
              >
                <span>{sec.label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {Array.isArray(resume[sec.key]) && resume[sec.key].length > 0 && (
                    <span className="badge badge-primary">{resume[sec.key].length}</span>
                  )}
                  {expandedSections[sec.key] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {expandedSections[sec.key] && (
                <div style={{ paddingLeft: '0.5rem' }}>
                  {sec.key === 'personalInfo' && renderPersonalInfo(resume.personalInfo, update, handleAIRequest)}
                  {sec.key === 'experience' && renderExperience(resume.experience, updateArrayItem, addArrayItem, removeArrayItem, handleAIRequest)}
                  {sec.key === 'education' && renderEducation(resume.education, updateArrayItem, addArrayItem, removeArrayItem, handleAIRequest)}
                  {sec.key === 'skills' && renderSkills(resume.skills, updateArrayItem, addArrayItem, removeArrayItem)}
                  {sec.key === 'projects' && renderProjects(resume.projects, updateArrayItem, addArrayItem, removeArrayItem, handleAIRequest)}
                  {sec.key === 'certifications' && renderCertifications(resume.certifications, updateArrayItem, addArrayItem, removeArrayItem)}
                  {sec.key === 'languages' && renderLanguages(resume.languages, updateArrayItem, addArrayItem, removeArrayItem)}
                  {sec.key === 'customSections' && renderCustomSections(resume.customSections, updateArrayItem, addArrayItem, removeArrayItem)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="divider" />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => saveResume(false)} className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
            {saving ? <Loader2 size={16} className="loading" /> : 'Save'}
          </button>
          <button onClick={() => saveResume(true)} className="btn btn-secondary" disabled={saving} style={{ flex: 1 }}>
            <Download size={16} /> Save & Exit
          </button>
        </div>
      </aside>

      <div className="editor-preview">
        <ResumePreview ref={previewRef} resume={resume} />

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

function Field({ label, value, onChange, type = 'text', placeholder = '', rows, ai }) {
  return (
    <div className="editor-field">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="label">{label}</label>
        {ai && (
          <button
            className="ai-suggest-btn"
            onClick={() => ai(value)}
            title="Get AI suggestion"
          >
            <Sparkles size={12} />
          </button>
        )}
      </div>
      {rows ? (
        <textarea className="input" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
      ) : (
        <input type={type} className="input" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function renderPersonalInfo(info, update, handleAIRequest) {
  const u = (field) => (val) => update(`personalInfo.${field}`, val);
  const ai = (field) => (val) => handleAIRequest('personalInfo', field, val);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    const base64 = await readFileAsBase64(file);
    u('profilePhoto')(base64);
    toast.success('Photo added');
  };

  return (
    <div>
      <div className="editor-field">
        <label className="label">Profile Photo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {info.profilePhoto ? (
            <div style={{ position: 'relative' }}>
              <img
                src={info.profilePhoto}
                alt="Profile"
                style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }}
              />
              <button
                onClick={() => u('profilePhoto')('')}
                style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--color-error)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--color-surface)', cursor: 'pointer'
                }}
              >
                <X size={10} />
              </button>
            </div>
          ) : (
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={14} />
              Upload Photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          )}
          {info.profilePhoto && (
            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image size={14} />
              Change
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>JPG or PNG, max 2MB</p>
      </div>
      <Field label="Full Name" value={info.fullName} onChange={u('fullName')} placeholder="John Doe" />
      <Field label="Email" value={info.email} onChange={u('email')} type="email" placeholder="john@example.com" />
      <Field label="Phone" value={info.phone} onChange={u('phone')} placeholder="+1 234 567 890" />
      <Field label="Location" value={info.location} onChange={u('location')} placeholder="San Francisco, CA" />
      <Field label="LinkedIn" value={info.linkedin} onChange={u('linkedin')} placeholder="linkedin.com/in/johndoe" />
      <Field label="GitHub" value={info.github} onChange={u('github')} placeholder="github.com/johndoe" />
      <Field label="Website" value={info.website} onChange={u('website')} placeholder="johndoe.com" />
      <Field label="Summary" value={info.summary} onChange={u('summary')} rows={4} placeholder="Professional summary..." ai={ai('summary')} />
    </div>
  );
}

function renderExperience(items, updateItem, addItem, removeItem, handleAIRequest) {
  return (
    <div>
      {items.map((exp, i) => (
        <div key={i} className="item-editor">
          <div className="item-editor-header">
            <span className="item-editor-title">{exp.position || exp.company || `Experience ${i + 1}`}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => removeItem('experience', i)} style={{ color: 'var(--color-error)' }}>
              <Trash2 size={14} />
            </button>
          </div>
          <Field label="Position" value={exp.position} onChange={v => updateItem('experience', i, 'position', v)} placeholder="Software Engineer" />
          <Field label="Company" value={exp.company} onChange={v => updateItem('experience', i, 'company', v)} placeholder="Google" />
          <Field label="Location" value={exp.location} onChange={v => updateItem('experience', i, 'location', v)} placeholder="Mountain View, CA" />
          <div className="editor-row">
            <Field label="Start Date" value={exp.startDate} onChange={v => updateItem('experience', i, 'startDate', v)} type="date" />
            <Field label="End Date" value={exp.endDate} onChange={v => updateItem('experience', i, 'endDate', v)} type="date" />
          </div>
          <div className="editor-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={exp.current || false} onChange={e => updateItem('experience', i, 'current', e.target.checked)} />
              Currently working here
            </label>
          </div>
          <Field
            label="Description"
            value={exp.description}
            onChange={v => updateItem('experience', i, 'description', v)}
            rows={3}
            placeholder="Describe your role..."
            ai={(val) => handleAIRequest('experience', 'description', val, { index: i })}
          />
          <Field label="Achievements (one per line)" value={(exp.achievements || []).join('\n')} onChange={v => updateItem('experience', i, 'achievements', v.split('\n').filter(Boolean))} rows={3} placeholder="• Increased revenue by 20%" />
        </div>
      ))}
      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => addItem('experience', { ...emptyExp })}>
        <Plus size={16} /> Add Experience
      </button>
    </div>
  );
}

function renderEducation(items, updateItem, addItem, removeItem, handleAIRequest) {
  return (
    <div>
      {items.map((edu, i) => (
        <div key={i} className="item-editor">
          <div className="item-editor-header">
            <span className="item-editor-title">{edu.degree || edu.institution || `Education ${i + 1}`}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => removeItem('education', i)} style={{ color: 'var(--color-error)' }}>
              <Trash2 size={14} />
            </button>
          </div>
          <Field label="Institution" value={edu.institution} onChange={v => updateItem('education', i, 'institution', v)} placeholder="MIT" />
          <Field label="Degree" value={edu.degree} onChange={v => updateItem('education', i, 'degree', v)} placeholder="Bachelor's" />
          <Field label="Field of Study" value={edu.fieldOfStudy} onChange={v => updateItem('education', i, 'fieldOfStudy', v)} placeholder="Computer Science" />
          <Field label="Location" value={edu.location} onChange={v => updateItem('education', i, 'location', v)} placeholder="Cambridge, MA" />
          <div className="editor-row">
            <Field label="Start Date" value={edu.startDate} onChange={v => updateItem('education', i, 'startDate', v)} type="date" />
            <Field label="End Date" value={edu.endDate} onChange={v => updateItem('education', i, 'endDate', v)} type="date" />
          </div>
          <Field label="GPA" value={edu.gpa} onChange={v => updateItem('education', i, 'gpa', v)} placeholder="3.8/4.0" />
          <Field label="Achievements (one per line)" value={(edu.achievements || []).join('\n')} onChange={v => updateItem('education', i, 'achievements', v.split('\n').filter(Boolean))} rows={3} placeholder="Dean's List" />
        </div>
      ))}
      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => addItem('education', { ...emptyEdu })}>
        <Plus size={16} /> Add Education
      </button>
    </div>
  );
}

function renderSkills(items, updateItem, addItem, removeItem) {
  return (
    <div>
      {items.map((skill, i) => (
        <div key={i} className="item-editor">
          <div className="item-editor-header">
            <span className="item-editor-title">{skill.category || `Skill Group ${i + 1}`}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => removeItem('skills', i)} style={{ color: 'var(--color-error)' }}>
              <Trash2 size={14} />
            </button>
          </div>
          <Field label="Category" value={skill.category} onChange={v => updateItem('skills', i, 'category', v)} placeholder="Frontend" />
          <Field label="Skills (one per line)" value={(skill.items || []).join('\n')} onChange={v => updateItem('skills', i, 'items', v.split('\n').filter(Boolean))} rows={3} placeholder="React&#10;TypeScript&#10;CSS" />
        </div>
      ))}
      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => addItem('skills', { ...emptySkill })}>
        <Plus size={16} /> Add Skill Group
      </button>
    </div>
  );
}

function renderProjects(items, updateItem, addItem, removeItem, handleAIRequest) {
  return (
    <div>
      {items.map((proj, i) => (
        <div key={i} className="item-editor">
          <div className="item-editor-header">
            <span className="item-editor-title">{proj.name || `Project ${i + 1}`}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => removeItem('projects', i)} style={{ color: 'var(--color-error)' }}>
              <Trash2 size={14} />
            </button>
          </div>
          <Field label="Name" value={proj.name} onChange={v => updateItem('projects', i, 'name', v)} placeholder="E-commerce Platform" />
          <Field label="Link" value={proj.link} onChange={v => updateItem('projects', i, 'link', v)} placeholder="https://..." />
          <div className="editor-row">
            <Field label="Start Date" value={proj.startDate} onChange={v => updateItem('projects', i, 'startDate', v)} type="date" />
            <Field label="End Date" value={proj.endDate} onChange={v => updateItem('projects', i, 'endDate', v)} type="date" />
          </div>
          <Field label="Description" value={proj.description} onChange={v => updateItem('projects', i, 'description', v)} rows={3} placeholder="Describe the project..." ai={(val) => handleAIRequest('projects', 'description', val, { index: i })} />
          <Field label="Technologies (one per line)" value={(proj.technologies || []).join('\n')} onChange={v => updateItem('projects', i, 'technologies', v.split('\n').filter(Boolean))} rows={3} placeholder="React&#10;Node.js&#10;MongoDB" />
        </div>
      ))}
      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => addItem('projects', { ...emptyProject })}>
        <Plus size={16} /> Add Project
      </button>
    </div>
  );
}

function renderCertifications(items, updateItem, addItem, removeItem) {
  const handleFileUpload = async (i, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    const base64 = await readFileAsBase64(file);
    updateItem('certifications', i, 'file', base64);
    updateItem('certifications', i, 'fileName', file.name);
    toast.success('Certificate file attached');
  };

  return (
    <div>
      {items.map((cert, i) => (
        <div key={i} className="item-editor">
          <div className="item-editor-header">
            <span className="item-editor-title">{cert.name || `Certification ${i + 1}`}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => removeItem('certifications', i)} style={{ color: 'var(--color-error)' }}>
              <Trash2 size={14} />
            </button>
          </div>
          <Field label="Name" value={cert.name} onChange={v => updateItem('certifications', i, 'name', v)} placeholder="AWS Solutions Architect" />
          <Field label="Issuer" value={cert.issuer} onChange={v => updateItem('certifications', i, 'issuer', v)} placeholder="Amazon" />
          <Field label="Date" value={cert.date} onChange={v => updateItem('certifications', i, 'date', v)} type="date" />
          <Field label="Credential ID" value={cert.credentialId} onChange={v => updateItem('certifications', i, 'credentialId', v)} placeholder="ABC123" />
          <Field label="URL" value={cert.url} onChange={v => updateItem('certifications', i, 'url', v)} placeholder="https://..." />
          <div className="editor-field">
            <label className="label">Certificate File</label>
            {cert.file && cert.fileName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                {cert.file.startsWith('data:image') ? (
                  <Image size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                ) : (
                  <File size={16} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                )}
                <span style={{ flex: 1, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.fileName}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { updateItem('certifications', i, 'file', ''); updateItem('certifications', i, 'fileName', ''); }}
                  style={{ color: 'var(--color-error)', padding: '0.25rem' }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                <Upload size={14} />
                Attach Certificate (PDF/Image)
                <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(i, e)} style={{ display: 'none' }} />
              </label>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>PDF or image, max 5MB</p>
          </div>
        </div>
      ))}
      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => addItem('certifications', { ...emptyCert })}>
        <Plus size={16} /> Add Certification
      </button>
    </div>
  );
}

function renderLanguages(items, updateItem, addItem, removeItem) {
  return (
    <div>
      {items.map((lang, i) => (
        <div key={i} className="item-editor">
          <div className="item-editor-header">
            <span className="item-editor-title">{lang.language || `Language ${i + 1}`}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => removeItem('languages', i)} style={{ color: 'var(--color-error)' }}>
              <Trash2 size={14} />
            </button>
          </div>
          <Field label="Language" value={lang.language} onChange={v => updateItem('languages', i, 'language', v)} placeholder="English" />
          <div className="editor-field">
            <label className="label">Proficiency</label>
            <select className="input" value={lang.proficiency || 'Intermediate'} onChange={e => updateItem('languages', i, 'proficiency', e.target.value)}>
              <option value="Native">Native</option>
              <option value="Fluent">Fluent</option>
              <option value="Advanced">Advanced</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Beginner">Beginner</option>
            </select>
          </div>
        </div>
      ))}
      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => addItem('languages', { ...emptyLang })}>
        <Plus size={16} /> Add Language
      </button>
    </div>
  );
}

function renderCustomSections(items, updateItem, addItem, removeItem) {
  return (
    <div>
      {items.map((sec, i) => (
        <div key={i} className="item-editor">
          <div className="item-editor-header">
            <span className="item-editor-title">{sec.title || `Section ${i + 1}`}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => removeItem('customSections', i)} style={{ color: 'var(--color-error)' }}>
              <Trash2 size={14} />
            </button>
          </div>
          <Field label="Title" value={sec.title} onChange={v => updateItem('customSections', i, 'title', v)} placeholder="Awards" />
          <Field label="Content" value={sec.content} onChange={v => updateItem('customSections', i, 'content', v)} rows={4} placeholder="Section content..." />
        </div>
      ))}
      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => addItem('customSections', { ...emptyCustom })}>
        <Plus size={16} /> Add Custom Section
      </button>
    </div>
  );
}
