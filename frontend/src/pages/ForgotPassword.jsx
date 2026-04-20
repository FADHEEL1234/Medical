import { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="login-hero">
      <div className="card">
        <h2>Reset your password</h2>
        <p className="login-card__intro-text">
          Enter the email address linked to your account and we’ll send a password reset link.
        </p>

        {error && <div className="message message-error">{error}</div>}
        {submitted && <div className="message message-success">If that email exists, we’ve sent a reset link.</div>}

        <form onSubmit={handleSubmit}>
          <div className="floating-label-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder=" "
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label htmlFor="email" className="floating-label">Email address</label>
          </div>

          <div className="auth-buttons">
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Send reset link
            </button>
          </div>
        </form>

        <p className="login-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
          Remembered your password? <Link to="/login" className="register-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
