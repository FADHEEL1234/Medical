import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { authAPI } from '../api/api';
import useBackendStatus from '../hooks/useBackendStatus';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    gender: '',
    address: '',
    age: '',
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
      setError('Cannot register because backend is not reachable');
      return;
    }
    e.preventDefault();
    setError('');

    // quick client-side validation to avoid unnecessary requests
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      // default generic message
      let message = 'Registration failed. Please try again.';

      // network-level error (backend unreachable)
      if (!err.response) {
        message =
          'Unable to contact server. Please make sure the backend is running';
      } else if (err.response.data) {
        if (err.response.data.detail) {
          message = err.response.data.detail;
        } else {
          // DRF often returns an object with field-specific lists
          const data = err.response.data;
          const parts = [];
          Object.values(data).forEach((v) => {
            if (Array.isArray(v)) {
              parts.push(v.join(' '));
            } else if (typeof v === 'string') {
              parts.push(v);
            }
          });
          if (parts.length) {
            message = parts.join(' ');
          }
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };


  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const steps = [
    { title: 'Personal Info', fields: ['username', 'email', 'first_name', 'last_name'] },
    { title: 'Profile Details', fields: ['gender', 'address', 'age'] },
    { title: 'Security', fields: ['password', 'password_confirm'] }
  ];

  const totalSteps = steps.length;

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepSubmit = (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      nextStep();
    } else {
      handleSubmit(e);
    }
  };

  const renderField = (field) => {
    const fieldProps = {
      id: field,
      name: field,
      value: formData[field],
      onChange: handleChange,
      className: 'skeleton',
      placeholder: ' '
    };

    if (field === 'password') {
      return (
        <div className="floating-label-group" style={{ position: 'relative' }}>
          <input type={showPassword ? 'text' : 'password'} {...fieldProps} required minLength="8" />
          <label htmlFor={field} className="floating-label">Password</label>
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> : 
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.036 12.322a1 1 0 010-1.644 6.553 6.553 0 0112.908 0 1 1 0 010 1.644L14.707 14l1.106 1.106a1 1 0 001.414 0 6.553 6.553 0 01-12.191-5.784z" />}
            </svg>
          </button>
        </div>
      );
    }

    if (field === 'password_confirm') {
      return (
        <div className="floating-label-group" style={{ position: 'relative' }}>
          <input type={showConfirmPassword ? 'text' : 'password'} {...fieldProps} required minLength="8" />
          <label htmlFor={field} className="floating-label">Confirm Password</label>
          <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showConfirmPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> : 
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.036 12.322a1 1 0 010-1.644 6.553 6.553 0 0112.908 0 1 1 0 010 1.644L14.707 14l1.106 1.106a1 1 0 001.414 0 6.553 6.553 0 01-12.191-5.784z" />}
            </svg>
          </button>
        </div>
      );
    }

    if (field === 'gender') {
      return (
        <div className="floating-label-group">
          <select {...fieldProps} required>
            <option value="">-- Select Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <label htmlFor={field} className="floating-label">Gender *</label>
        </div>
      );
    }

    return (
      <div className="floating-label-group">
        <input {...fieldProps} required={['username', 'email', 'address'].includes(field)} />
        <label htmlFor={field} className="floating-label">
          {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          {['username', 'email', 'address'].includes(field) ? ' *' : ''}
        </label>
      </div>
    );
  };

  return (
    <div className="login-hero">
      <div className="card">
        <h2>Create Account</h2>
        
        {backendError && <div className="message message-error">{backendError}</div>}
        {error && <div className="message message-error">{error}</div>}
        
        <div className="step-indicator">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`step-dot ${currentStep > index + 1 ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
            />
          ))}
        </div>

        <form onSubmit={handleStepSubmit}>
          {!backendUp && (
            <div className="message message-error">
              Backend not available – start the server and refresh.
            </div>
          )}
          
          {steps[currentStep - 1].fields.map(field => renderField(field))}
          
          <div className="auth-buttons">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !backendUp}
              style={{ width: '100%' }}
            >
              {loading ? 'Creating...' : currentStep === totalSteps ? 'Create Account' : 'Next Step'}
            </button>
          </div>

          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={prevStep}
              style={{ width: '100%', marginTop: '12px' }}
            >
              Previous
            </button>
          )}
        </form>

        <p className="login-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
          Already have an account? <Link to="/login" className="register-link">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
