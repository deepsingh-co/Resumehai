import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Sparkles, Target, Download, Mail, Phone, MapPin, ArrowRight, CheckCircle } from 'lucide-react';

function Landing() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  const features = [
    { icon: <Sparkles size={28} />, title: 'AI-Powered Content', desc: 'Generate compelling resume content tailored to your industry and experience level.' },
    { icon: <FileText size={28} />, title: 'Professional Templates', desc: 'Choose from multiple ATS-friendly templates designed by hiring experts.' },
    { icon: <Target size={28} />, title: 'Job Matching', desc: 'Optimize your resume for specific job descriptions to maximize interview chances.' },
    { icon: <Download size={28} />, title: 'PDF Export', desc: 'Download your polished resume as a professional PDF ready to send.' },
  ];

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <Link to="/" className="landing-logo">
            <FileText size={28} />
            <span>Resumehai</span>
          </Link>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/login" className="btn btn-ghost">Log In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">AI-Powered Resume Builder</div>
          <h1>Build Your Dream Resume<br /><span className="hero-highlight">in Minutes</span></h1>
          <p className="hero-text">
            Create professional, ATS-optimized resumes with the power of AI. Stand out from the crowd and land your dream job.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Building Free <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">Learn More</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>10K+</strong>
              <span>Resumes Created</span>
            </div>
            <div className="hero-stat">
              <strong>85%</strong>
              <span>Interview Rate</span>
            </div>
            <div className="hero-stat">
              <strong>50+</strong>
              <span>Templates</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card hero-card-1">
            <div className="hero-card-header"></div>
            <div className="hero-card-line"></div>
            <div className="hero-card-line short"></div>
            <div className="hero-card-line"></div>
            <div className="hero-card-line short"></div>
          </div>
          <div className="hero-card hero-card-2">
            <div className="hero-card-header"></div>
            <div className="hero-card-line"></div>
            <div className="hero-card-line short"></div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="section-container">
          <div className="section-header">
            <h2>Everything You Need</h2>
            <p>Powerful features to help you create the perfect resume</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="section-container">
          <div className="about-grid">
            <div className="about-content">
              <h2>Why Choose Resumehai?</h2>
              <p>
                We combine cutting-edge AI technology with industry best practices to help you create resumes that get results. Our platform understands what recruiters look for and helps you highlight your strengths.
              </p>
              <ul className="about-list">
                <li><CheckCircle size={18} /> ATS-optimized formatting</li>
                <li><CheckCircle size={18} /> Industry-specific keywords</li>
                <li><CheckCircle size={18} /> Real-time content suggestions</li>
                <li><CheckCircle size={18} /> Professional design templates</li>
              </ul>
            </div>
            <div className="about-stats">
              <div className="stat-card">
                <div className="stat-number">98%</div>
                <div className="stat-label">Customer Satisfaction</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">3x</div>
                <div className="stat-label">More Interview Calls</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">AI Assistant Available</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">Free to Start</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="section-container">
          <div className="section-header">
            <h2>Get In Touch</h2>
            <p>Have questions? We'd love to hear from you.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={20} />
                <div>
                  <strong>Email</strong>
                  <span>support@resumehai.com</span>
                </div>
              </div>
              <div className="contact-item">
                <Phone size={20} />
                <div>
                  <strong>Phone</strong>
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
              <div className="contact-item">
                <MapPin size={20} />
                <div>
                  <strong>Address</strong>
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="input"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                className="input"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <textarea
                className="input"
                rows={4}
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                {submitted ? 'Message Sent!' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="landing-logo">
              <FileText size={24} />
              <span>Resumehai</span>
            </Link>
            <p>Build professional resumes with AI-powered assistance.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <Link to="/register">Get Started</Link>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#contact">Contact</a>
              <a href="#">Help Center</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Resumehai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
