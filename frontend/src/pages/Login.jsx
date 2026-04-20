import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { authAPI } from '../api/api';
import useBackendStatus from '../hooks/useBackendStatus';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { backendUp, error: backendError } = useBackendStatus();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    if (!backendUp) {
      setError('Cannot log in because backend is not reachable');
      return;
    }
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resp = await authAPI.login(formData);
      const isStaff = resp.data.is_staff;
      if (isStaff) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };


  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-hero">
      <div className="login-hero__decor">
        <span className="login-hero__bubble login-hero__bubble--one" />
        <span className="login-hero__bubble login-hero__bubble--two" />
        <span className="login-hero__bubble login-hero__bubble--three" />
      </div>

      <div className="card">
        <h2>Secure Login</h2>

        <div className="login-card__intro">
          <p>Access your care dashboard, book appointments, and keep treatment reminders active in one secure portal.</p>
          <div className="login-card__features">
            <span>Fast sign-in</span>
            <span>Live alerts</span>
            <span>Smart scheduling</span>
          </div>
        </div>

        {backendError && <div className="message message-error">{backendError}</div>}
        {error && <div className="message message-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!backendUp && (
            <div className="message message-error">
              Backend not available – start the server and refresh.
            </div>
          )}
          
          <div className="floating-label-group">
            <input
              type="text"
              id="username"
              name="username"
              placeholder=" "
              value={formData.username}
              onChange={handleChange}
              required
              className="skeleton"
            />
            <label htmlFor="username" className="floating-label">Username</label>
          </div>

          <div className="floating-label-group" style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="password" className="floating-label">Password</label>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.036 12.322a1 1 0 010-1.644 6.553 6.553 0 0112.908 0 1 1 0 010 1.644L14.707 14l1.106 1.106a1 1 0 001.414 0 6.553 6.553 0 01-12.191-5.784z" />
                )}
              </svg>
            </button>
          </div>

          <div className="auth-buttons">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !backendUp}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                  Logging in...
                </>
              ) : 'Sign In'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link to="/forgot-password" className="register-link" style={{ fontSize: '0.9rem' }}>Forgot Password?</Link>
          </div>
        </form>

        <div className="auth-buttons" style={{ marginTop: '24px' }}>
          <a href="#" className="auth-button auth-google">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#4285F4">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            </svg>
            Continue with Google
          </a>
        </div>

        <p className="login-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
          Don't have an account? <Link to="/register" className="register-link">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
