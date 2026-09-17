import { useState } from 'react';
import api from '../services/api';
import { Loader2, CheckCircle, AlertCircle, Target, TrendingUp, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function ATSScore({ resume, onClose }) {
  const [jobDescription, setJobDescription] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showJobInput, setShowJobInput] = useState(false);
  const [expanded, setExpanded] = useState({ strengths: true, improvements: true, keywords: false, suggestions: false });

  const analyzeResume = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/ats-score', {
        resume,
        jobDescription: jobDescription.trim() || undefined
      });
      setScore(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (value) => {
    if (value >= 80) return '#10b981';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (value) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Needs Work';
  };

  const toggleSection = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="ats-panel">
      <div className="ats-header">
        <div className="ats-header-left">
          <Target size={18} />
          <strong>ATS Score Checker</strong>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={16} /></button>
      </div>

      <div className="ats-body">
        <button
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'space-between', marginBottom: '1rem' }}
          onClick={() => setShowJobInput(!showJobInput)}
        >
          <span>{showJobInput ? 'Hide' : '+ Add'} Job Description</span>
          {showJobInput ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showJobInput && (
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              className="input"
              rows={4}
              placeholder="Paste the job description here for better ATS matching..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
              Adding a job description helps match keywords for specific roles
            </p>
          </div>
        )}

        <button
          onClick={analyzeResume}
          className="btn btn-primary"
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? (
            <><Loader2 size={16} className="loading" /> Analyzing...</>
          ) : (
            <><TrendingUp size={16} /> Check ATS Score</>
          )}
        </button>

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgb(239 68 68 / 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {score && (
          <div className="ats-results">
            <div className="ats-overall">
              <div className="ats-score-circle" style={{ borderColor: getScoreColor(score.overall) }}>
                <span className="ats-score-number" style={{ color: getScoreColor(score.overall) }}>{score.overall}</span>
                <span className="ats-score-label">{getScoreLabel(score.overall)}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                Overall ATS Compatibility
              </p>
            </div>

            <div className="ats-sections">
              {Object.entries(score.sections || {}).map(([key, value]) => (
                <div key={key} className="ats-section-bar">
                  <div className="ats-section-header">
                    <span className="ats-section-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span className="ats-section-value" style={{ color: getScoreColor(value) }}>{value}%</span>
                  </div>
                  <div className="ats-bar-track">
                    <div className="ats-bar-fill" style={{ width: `${value}%`, background: getScoreColor(value) }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="ats-lists">
              {score.strengths?.length > 0 && (
                <div className="ats-list-section">
                  <button className="ats-list-toggle" onClick={() => toggleSection('strengths')}>
                    <CheckCircle size={14} style={{ color: '#10b981' }} />
                    <span>Strengths ({score.strengths.length})</span>
                    {expanded.strengths ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expanded.strengths && (
                    <ul className="ats-list ats-list-strengths">
                      {score.strengths.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {score.improvements?.length > 0 && (
                <div className="ats-list-section">
                  <button className="ats-list-toggle" onClick={() => toggleSection('improvements')}>
                    <AlertCircle size={14} style={{ color: '#f59e0b' }} />
                    <span>Improvements ({score.improvements.length})</span>
                    {expanded.improvements ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expanded.improvements && (
                    <ul className="ats-list ats-list-improvements">
                      {score.improvements.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>
              )}

              {score.missingKeywords?.length > 0 && (
                <div className="ats-list-section">
                  <button className="ats-list-toggle" onClick={() => toggleSection('keywords')}>
                    <Target size={14} style={{ color: '#ef4444' }} />
                    <span>Missing Keywords ({score.missingKeywords.length})</span>
                    {expanded.keywords ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expanded.keywords && (
                    <div className="ats-keywords">
                      {score.missingKeywords.map((kw, i) => (
                        <span key={i} className="ats-keyword-tag">{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {score.suggestions?.length > 0 && (
                <div className="ats-list-section">
                  <button className="ats-list-toggle" onClick={() => toggleSection('suggestions')}>
                    <TrendingUp size={14} style={{ color: '#2563eb' }} />
                    <span>Suggestions ({score.suggestions.length})</span>
                    {expanded.suggestions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expanded.suggestions && (
                    <ul className="ats-list ats-list-suggestions">
                      {score.suggestions.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
