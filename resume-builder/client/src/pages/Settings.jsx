import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Bell, Palette, Trash2, Loader2 } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = 'Name is required';
    if (!profile.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!password.current) newErrors.current = 'Current password is required';
    if (!password.new) newErrors.new = 'New password is required';
    else if (password.new.length < 6) newErrors.new = 'Password must be at least 6 characters';
    if (password.new !== password.confirm) newErrors.confirm = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setLoading(true);
    try {
      await api.put('/auth/profile', profile);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      await api.put('/auth/password', { current: password.current, new: password.new });
      toast.success('Password changed');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    if (!confirm('This will permanently delete all your resumes. Continue?')) return;

    try {
      await api.delete('/auth/account');
      toast.success('Account deleted');
      // AuthContext logout will handle redirect
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 }
  ];

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Settings</h1>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-ghost ${activeTab === tab.id ? 'btn-primary' : ''}`}
                style={{
                  padding: '1rem 1.5rem',
                  whiteSpace: 'nowrap',
                  borderRadius: 0,
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : 'none',
                  marginBottom: '-1px'
                }}
              >
                <Icon size={18} style={{ marginRight: '0.5rem' }} /> {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="navbar-avatar" style={{ width: '80px', height: '80px', fontSize: '1.5rem' }}>
                  {initials}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{profile.name || 'Your Name'}</h3>
                  <p style={{ color: 'var(--color-text-muted)' }}>{profile.email}</p>
                </div>
              </div>

              <div className="editor-field">
                <label htmlFor="name" className="label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="John Doe"
                />
                {errors.name && <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>}
              </div>

              <div className="editor-field">
                <label htmlFor="email" className="label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="you@example.com"
                />
                {errors.email && <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? <Loader2 size={16} /> : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit}>
              <h3 style={{ marginBottom: '1rem' }}>Change Password</h3>

              <div className="editor-field">
                <label htmlFor="current" className="label">Current Password</label>
                <input
                  type="password"
                  id="current"
                  name="current"
                  className={`input ${errors.current ? 'input-error' : ''}`}
                  value={password.current}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
                {errors.current && <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.current}</p>}
              </div>

              <div className="editor-field">
                <label htmlFor="new" className="label">New Password</label>
                <input
                  type="password"
                  id="new"
                  name="new"
                  className={`input ${errors.new ? 'input-error' : ''}`}
                  value={password.new}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
                {errors.new && <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.new}</p>}
              </div>

              <div className="editor-field">
                <label htmlFor="confirm" className="label">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm"
                  name="confirm"
                  className={`input ${errors.confirm ? 'input-error' : ''}`}
                  value={password.confirm}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
                {errors.confirm && <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.confirm}</p>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={passwordLoading} style={{ marginTop: '1rem' }}>
                {passwordLoading ? <Loader2 size={16} /> : 'Change Password'}
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Notification Preferences</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Notification settings will be available soon.
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span>Email notifications for resume updates</span>
              </label>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Theme</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Choose your preferred color scheme.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['light', 'dark', 'system'].map(theme => (
                  <label key={theme} style={{ flex: 1, cursor: 'pointer' }}>
                    <input type="radio" name="theme" value={theme} />
                    <div style={{
                      padding: '1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      transition: 'var(--transition)'
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>{theme}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div style={{ borderTop: '1px solid var(--color-error)', paddingTop: '1.5rem' }}>
              <h3 style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>Danger Zone</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Trash2 size={18} /> Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}