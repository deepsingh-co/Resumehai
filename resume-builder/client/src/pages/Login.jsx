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
} from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

function validateField(name, value) {
  if (name === 'email') {
    if (!value.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Enter a valid email address';
    return '';
  }

  if (name === 'password') {
    if (!value) return 'Password is required';
    return '';
  }

  return '';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');

  const validate = () => {
    const newErrors = {};
    ['email', 'password'].forEach((field) => {
      const message = validateField(field, formData[field]);
      if (message) newErrors[field] = message;
    });
    setErrors(newErrors);
    setTouched({ email: true, password: true });
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
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const fieldErrors = {};
      if (Array.isArray(err.response?.data?.errors)) {
        err.response.data.errors.forEach((error) => {
          fieldErrors[error.path] = error.msg;
        });
      }

      const message =
        err.response?.data?.message || 'We could not sign you in. Check your email and password.';

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        setTouched({ email: true, password: true });
        focusFirstError(fieldErrors);
      }

      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  return (
    <AuthLayout variant="login">
      <header className="auth-head">
        <span className="auth-eyebrow">Welcome back</span>
        <h1>Sign in to Resumehai</h1>
        <p>Build, tailor, and export your resume from where you left off.</p>
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
          </div>
          <div className="auth-control">
            <Lock className="auth-control-icon" size={18} aria-hidden="true" />
            <input
              className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
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
          {errors.password && (
            <p className="auth-error" id="password-error" role="alert">
              <AlertCircle size={14} aria-hidden="true" />
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? (
            <>
              <span className="auth-spinner" aria-hidden="true" />
              Signing in&hellip;
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="auth-secure">
        <ShieldCheck size={14} aria-hidden="true" />
        Secure sign-in. Your details are never shared.
      </p>

      <div className="auth-switch">
        <p>
          New to Resumehai? <Link to="/register">Create a free account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
