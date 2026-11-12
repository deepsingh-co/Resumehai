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

const features = [
  {
    icon: Sparkles,
    title: 'AI content engine',
    description: 'Turn rough notes into recruiter-ready bullet points with measurable impact.',
  },
  {
    icon: Gauge,
    title: 'ATS match score',
    description: 'Paste a job description and see exactly what to fix before you apply.',
  },
  {
    icon: LayoutTemplate,
    title: 'Recruiter-approved templates',
    description: 'Clean, ATS-safe layouts that look sharp in every PDF viewer.',
  },
  {
    icon: Download,
    title: 'One-click PDF export',
    description: 'Download a pixel-perfect PDF, ready to attach or upload.',
  },
];

const steps = [
  {
    icon: PenLine,
    label: 'Step 01',
    title: 'Add your experience',
    description: 'Fill in your details or start from a demo resume. The editor keeps everything structured.',
  },
  {
    icon: Target,
    label: 'Step 02',
    title: 'Match it to the role',
    description: 'Paste a job description. AI highlights missing keywords and rewrites weak bullet points.',
  },
  {
    icon: ClipboardCheck,
    label: 'Step 03',
    title: 'Export and apply',
    description: 'Check your ATS score, pick a template, and download a PDF that is ready to send.',
  },
];

const testimonials = [
  {
    quote:
      'I updated my resume on a Sunday and had two interviews booked by Wednesday. The ATS score showed me exactly what was missing.',
    name: 'Priya Nair',
    role: 'Product Manager',
    initials: 'PN',
  },
  {
    quote:
      'The AI suggestions are specific, not generic. Every bullet point sounds like something a recruiter would actually want to read.',
    name: 'Daniel Reyes',
    role: 'Data Analyst',
    initials: 'DR',
  },
  {
    quote:
      'Finally, a builder that does not make my resume look like a template. Clean layouts, fast export, zero formatting headaches.',
    name: 'Aisha Khan',
    role: 'UX Designer',
    initials: 'AK',
  },
];

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

        <section id="features" className="landing-section landing-features" aria-labelledby="features-title">
          <div className="landing-container">
            <div className="landing-section-head">
              <span className="landing-kicker">Features</span>
              <h2 id="features-title">Everything you need to get shortlisted</h2>
              <p>
                From the first draft to the final PDF, Resumehai handles the details recruiters and
                applicant tracking systems look for.
              </p>
            </div>

            <div className="landing-feature-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="landing-feature-card">
                    <span className="landing-feature-index">{String(index + 1).padStart(2, '0')}</span>
                    <div className="landing-feature-icon">
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-section landing-how" aria-labelledby="how-title">
          <div className="landing-container">
            <div className="landing-section-head">
              <span className="landing-kicker">How it works</span>
              <h2 id="how-title">Three steps from blank page to interview-ready</h2>
              <p>No design skills, no formatting rabbit holes. Just a resume that fits the role.</p>
            </div>

            <div className="landing-steps">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="landing-step">
                    <div className="landing-step-icon">
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <span className="landing-step-label">{step.label}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </article>
                );
              })}
            </div>

            <div className="landing-inline-cta">
              <Link to="/register" className="landing-btn landing-btn-primary">
                Start building — it&apos;s free
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section id="about" className="landing-section landing-about" aria-labelledby="about-title">
          <div className="landing-container landing-about-grid">
            <div className="landing-about-copy">
              <span className="landing-kicker">Why Resumehai</span>
              <h2 id="about-title">Designed to pass the six-second scan</h2>
              <p>
                Recruiters skim. Applicant tracking systems filter. Resumehai optimizes for both, so
                your experience gets read instead of skipped.
              </p>

              <ul className="landing-checklist">
                <li>
                  <CheckCircle2 className="landing-check" size={18} aria-hidden="true" />
                  ATS-optimized formatting
                </li>
                <li>
                  <CheckCircle2 className="landing-check" size={18} aria-hidden="true" />
                  Job-specific keywords
                </li>
                <li>
                  <CheckCircle2 className="landing-check" size={18} aria-hidden="true" />
                  Quantified achievements
                </li>
                <li>
                  <CheckCircle2 className="landing-check" size={18} aria-hidden="true" />
                  Instant readability
                </li>
              </ul>
            </div>

            <div className="landing-about-stats">
              <div className="landing-stat-card">
                <div className="landing-stat-value">98%</div>
                <div className="landing-stat-desc">Customer satisfaction</div>
              </div>
              <div className="landing-stat-card">
                <div className="landing-stat-value">3x</div>
                <div className="landing-stat-desc">More interview calls</div>
              </div>
              <div className="landing-stat-card">
                <div className="landing-stat-value">24/7</div>
                <div className="landing-stat-desc">AI assistant available</div>
              </div>
              <div className="landing-stat-card">
                <div className="landing-stat-value">100%</div>
                <div className="landing-stat-desc">Free to start</div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="landing-section landing-testimonials"
          aria-labelledby="testimonials-title"
        >
          <div className="landing-container">
            <div className="landing-section-head">
              <span className="landing-kicker">Job seeker stories</span>
              <h2 id="testimonials-title">Real resumes. Real interviews.</h2>
              <p>
                A few results from people who stopped guessing and started applying with confidence.
              </p>
            </div>

            <div className="landing-testimonial-grid">
              {testimonials.map((testimonial) => (
                <figure key={testimonial.name} className="landing-testimonial">
                  <div className="landing-testimonial-stars" role="img" aria-label="5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star key={star} size={13} fill="currentColor" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
                  <figcaption className="landing-testimonial-author">
                    <div className="landing-testimonial-avatar" aria-hidden="true">
                      {testimonial.initials}
                    </div>
                    <div>
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.role}</span>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta" aria-labelledby="cta-title">
          <div className="landing-container landing-cta-inner">
            <div>
              <h2 id="cta-title">Your next role is one better resume away.</h2>
              <p>Start free. No credit card, no templates to wrestle with.</p>
            </div>
            <Link to="/register" className="landing-btn landing-btn-light">
              Build my resume free
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Landing;
