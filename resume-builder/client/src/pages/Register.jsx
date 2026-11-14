import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

function validateField(name, value, values) {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'Enter your full name';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      return '';
    case 'email':
      if (!value.trim()) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Enter a valid email address';
      return '';
    case 'password':
      if (!value) return 'Create a password';
      if (value.length < 6) return 'Use at least 6 characters';
      return '';
    case 'confirmPassword':
      if (!value) return 'Confirm your password';
      if (value !== values.password) return 'Passwords do not match';
      return '';
    default:
      return '';
  }
}

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };

  let score = 1;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  return {
    score,
    label: ['', 'Weak', 'Fair', 'Good', 'Strong'][score],
  };
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const newErrors = {};
    ['name', 'email', 'password', 'confirmPassword'].forEach((field) => {
      const message = validateField(field, formData[field], formData);
      if (message) newErrors[field] = message;
    });
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    return newErrors;
  };

  const focusFirstError = (fieldErrors) => {
    const firstField = Object.keys(fieldErrors)[0];
    if (firstField) document.getElementById(firstField)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      focusFirstError(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await register(formData.name.trim(), formData.email, formData.password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const fieldErrors = {};
      if (Array.isArray(err.response?.data?.errors)) {
        err.response.data.errors.forEach((error) => {
          fieldErrors[error.path] = error.msg;
        });
      }

      const message =
        err.response?.data?.message || 'We could not create your account. Please try again.';

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        setTouched({
          name: true,
          email: true,
          password: true,
          confirmPassword: true,
        });
        focusFirstError(fieldErrors);
      }

      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    setFormError('');

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, next),
      }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField('confirmPassword', next.confirmPassword, next),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData),
    }));
  };

  return (
    <AuthLayout variant="register">
      <header className="auth-head">
        <span className="auth-eyebrow">Create your account</span>
        <h1>Start building for free</h1>
        <p>Set up your account in under a minute. No credit card required.</p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="auth-alert" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <div className="auth-field">
          <div className="auth-label-row">
            <label className="auth-label" htmlFor="name">
              Full name
            </label>
          </div>
          <div className="auth-control">
            <User className="auth-control-icon" size={18} aria-hidden="true" />
            <input
              className={`auth-input ${errors.name ? 'auth-input--error' : ''}`}
              type="text"
              id="name"
              name="name"
              placeholder="Jordan Lee"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
              disabled={loading}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
          </div>
          {errors.name && (
            <p className="auth-error" id="name-error" role="alert">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label className="auth-label" htmlFor="email">
              Email
            </label>
          </div>
          <div className="auth-control">
            <Mail className="auth-control-icon" size={18} aria-hidden="true" />
            <input
              className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              inputMode="email"
              disabled={loading}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p className="auth-error" id="email-error" role="alert">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <span className="auth-label-hint">6+ characters</span>
          </div>
          <div className="auth-control">
            <Lock className="auth-control-icon" size={18} aria-hidden="true" />
            <input
              className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              disabled={loading}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>

          {formData.password && (
            <div className="auth-strength" id="password-strength" data-score={strength.score}>
              <div className="auth-strength-track" aria-hidden="true">
                {[1, 2, 3, 4].map((level) => (
                  <span key={level} className={level <= strength.score ? 'is-filled' : ''} />
                ))}
              </div>
              <span className="auth-strength-label" aria-live="polite">
                Password strength: <strong>{strength.label}</strong>
              </span>
            </div>
          )}

          {errors.password && (
            <p className="auth-error" id="password-error" role="alert">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label className="auth-label" htmlFor="confirmPassword">
              Confirm password
            </label>
          </div>
          <div className="auth-control">
            <Lock className="auth-control-icon" size={18} aria-hidden="true" />
            <input
              className={`auth-input ${errors.confirmPassword ? 'auth-input--error' : ''}`}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="new-password"
              disabled={loading}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="auth-error" id="confirm-error" role="alert">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{errors.confirmPassword}</span>
            </p>
          )}
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? (
            <>
              <span className="auth-spinner" aria-hidden="true" />
              Creating account&hellip;
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="auth-secure">
        <ShieldCheck size={14} aria-hidden="true" />
        Free to start. No credit card required.
      </p>

      <div className="auth-switch">
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
