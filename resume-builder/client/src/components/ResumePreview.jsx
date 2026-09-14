import { useImperativeHandle, forwardRef, useRef } from 'react';
import {
  Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase,
  GraduationCap, Code, FolderKanban, Award, Languages,
  ExternalLink
} from 'lucide-react';
import { html2pdf } from 'html2pdf.js';

const ResumePreview = forwardRef(({ resume }, ref) => {
  const previewRef = useRef(null);

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

  const { personalInfo = {}, experience = [], education = [], skills = [], projects = [], certifications = [], languages = [], customSections = [], template = 'modern' } = resume || {};

  return (
    <div
      ref={previewRef}
      className={`resume-preview ${template}`}
      style={{ maxWidth: '800px', margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}
    >
      <header className="resume-header">
        <h1 className="resume-name">{personalInfo.fullName || 'Your Name'}</h1>
        {personalInfo.summary && <p className="resume-title">{personalInfo.summary}</p>}
        <div className="resume-contact">
          {personalInfo.email && <span><Mail size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {personalInfo.email}</span>}
          {personalInfo.phone && <span><Phone size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {personalInfo.phone}</span>}
          {personalInfo.location && <span><MapPin size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {personalInfo.location}</span>}
          {personalInfo.linkedin && <span><Linkedin size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {personalInfo.linkedin}</span>}
          {personalInfo.github && <span><Github size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {personalInfo.github}</span>}
          {personalInfo.website && <span><Globe size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {personalInfo.website}</span>}
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
                <div className="item-date">{fmtDate(exp.startDate, exp.endDate, exp.current)}</div>
              </div>
              {exp.description && <p className="item-description">{exp.description}</p>}
              {exp.achievements?.filter(Boolean).length > 0 && (
                <ul className="achievements">
                  {exp.achievements.filter(Boolean).map((a, ai) => <li key={ai}>{a}</li>)}
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
                  <div className="item-title">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</div>
                  <div className="item-company">{edu.institution}{edu.location && ` • ${edu.location}`}</div>
                </div>
                <div className="item-date">{fmtDate(edu.startDate, edu.endDate)}</div>
              </div>
              {edu.gpa && <p className="item-description">GPA: {edu.gpa}</p>}
              {edu.achievements?.filter(Boolean).length > 0 && (
                <ul className="achievements">
                  {edu.achievements.filter(Boolean).map((a, ai) => <li key={ai}>{a}</li>)}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading"><Code size={16} /> Skills</h2>
          {(template === 'modern' || template === 'creative') ? (
            <div className="skills-grid">
              {skills.map((skill, i) => (
                <div key={i} className="skill-category">
                  {skill.category && <div className="skill-category-title">{skill.category}</div>}
                  <div className="skill-tags">
                    {skill.items?.filter(Boolean).map((item, si) => <span key={si} className="skill-tag">{item}</span>)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={template === 'classic' ? 'skills-list' : 'skills-inline'}>
              {skills.flatMap(skill => (skill.items || []).filter(Boolean).map((item, si) => (
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
                <div className="item-date">{fmtDate(proj.startDate, proj.endDate)}</div>
              </div>
              {proj.description && <p className="item-description">{proj.description}</p>}
              {proj.technologies?.filter(Boolean).length > 0 && (
                <div className="skill-tags" style={{ marginTop: '0.5rem' }}>
                  {proj.technologies.filter(Boolean).map((t, ti) => <span key={ti} className="skill-tag">{t}</span>)}
                </div>
              )}
              {proj.link && (
                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="item-description" style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ExternalLink size={14} />{proj.link}
                </a>
              )}
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
              {cert.url && (
                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="item-description" style={{ marginTop: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ExternalLink size={14} />Verify
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {languages.length > 0 && (
        <section className="resume-section">
          <h2 className="section-heading"><Languages size={16} /> Languages</h2>
          <div className="skills-inline">
            {languages.map((lang, i) => (
              <span key={i} className="skill-tag">{lang.language}{lang.proficiency ? ` (${lang.proficiency})` : ''}</span>
            ))}
          </div>
        </section>
      )}

      {customSections?.filter(s => s.title || s.content).map((sec, i) => (
        <section key={i} className="resume-section">
          <h2 className="section-heading">{sec.title}</h2>
          <div className="item-description" style={{ whiteSpace: 'pre-wrap' }}>{sec.content}</div>
        </section>
      ))}
    </div>
  );
});

function fmtDate(start, end, current) {
  const f = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
  if (current) return `${f(start)} – Present`;
  if (start && end) return `${f(start)} – ${f(end)}`;
  if (start) return f(start);
  return '';
}

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
