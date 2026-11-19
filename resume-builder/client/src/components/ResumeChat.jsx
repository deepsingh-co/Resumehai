import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUp,
  Briefcase,
  ChevronDown,
  FileText,
  Loader2,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';
import api from '../services/api';
import '../styles/chat.css';

const WELCOME_MESSAGE = {
  id: 'coach-welcome',
  role: 'assistant',
  seed: true,
  content:
    "Hi, I'm your Resume Coach. Ask me anything about your resume, ATS screening, or job applications.\n\n" +
    "Choose a resume below and I'll use its actual content in my answers."
};

const RESUME_SUGGESTIONS = [
  'Review my summary',
  'What skills should I add?',
  'Is my resume ATS-ready?'
];

const GENERAL_SUGGESTIONS = [
  'What makes a resume ATS-friendly?',
  'How long should my resume be?',
  'How do I explain a career gap?'
];

const stripHeavyFields = (resume) => {
  if (!resume) return undefined;

  const { _id, user, __v, createdAt, updatedAt, ...rest } = resume;
  const personalInfo = { ...(rest.personalInfo || {}) };
  delete personalInfo.profilePhoto;

  const certifications = (rest.certifications || []).map((certification) => {
    const { file, ...safeCertification } = certification;
    return safeCertification;
  });

  return { ...rest, personalInfo, certifications };
};

