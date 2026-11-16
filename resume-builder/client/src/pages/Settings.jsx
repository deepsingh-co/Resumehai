import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import { applyTheme, getStoredTheme } from '../utils/theme';
import '../styles/settings.css';

const NOTIFICATION_KEY = 'resumehai-notifications';
const defaultNotifications = { product: true, reminders: true, tips: false };

const readNotifications = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || 'null');
    return { ...defaultNotifications, ...(stored || {}) };
  } catch {
    return defaultNotifications;
  }
};

const TABS = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    title: 'Profile details',
    description: 'The basics that identify you across Resumehai.',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Lock,
    title: 'Password & security',
    description: 'Keep your account protected with a strong password.',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Choose which updates are worth your attention.',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
    title: 'Appearance',
    description: 'Pick the theme that feels best for your workspace.',
  },
  {
    id: 'danger',
    label: 'Danger zone',
    icon: Trash2,
    title: 'Danger zone',
    description: 'Irreversible actions for your account and data.',
  },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', description: 'Bright and focused', icon: Sun },
  { value: 'dark', label: 'Dark', description: 'Easy on the eyes', icon: Moon },
  { value: 'system', label: 'System', description: 'Match your device', icon: Monitor },
];

function PasswordInput({ id, label, value, onChange, error, visible, onToggle, autoComplete }) {
  const errorId = `${id}-error`;

  return (
    <div className="settings-field">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className={`settings-input${error ? ' has-error' : ''}`}>
        <Lock size={16} aria-hidden="true" />
        <input
          type={visible ? 'text' : 'password'}
          id={id}
          name={id}
          className="input"
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          className="settings-input__toggle"
          onClick={onToggle}
          aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && (
        <p className="settings-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [notifications, setNotifications] = useState(readNotifications);
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!showDeleteConfirm) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !deleting) setShowDeleteConfirm(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [showDeleteConfirm, deleting]);

  const activeMeta = TABS.find((tab) => tab.id === activeTab);
  const ActiveIcon = activeMeta.icon;

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateProfile = () => {
    const nextErrors = {};
    if (!profile.name.trim()) nextErrors.name = 'Name is required';
    if (!profile.email) nextErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) nextErrors.email = 'Invalid email format';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validatePassword = () => {
    const nextErrors = {};
    if (!password.current) nextErrors.current = 'Current password is required';
    if (!password.new) nextErrors.new = 'New password is required';
    else if (password.new.length < 6) nextErrors.new = 'Password must be at least 6 characters';
    if (password.new !== password.confirm) nextErrors.confirm = 'Passwords do not match';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      setProfile({ name: res.data.user.name, email: res.data.user.email });
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      const fieldErrors = {};
      if (Array.isArray(err.response?.data?.errors)) {
        err.response.data.errors.forEach((error) => {
          fieldErrors[error.path] = error.msg;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      await api.put('/auth/password', {
        current: password.current,
        new: password.new,
      });
      toast.success('Password changed');
      setPassword({ current: '', new: '', confirm: '' });
      setVisiblePasswords({ current: false, new: false, confirm: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password';
      if (/current password/i.test(message)) {
        setErrors((prev) => ({ ...prev, current: message }));
      }
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    try {
      localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Could not save preferences on this device');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/account');
      toast.success('Your account has been deleted');
      setShowDeleteConfirm(false);
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const passwordChecks = [
    password.new.length >= 8,
    /[A-Z]/.test(password.new),
    /[0-9]/.test(password.new),
    /[^A-Za-z0-9]/.test(password.new),
  ];
  const passwordStrength = passwordChecks.filter(Boolean).length;
  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];

  return (
    <div className="settings-page">
      <header className="settings-hero">
        <Link to="/dashboard" className="settings-back">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
        <p className="settings-eyebrow">
          <span className="settings-eyebrow__dot" aria-hidden="true" />
          Account settings
        </p>
        <h1>Settings</h1>
        <p className="settings-hero__lead">
          Manage your profile, secure your account, and make the workspace feel like yours.
        </p>
      </header>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <div className="settings-profile">
            <div className="settings-profile__avatar" aria-hidden="true">
              {initials || 'U'}
            </div>
            <div className="settings-profile__info">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <span className="settings-profile__badge">
              <ShieldCheck size={12} />
              Private
            </span>
          </div>

          <nav className="settings-nav" aria-label="Settings sections">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setErrors({});
                  }}
                  className={`settings-nav__item${isActive ? ' is-active' : ''}${
                    tab.id === 'danger' ? ' settings-nav__item--danger' : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="settings-nav__icon" aria-hidden="true">
                    <Icon size={17} />
                  </span>
                  {tab.label}
                  <ChevronRight size={15} className="settings-nav__chevron" aria-hidden="true" />
                </button>
              );
            })}
          </nav>

          <div className="settings-privacy">
            <ShieldCheck size={18} aria-hidden="true" />
            <div>
              <strong>Private by default</strong>
              <span>Only you can see your resumes and account details.</span>
            </div>
          </div>
        </aside>

        <section className="settings-panel" aria-labelledby="settings-panel-title">
          <div className="settings-panel__head">
            <span className="settings-panel__icon" aria-hidden="true">
              <ActiveIcon size={19} />
            </span>
            <div>
              <h2 id="settings-panel-title">{activeMeta.title}</h2>
              <p>{activeMeta.description}</p>
            </div>
          </div>

          <div className="settings-panel__body">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} noValidate>
                <div className="settings-identity">
                  <div className="settings-identity__avatar" aria-hidden="true">
                    {initials || 'U'}
                  </div>
                  <div className="settings-identity__copy">
                    <strong>{profile.name || 'Your name'}</strong>
                    <span>{profile.email || 'you@example.com'}</span>
                  </div>
                  <span className="settings-chip">
                    <Check size={12} />
                    Personal account
                  </span>
                </div>

                <div className="settings-grid">
                  <div className="settings-field">
                    <label htmlFor="name" className="label">
                      Full name
                    </label>
                    <div className={`settings-input${errors.name ? ' has-error' : ''}`}>
                      <User size={16} aria-hidden="true" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="input"
                        value={profile.name}
                        onChange={handleProfileChange}
                        placeholder="John Doe"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                    </div>
                    {errors.name && (
                      <p className="settings-error" id="name-error">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="settings-field">
                    <label htmlFor="email" className="label">
                      Email address
                    </label>
                    <div className={`settings-input${errors.email ? ' has-error' : ''}`}>
                      <Mail size={16} aria-hidden="true" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="input"
                        value={profile.email}
                        onChange={handleProfileChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                    </div>
                    {errors.email && (
                      <p className="settings-error" id="email-error">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="settings-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader2 size={16} className="settings-spin" /> : <Check size={16} />}
                    Save changes
                  </button>
                  <p>Your email is used to sign in to Resumehai.</p>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} noValidate>
                <div className="settings-callout">
                  <span className="settings-callout__icon" aria-hidden="true">
                    <ShieldCheck size={19} />
                  </span>
                  <div>
                    <strong>Use a strong, unique password</strong>
                    <p>Mix upper and lower case letters, numbers, and a symbol.</p>
                  </div>
                </div>

                <PasswordInput
                  id="current"
                  label="Current password"
                  value={password.current}
                  onChange={handlePasswordChange}
                  error={errors.current}
                  visible={visiblePasswords.current}
                  onToggle={() =>
                    setVisiblePasswords((prev) => ({ ...prev, current: !prev.current }))
                  }
                  autoComplete="current-password"
                />

                <PasswordInput
                  id="new"
                  label="New password"
                  value={password.new}
                  onChange={handlePasswordChange}
                  error={errors.new}
                  visible={visiblePasswords.new}
                  onToggle={() => setVisiblePasswords((prev) => ({ ...prev, new: !prev.new }))}
                  autoComplete="new-password"
                />

                {password.new && (
                  <div className="settings-strength" aria-live="polite">
                    <div className="settings-strength__bars" aria-hidden="true">
                      {[0, 1, 2, 3].map((index) => (
                        <span
                          key={index}
                          className={index < passwordStrength ? `is-filled level-${passwordStrength}` : ''}
                        />
                      ))}
                    </div>
                    <span className="settings-strength__label">{strengthLabel}</span>
                  </div>
                )}

                <PasswordInput
                  id="confirm"
                  label="Confirm new password"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                  error={errors.confirm}
                  visible={visiblePasswords.confirm}
                  onToggle={() =>
                    setVisiblePasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                  }
                  autoComplete="new-password"
                />

                <div className="settings-actions">
                  <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                    {passwordLoading ? (
                      <Loader2 size={16} className="settings-spin" />
                    ) : (
                      <Lock size={16} />
                    )}
                    Change password
                  </button>
                  <p>You will stay signed in on this device.</p>
                </div>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="settings-switch-list">
                  {[
                    {
                      key: 'product',
                      title: 'Product updates',
                      description: 'New templates, features, and improvements.',
                    },
                    {
                      key: 'reminders',
                      title: 'Resume reminders',
                      description: 'A nudge when a resume has been sitting untouched.',
                    },
                    {
                      key: 'tips',
                      title: 'Job-match tips',
                      description: 'Short advice for tailoring resumes to a role.',
                    },
                  ].map((item) => (
                    <label key={item.key} className="settings-switch-row">
                      <span className="settings-switch-row__copy">
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </span>
                      <input
                        type="checkbox"
                        className="settings-switch__input"
                        checked={notifications[item.key]}
                        onChange={(event) =>
                          setNotifications((prev) => ({
                            ...prev,
                            [item.key]: event.target.checked,
                          }))
                        }
                      />
                      <span className="settings-switch__track" aria-hidden="true">
                        <span className="settings-switch__thumb" />
                      </span>
                    </label>
                  ))}
                </div>

                <div className="settings-actions">
                  <button type="button" className="btn btn-primary" onClick={handleSaveNotifications}>
                    <Check size={16} />
                    Save preferences
                  </button>
                  <p>Preferences are stored on this device.</p>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section">
                <p className="settings-section__lead">
                  Choose a theme. Your choice is saved on this device, and the system option
                  follows your operating system setting.
                </p>

                <div className="settings-themes" role="radiogroup" aria-label="Theme">
                  {THEME_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isActive = theme === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`settings-theme${isActive ? ' is-active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={option.value}
                          checked={isActive}
                          onChange={() => setTheme(option.value)}
                          className="settings-theme__input"
                        />
                        <span
                          className={`settings-theme__preview settings-theme__preview--${option.value}`}
                          aria-hidden="true"
                        >
                          <span className="settings-theme__window-bar" />
                          <span className="settings-theme__window-body">
                            <span className="settings-theme__window-side" />
                            <span className="settings-theme__window-lines">
                              <span />
                              <span />
                              <span />
                            </span>
                          </span>
                        </span>
                        <span className="settings-theme__meta">
                          <span className="settings-theme__name">
                            <Icon size={15} />
                            {option.label}
                          </span>
                          {isActive && <Check size={15} className="settings-theme__check" />}
                        </span>
                        <span className="settings-theme__description">{option.description}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="settings-callout settings-callout--soft">
                  <span className="settings-callout__icon" aria-hidden="true">
                    <Palette size={18} />
                  </span>
                  <div>
                    <strong>Theme changes apply instantly</strong>
                    <p>Switch back to light at any time from this panel.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="settings-danger">
                <span className="settings-danger__icon" aria-hidden="true">
                  <AlertTriangle size={22} />
                </span>
                <h3>Delete your account</h3>
                <p>
                  This permanently removes your account and every resume saved to it. There is no
                  way to recover your data after you confirm.
                </p>
                <ul>
                  <li>All resumes, drafts, and exported content</li>
                  <li>Your profile and sign-in details</li>
                  <li>Saved preferences on this device</li>
                </ul>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={16} />
                  Delete my account
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setShowDeleteConfirm(false);
          }}
        >
          <div
            className="modal-content settings-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
          >
            <span className="settings-confirm__icon" aria-hidden="true">
              <Trash2 size={22} />
            </span>
            <h2 id="delete-account-title">Delete your account?</h2>
            <p id="delete-account-description">
              <strong>{user?.name}</strong>, this will permanently remove your account and all of
              your resumes. This cannot be undone.
            </p>
            <div className="settings-confirm__actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                autoFocus
              >
                Keep my account
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? <Loader2 size={16} className="settings-spin" /> : <Trash2 size={16} />}
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
