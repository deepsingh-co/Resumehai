import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Sparkles,
  Star,
} from 'lucide-react';
import '../styles/auth.css';

const content = {
  login: {
    eyebrow: 'AI resume builder',
    title: 'Your next role starts with a stronger resume.',
    description:
      'Sign in to keep tailoring, scoring, and exporting resumes that get past the filters.',
    benefits: [
      'Pick up exactly where you left off',
      'ATS insights saved to your account',
      'Export an updated PDF in seconds',
    ],
  },
  register: {
    eyebrow: 'Free to start',
    title: 'Build a resume that gets you shortlisted.',
    description:
      'Join 10,000+ job seekers using AI to write sharper bullets and pass ATS checks.',
    benefits: [
      'AI-assisted writing and rewriting',
      'Job-description matching',
      'Recruiter-approved templates',
      'One-click PDF export',
    ],
  },
};

export default function AuthLayout({ children, variant = 'login' }) {
  const { eyebrow, title, description, benefits } = content[variant] ?? content.login;

  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <div className="auth-brand-grid" aria-hidden="true" />
        <div className="auth-brand-glow" aria-hidden="true" />
        <div className="auth-brand-glow auth-brand-glow-bottom" aria-hidden="true" />

        <div className="auth-brand-inner">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-mark">
              <FileText size={20} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span>Resumehai</span>
          </Link>

          <div className="auth-brand-copy">
            <span className="auth-brand-eyebrow">
              <Sparkles size={14} aria-hidden="true" />
              {eyebrow}
            </span>
            <h2>{title}</h2>
            <p>{description}</p>

            <ul className="auth-benefits">
              {benefits.map((benefit) => (
                <li key={benefit}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="auth-proof">
            <div className="auth-proof-stars" role="img" aria-label="Rated 5 out of 5">
              {[0, 1, 2, 3, 4].map((star) => (
                <Star key={star} size={13} fill="currentColor" aria-hidden="true" />
              ))}
            </div>
            <blockquote>
              &ldquo;I updated my resume on a Sunday and had two interviews booked by
              Wednesday.&rdquo;
            </blockquote>
            <figcaption>
              <span className="auth-proof-avatar" aria-hidden="true">
                PN
              </span>
              <span className="auth-proof-meta">
                <strong>Priya Nair</strong>
                <span>Product Manager</span>
              </span>
            </figcaption>
          </figure>

          <div className="auth-brand-stats">
            <span>
              <strong>10K+</strong> resumes created
            </span>
            <span className="auth-brand-divider" aria-hidden="true" />
            <span>
              <strong>4.9/5</strong> average rating
            </span>
          </div>
        </div>
      </aside>

      <div className="auth-main">
        <div className="auth-main-inner">
          <div className="auth-main-top">
            <Link to="/" className="auth-back">
              <ArrowLeft size={16} aria-hidden="true" />
              Back to home
            </Link>
          </div>

          <div className="auth-panel">
            <Link to="/" className="auth-mobile-logo">
              <span className="auth-logo-mark">
                <FileText size={18} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span>Resumehai</span>
            </Link>
            {children}
          </div>

          <p className="auth-copyright">
            &copy; {new Date().getFullYear()} Resumehai. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