function MessageBody({ content }) {
  const blocks = [];
  let bullets = [];

  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ type: 'list', items: bullets });
      bullets = [];
    }
  };

  (content || '').split('\n').forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushBullets();
      return;
    }

    if (/^[-*]\s+/.test(line)) {
      bullets.push(line.replace(/^[-*]\s+/, ''));
      return;
    }

    flushBullets();
    blocks.push({ type: 'paragraph', text: line });
  });

  flushBullets();

  return (
    <div className="coach-text">
      {blocks.map((block, index) =>
        block.type === 'list' ? (
          <ul key={`list-${index}`}>
            {block.items.map((item, itemIndex) => (
              <li key={`item-${itemIndex}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={`paragraph-${index}`}>{block.text}</p>
        )
      )}
    </div>
  );
}

export default function ResumeChat() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [resumesError, setResumesError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jdOpen, setJdOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const fabRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const manualSelectionRef = useRef(false);
  const loadedOnceRef = useRef(false);
  const hasOpenedRef = useRef(false);
  const requestIdRef = useRef(0);

  const routeResumeId = useMemo(() => {
    const match = pathname.match(/^\/resume\/([a-f0-9-]{24})\/(?:edit|preview)/i);
    return match ? match[1] : '';
  }, [pathname]);

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume._id === selectedId) || null,
    [resumes, selectedId]
  );

  const loadResumes = useCallback(async (silent = false) => {
    if (!silent) setResumesLoading(true);
    setResumesError('');

    try {
      const response = await api.get('/resumes');
      setResumes(Array.isArray(response.data) ? response.data : []);
      loadedOnceRef.current = true;
    } catch {
      if (!silent || !loadedOnceRef.current) {
        setResumesError('Could not load your resumes.');
      }
    } finally {
      setResumesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    loadResumes(loadedOnceRef.current);
  }, [open, loadResumes]);

  useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
      const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(timer);
    }

    if (hasOpenedRef.current) {
      manualSelectionRef.current = false;
      const timer = window.setTimeout(() => fabRef.current?.focus(), 40);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open || !resumes.length) return;

    setSelectedId((current) => {
      if (current && resumes.some((resume) => resume._id === current)) return current;
      if (routeResumeId && resumes.some((resume) => resume._id === routeResumeId)) {
        return routeResumeId;
      }
      return resumes[0]._id;
    });
  }, [open, resumes, routeResumeId]);

  useEffect(() => {
    if (!open || !routeResumeId || manualSelectionRef.current) return;
    if (!resumes.some((resume) => resume._id === routeResumeId)) return;
    setSelectedId(routeResumeId);
  }, [open, routeResumeId, resumes]);

  useEffect(() => {
    if (!open) return;

    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [open, messages, sending, error]);

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`;
  }, [input, open]);

  const requestReply = useCallback(
    async (history) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setSending(true);
      setError('');

      try {
        const payload = history
          .filter((message) => !message.seed)
          .slice(-30)
          .map(({ role, content }) => ({ role, content: content.slice(0, 4000) }));

        const response = await api.post('/ai/chat', {
          messages: payload,
          resume: stripHeavyFields(selectedResume),
          jobDescription: jobDescription.trim() || undefined
        });

        if (requestId !== requestIdRef.current) return;

        const reply = response.data?.reply?.trim();
        if (!reply) throw new Error('Empty reply');

        setMessages((current) => [
          ...current,
          {
            id: `coach-${Date.now()}`,
            role: 'assistant',
            content: reply,
            source: response.data?.source
          }
        ]);

        if (Array.isArray(response.data?.suggestions) && response.data.suggestions.length) {
          setSuggestions(response.data.suggestions);
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        const serverMessage =
          err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || '';
        setError(
          serverMessage || 'The coach could not answer just now. Check your connection and try again.'
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setSending(false);
          window.setTimeout(() => {
            if (!document.getElementById('resume-coach-panel')) return;
            const active = document.activeElement;
            if (!active || active === document.body) inputRef.current?.focus();
          }, 0);
        }
      }
    },
    [selectedResume, jobDescription]
  );

  const sendMessage = useCallback(
    (rawText) => {
      const text = (rawText ?? input).trim();
      if (!text || sending) return;

      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text
      };
      const nextMessages = [...messages, userMessage];

      setMessages(nextMessages);
      setInput('');
      setSuggestions(null);
      requestReply(nextMessages);
    },
    [input, messages, requestReply, sending]
  );

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleSelectResume = (event) => {
    manualSelectionRef.current = true;
    setSelectedId(event.target.value);
    setSuggestions(null);
  };

  const resetChat = () => {
    requestIdRef.current += 1;
    setMessages([WELCOME_MESSAGE]);
    setSuggestions(null);
    setError('');
    setSending(false);
    setInput('');
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const closeChat = () => setOpen(false);

  const handlePanelKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeChat();
    }
  };

  const lastMessage = messages[messages.length - 1];
  const starterSuggestions = selectedResume ? RESUME_SUGGESTIONS : GENERAL_SUGGESTIONS;
  const activeSuggestions = (suggestions?.length ? suggestions : starterSuggestions).slice(0, 3);
  const showSuggestions = !sending && !error && lastMessage?.role === 'assistant';

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className="coach-fab"
        aria-expanded={open}
        aria-controls="resume-coach-panel"
        aria-label="Open Resume Coach"
        aria-hidden={open || undefined}
        tabIndex={open ? -1 : 0}
        title="Ask the Resume Coach"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="coach-fab-icon" aria-hidden="true">
          <MessageCircle size={21} />
        </span>
        <span className="coach-fab-text">Resume Coach</span>
      </button>

      {open && (
        <section
          id="resume-coach-panel"
          className="coach-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="resume-coach-title"
          onKeyDown={handlePanelKeyDown}
        >
          <header className="coach-header">
            <span className="coach-avatar" aria-hidden="true">
              <Sparkles size={18} />
            </span>
            <div className="coach-heading">
              <h2 className="coach-title" id="resume-coach-title">
                Resume Coach
              </h2>
              <p className="coach-subtitle">Resume-aware help for doubts and improvements</p>
            </div>
            <div className="coach-header-actions">
              <button
                type="button"
                className="coach-icon-btn"
                onClick={resetChat}
                disabled={sending}
                title="Start over"
                aria-label="Start a new conversation"
              >
                <RotateCcw size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="coach-icon-btn"
                onClick={closeChat}
                title="Close coach"
                aria-label="Close Resume Coach"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="coach-context">
            <label className="coach-context-label" htmlFor="resume-coach-resume">
              <FileText size={14} aria-hidden="true" />
              Resume
            </label>
            <div className="coach-select-wrap">
              <select
                id="resume-coach-resume"
                className="coach-select"
                value={selectedId}
                onChange={handleSelectResume}
                disabled={resumesLoading || !resumes.length}
              >
                {!resumes.length && (
                  <option value="">
                    {resumesLoading ? 'Loading resumes...' : 'No resumes yet'}
                  </option>
                )}
                {resumes.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume.title || 'Untitled resume'}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="coach-select-chevron" aria-hidden="true" />
            </div>

            {resumesError && (
              <p className="coach-context-note coach-context-note--error">
                {resumesError}{' '}
                <button type="button" className="coach-link-btn" onClick={() => loadResumes(false)}>
                  Retry
                </button>
              </p>
            )}

            {!resumesLoading && !resumesError && !resumes.length && (
              <p className="coach-context-note">
                General guidance mode. <Link to="/resume/new">Create a resume</Link> for tailored
                advice.
              </p>
            )}
          </div>

          <div className={`coach-jd ${jdOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              className="coach-jd-toggle"
              onClick={() => setJdOpen((value) => !value)}
              aria-expanded={jdOpen}
              aria-controls="resume-coach-jd"
            >
              <Briefcase size={14} aria-hidden="true" />
              <span>
                {jobDescription.trim() ? 'Job description attached' : 'Tailor to a job (optional)'}
              </span>
              <ChevronDown size={14} className="coach-jd-chevron" aria-hidden="true" />
            </button>

            {jdOpen && (
              <div className="coach-jd-body" id="resume-coach-jd">
                <label className="coach-sr-only" htmlFor="resume-coach-jd-input">
                  Job description
                </label>
                <textarea
                  id="resume-coach-jd-input"
                  className="coach-jd-input"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value.slice(0, 12000))}
                  placeholder="Paste a job description to check keyword match..."
                  rows={3}
                />
                <div className="coach-jd-meta">
                  <span>{jobDescription.length.toLocaleString()} / 12,000</span>
                  {jobDescription && (
                    <button
                      type="button"
                      className="coach-link-btn"
                      onClick={() => setJobDescription('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className="coach-messages"
            ref={messagesRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation with Resume Coach"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`coach-message coach-message--${message.role}`}
              >
                <div className="coach-bubble">
                  <MessageBody content={message.content} />
                </div>
                {message.role === 'assistant' && !message.seed && (
                  <span
                    className={`coach-source ${
                      message.source === 'ai' ? 'coach-source--ai' : ''
                    }`}
                  >
                    <Sparkles size={11} aria-hidden="true" />
                    {message.source === 'ai' ? 'AI answer' : 'Guided tips'}
                  </span>
                )}
              </div>
            ))}

            {sending && (
              <div className="coach-message coach-message--assistant">
                <div className="coach-bubble coach-typing" role="status" aria-label="Resume Coach is thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {error && (
              <div className="coach-error" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <div className="coach-error-body">
                  <p>{error}</p>
                  <button
                    type="button"
                    className="coach-retry"
                    onClick={() => requestReply(messages)}
                    disabled={sending}
                  >
                    <RefreshCw size={13} aria-hidden="true" /> Try again
                  </button>
                </div>
              </div>
            )}

            {showSuggestions && (
              <div className="coach-suggestions" role="group" aria-label="Suggested questions">
                {activeSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="coach-chip"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="coach-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <div className="coach-input-row">
              <label className="coach-sr-only" htmlFor="resume-coach-input">
                Ask the Resume Coach
              </label>
              <textarea
                id="resume-coach-input"
                ref={inputRef}
                className="coach-input"
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 4000))}
                onKeyDown={handleComposerKeyDown}
                placeholder={
                  selectedResume
                    ? `Ask about "${selectedResume.title || 'your resume'}"...`
                    : 'Ask a resume question...'
                }
                rows={1}
                disabled={sending}
              />
              <button
                type="submit"
                className="coach-send"
                disabled={!input.trim() || sending}
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 size={18} className="coach-spin" aria-hidden="true" />
                ) : (
                  <ArrowUp size={18} aria-hidden="true" />
                )}
              </button>
            </div>
            <p className="coach-hint">Enter to send · Shift + Enter for a new line</p>
          </form>
        </section>
      )}
    </>
  );
}
