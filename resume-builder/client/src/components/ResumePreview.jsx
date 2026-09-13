import { useState, useImperativeHandle, forwardRef } from 'react';
import { useRef } from 'react';
import {
  Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase,
  GraduationCap, Code, FolderKanban, Award, Languages,
  Edit2, Sparkles, Loader2, Trash2, GripVertical, ChevronDown, ChevronUp,
  Download, FileText, ExternalLink
} from 'lucide-react';
import { html2pdf } from 'html2pdf.js';

const ResumePreview = forwardRef((props, ref) => {
  const { resume, editMode, onAIRequest } = props;
  const previewRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useImperativeHandle(ref, () => ({
    exportPDF: () => exportPDF()
  }));

  const exportPDF = async () => {
    const element = previewRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `${resume.title || 'resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  const startEdit = (section, item = null, index = null) => {
    if (item) {
      setEditForm({ ...item });
    } else {
      setEditForm(getDefaultItem(section));
    }
    setEditingId({ section, index });
  };

  const getDefaultItem = (section) => {
    const defaults = {
      experience: { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '', achievements: [''] },
      education: { institution: '', degree: '', fieldOfStudy: '', location: '', startDate: '', endDate: '', gpa: '', achievements: [''] },
      skills: { category: '', items: [''] },
      projects: { name: '', description: '', technologies: [''], link: '', startDate: '', endDate: '' },
      certifications: { name: '', issuer: '', date: '', credentialId: '', url: '' },
      languages: { language: '', proficiency: '' },
      customSections: { title: '', content: '' }
    };
    return defaults[section] || {};
  };

  const saveEdit = (section, index) => {
    if (editMode && props.onSave) {
      props.onSave(section, editForm, index);
    }
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleAI = (field, value, context = {}) => {
    if (onAIRequest) {
      onAIRequest(editingId.section, field, value, context);
    }
  };

  if (!editMode) {
    return (
      <div
        ref={previewRef}
        className={`resume-preview ${resume.template}`}
        style={{ maxWidth: '800px', margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}
      >
        {renderResume(resume)}
      </div>
    );
  }

  return (
    <div
      ref={previewRef}
      className={`resume-preview ${resume.template}`}
      style={{ maxWidth: '800px', margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}
    >
      {renderResume(resume, true)}

      {editingId && (
        <div className="ai-suggestion-popover" style={{ position: 'fixed', bottom: '20px', right: '20px', left: 'auto', top: 'auto', maxWidth: '400px', width: '90vw' }}>
          <div style={{ padding: '1rem', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Editing {editingId.section}</strong>
            <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: 'white', padding: '0.25rem' }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
            {renderEditForm(editingId.section, editingId.index)}
          </div>
        </div>
      )}
    </div>
  );
});

function renderResume(resume, editMode = false) {
  const { personalInfo, experience, education, skills, projects, certifications, languages, customSections, template } = resume;

  return (
    <>
      <header className="resume-header">
        <h1 className="resume-name">{personalInfo.fullName || 'Your Name'}</h1>
        {personalInfo.summary && <p className="resume-title">{personalInfo.summary}</p>}
        <div className="resume-contact">
          {personalInfo.email && <span><Mail size={14} style={{marginRight:'4px',verticalAlign:'middle'}}/> {personalInfo.email}</span>}
          {personalInfo.phone && <span><Phone size={14} style={{marginRight:'4px',verticalAlign:'middle'}}/> {personalInfo.phone}</span>}
          {personalInfo.location && <span><MapPin size={14} style={{marginRight:'4px',verticalAlign:'middle'}}/> {personalInfo.location}</span>}
          {personalInfo.linkedin && <span><Linkedin size={14} style={{marginRight:'4px',verticalAlign:'middle'}}/> {personalInfo.linkedin}</span>}
          {personalInfo.github && <span><Github size={14} style={{marginRight:'4px',verticalAlign:'middle'}}/> {personalInfo.github}</span>}
          {personalInfo.website && <span><Globe size={14} style={{marginRight:'4px',verticalAlign:'middle'}}/> {personalInfo.website}</span>}
        </div>
      </header>

      {experience.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading"><Briefcase size={16} /> Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} className="experience-item">
              <div className="item-header">
                <div>
                  <div className="item-title">{exp.position}</div>
                  <div className="item-company">{exp.company}{exp.location && ` • ${exp.location}`}</div>
                </div>
                <div className="item-date">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </div>
              </div>
              {exp.description && <p className="item-description">{exp.description}</p>}
              {exp.achievements?.filter(Boolean).length > 0 && (
                <ul className="achievements">
                  {exp.achievements.filter(Boolean).map((ach, ai) => (
                    <li key={ai}>{ach}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading"><GraduationCap size={16} /> Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="education-item">
              <div className="item-header">
                <div>
                  <div className="item-title">{edu.degree} in {edu.fieldOfStudy}</div>
                  <div className="item-company">{edu.institution}{edu.location && ` • ${edu.location}`}</div>
                </div>
                <div className="item-date">
                  {formatDateRange(edu.startDate, edu.endDate)}
                </div>
              </div>
              {edu.gpa && <p className="item-description">GPA: {edu.gpa}</p>}
              {edu.achievements?.filter(Boolean).length > 0 && (
                <ul className="achievements">
                  {edu.achievements.filter(Boolean).map((ach, ai) => (
                    <li key={ai}>{ach}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading"><Code size={16} /> Skills</h2>
          {template === 'modern' || template === 'creative' ? (
            <div className="skills-grid">
              {skills.map((skill, i) => (
                <div key={i} className="skill-category">
                  <div className="skill-category-title">{skill.category}</div>
                  <div className="skill-tags">
                    {skill.items.map((item, si) => (
                      <span key={si} className="skill-tag">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={template === 'classic' ? 'skills-list' : 'skills-inline'}>
              {skills.flatMap(skill => skill.items.map((item, si) => (
                <span key={si} className={template === 'classic' ? 'skill-item' : 'skill-tag'}>{item}</span>
              )))}
            </div>
          )}
        </section>
      )}

      {projects.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading"><FolderKanban size={16} /> Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} className="experience-item">
              <div className="item-header">
                <div className="item-title">{proj.name}</div>
                <div className="item-date">{formatDateRange(proj.startDate, proj.endDate)}</div>
              </div>
              {proj.description && <p className="item-description">{proj.description}</p>}
              {proj.technologies?.length > 0 && (
                <div className="skill-tags" style={{marginTop:'0.5rem'}}>
                  {proj.technologies.map((tech, ti) => (
                    <span key={ti} className="skill-tag">{tech}</span>
                  ))}
                </div>
              )}
              {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="item-description" style={{marginTop:'0.5rem',display:'inline-flex',alignItems:'center',gap:'4px'}}><ExternalLink size={14}/>{proj.link}</a>}
            </div>
          ))}
        </section>
      )}

      {certifications.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading"><Award size={16} /> Certifications</h2>
          {certifications.map((cert, i) => (
            <div key={i} className="experience-item">
              <div className="item-header">
                <div className="item-title">{cert.name}</div>
                <div className="item-date">{cert.date}</div>
              </div>
              <div className="item-company">{cert.issuer}</div>
              {cert.credentialId && <div className="item-description">Credential: {cert.credentialId}</div>}
              {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" className="item-description" style={{marginTop:'0.25rem',display:'inline-flex',alignItems:'center',gap:'4px'}}><ExternalLink size={14}/>Verify</a>}
            </div>
          ))}
        </section>
      )}

      {languages.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading"><Languages size={16} /> Languages</h2>
          <div className="skills-inline">
            {languages.map((lang, i) => (
              <span key={i} className="skill-tag">{lang.language} ({lang.proficiency})</span>
            ))}
          </div>
        </section>
      )}

      {customSections?.length > 0 && customSections.map((sec, i) => (
        <section key={i} className="resume-section">
          <h2 className="section-heading">{sec.title}</h2>
          <div className="item-description" style={{whiteSpace:'pre-wrap'}}>{sec.content}</div>
        </section>
      ))}
    </>
  );
}

function formatDateRange(start, end, current) {
  const format = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
  if (current) return `${format(start)} – Present`;
  if (start && end) return `${format(start)} – ${format(end)}`;
  if (start) return format(start);
  return '';
}

function renderEditForm(section, index) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        Edit form for {section}#{index}
      </p>
      <button className="btn btn-primary" style={{ width: '100%' }}>Save Changes</button>
      <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => window.dispatchEvent(new Event('cancel-edit'))}>Cancel</button>
    </div>
  );
}

export default ResumePreview;