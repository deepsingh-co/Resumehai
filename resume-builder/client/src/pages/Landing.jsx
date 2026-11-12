import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Gauge,
  LayoutTemplate,
  Mail,
  MapPin,
  Menu,
  PenLine,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  X,
} from 'lucide-react';
import '../styles/landing.css';

const stats = [
  { value: '10K+', label: 'Resumes created' },
  { value: '85%', label: 'Interview rate' },
  { value: '50+', label: 'ATS-ready templates' },
  { value: '4.9/5', label: 'Average rating' },
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing">
      <header className="landing-nav-wrap">
        <nav className="landing-nav" aria-label="Landing page navigation">
          <Link to="/" className="landing-logo" onClick={closeMenu}>
            <span className="landing-logo-mark">
              <FileText size={20} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span>Resumehai</span>
          </Link>

          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#testimonials">Stories</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="landing-nav-actions">
            <Link to="/login" className="landing-login">
              Log in
            </Link>
            <Link to="/register" className="landing-btn landing-btn-primary landing-btn-sm">
              Get started
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            className="landing-menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>

        {menuOpen && (
          <div id="landing-mobile-menu" className="landing-mobile-menu">
            <a href="#features" onClick={closeMenu}>
              Features
            </a>
            <a href="#how-it-works" onClick={closeMenu}>
              How it works
            </a>
            <a href="#testimonials" onClick={closeMenu}>
              Stories
            </a>
            <a href="#contact" onClick={closeMenu}>
              Contact
            </a>
            <div className="landing-mobile-actions">
              <Link to="/login" className="landing-btn landing-btn-secondary" onClick={closeMenu}>
                Log in
              </Link>
              <Link to="/register" className="landing-btn landing-btn-primary" onClick={closeMenu}>
                Get started
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-container landing-hero-inner">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow">
                <Sparkles size={15} aria-hidden="true" />
                AI resume builder · ATS-ready
              </span>

              <h1>
                Build a resume that gets you <span className="landing-highlight">shortlisted</span>.
              </h1>

              <p className="landing-hero-text">
                AI writes, tailors, and scores your resume against real job descriptions — so you
                spend less time formatting and more time interviewing.
              </p>

              <div className="landing-hero-actions">
                <Link to="/register" className="landing-btn landing-btn-primary">
                  Build my resume free
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <a href="#how-it-works" className="landing-btn landing-btn-secondary">
                  See how it works
                </a>
              </div>

              <div className="landing-hero-trust">
                <div className="landing-avatars" aria-hidden="true">
                  <span className="landing-avatar landing-avatar-1">PN</span>
                  <span className="landing-avatar landing-avatar-2">DR</span>
                  <span className="landing-avatar landing-avatar-3">AK</span>
                  <span className="landing-avatar landing-avatar-4">JS</span>
                </div>
                <div className="landing-trust-copy">
                  <div className="landing-stars" role="img" aria-label="Rated 5 out of 5">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star key={star} size={13} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <span>Trusted by 10,000+ job seekers</span>
                </div>
              </div>
            </div>

            <div className="landing-hero-visual" aria-hidden="true">
              <div className="landing-resume-window">
                <div className="landing-window-bar">
                  <span className="landing-window-dot" />
                  <span className="landing-window-dot" />
                  <span className="landing-window-dot" />
                  <div className="landing-window-url">resumehai.app/editor</div>
                </div>

                <div className="landing-resume">
                  <div className="landing-resume-top">
                    <div className="landing-resume-avatar">AS</div>
                    <div>
                      <p className="landing-resume-name">Aarav Sharma</p>
                      <p className="landing-resume-role">Senior Product Designer</p>
                    </div>
                  </div>

                  <div className="landing-resume-contact">
                    <span>aarav@email.com</span>
                    <span>San Francisco, CA</span>
                  </div>

                  <div className="landing-resume-divider" />

                  <p className="landing-resume-heading">Experience</p>
                  <div className="landing-resume-job">
                    <strong>Senior Product Designer</strong>
                    <span>2021 — Present</span>
                  </div>
                  <p className="landing-resume-company">Northstar Labs</p>
                  <ul className="landing-resume-bullets">
                    <li>Led onboarding redesign that lifted activation by 28%.</li>
                    <li>Built a design system used by 4 product teams.</li>
                  </ul>

                  <div className="landing-resume-divider" />

                  <p className="landing-resume-heading">Skills</p>
                  <div className="landing-resume-skills">
                    <span className="landing-skill">Figma</span>
                    <span className="landing-skill">Design Systems</span>
                    <span className="landing-skill">Prototyping</span>
                    <span className="landing-skill">User Research</span>
                  </div>
                </div>
              </div>

              <div className="landing-float landing-float-ats">
                <div className="landing-ats-ring">94</div>
                <div>
                  <strong>ATS score</strong>
                  <span>Top 5% of resumes</span>
                </div>
              </div>

              <div className="landing-float landing-float-ai">
                <div className="landing-float-ai-icon">
                  <Sparkles size={17} />
                </div>
                <div>
                  <strong>AI rewrite</strong>
                  <span>Added 2 impact metrics</span>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-container">
            <div className="landing-statsbar">
              {stats.map((stat) => (
                <div key={stat.label} className="landing-stat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Landing;
