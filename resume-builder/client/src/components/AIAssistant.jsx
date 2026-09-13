import { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, Sparkles, Check, X, RefreshCw } from 'lucide-react';

export default function AIAssistant({ context, onAccept, onClose }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    fetchSuggestions();
  }, [context]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai/suggest', {
        type: getAIType(context.section),
        content: context.value,
        context: {
          targetRole: context.targetRole,
          position: context.position,
          company: context.company,
          section: context.section,
          field: context.field
        }
      });
      const text = res.data.suggestion;
      const lines = text.split('\n').filter(l => l.trim());
      setSuggestions(lines.map((line, i) => ({
        id: i,
        text: line.replace(/^[-•\d.\s]+/, '').trim()
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const getAIType = (section) => {
    switch (section) {
      case 'personalInfo': return 'rewriteSummary';
      case 'experience': return 'improveBullet';
      case 'projects': return 'generateBullets';
      case 'skills': return 'suggestSkills';
      default: return 'improveBullet';
    }
  };

  const handleAccept = (suggestion) => {
    onAccept(suggestion.text);
  };

  const handleRegenerate = () => {
    fetchSuggestions();
  };

  if (!context.value && context.section !== 'skills') {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <Sparkles size={32} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Add some content first, then click the sparkles icon for AI suggestions</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '200px' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
          <strong>AI Suggestions</strong>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '1rem' }}>
            <Loader2 className="loading" style={{ width: '2rem', height: '2rem' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>Generating suggestions...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-error)' }}>
            <p>{error}</p>
            <button onClick={fetchSuggestions} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
              <RefreshCw size={14} style={{ marginRight: '0.25rem' }} /> Try Again
            </button>
          </div>
        )}

        {suggestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              Click a suggestion to apply it:
            </p>
            {suggestions.map((suggestion, i) => (
              <button
                key={suggestion.id}
                onClick={() => handleAccept(suggestion)}
                className={`ai-suggestion-item ${selectedIndex === i ? 'accepted' : ''}`}
                onMouseEnter={() => setSelectedIndex(i)}
                onMouseLeave={() => setSelectedIndex(-1)}
                style={{
                  textAlign: 'left',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: selectedIndex === i ? 'rgb(16 185 129 / 0.1)' : 'transparent',
                  border: selectedIndex === i ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'var(--transition)'
                }}
              >
                <Check size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{suggestion.text}</span>
              </button>
            ))}
          </div>
        )}

        {!loading && suggestions.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>
            <p>No suggestions generated. Try adding more content.</p>
            <button onClick={handleRegenerate} className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem' }}>
              <RefreshCw size={14} style={{ marginRight: '0.25rem' }} /> Regenerate
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleRegenerate} className="btn btn-ghost btn-sm" style={{ flex: 1 }} disabled={loading}>
          <RefreshCw size={14} style={{ marginRight: '0.25rem' }} /> Regenerate
        </button>
        <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}