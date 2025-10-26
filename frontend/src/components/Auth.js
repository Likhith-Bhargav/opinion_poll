import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useNotification } from '../contexts/NotificationContext';
import './Auth.css';

const Auth = ({ onAuthSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleModeSwitch = () => {
    setIsSignup(!isSignup);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          const errorMessage = 'Passwords do not match';
          setError(errorMessage);
          showNotification(`⚠️ ${errorMessage}`, 'warning', 3000);
          setLoading(false);
          return;
        }

        const response = await authService.signup({
          username: formData.username,
          password: formData.password
        });

        // Auto-login after successful signup
        authService.setToken(response.access_token);
        onAuthSuccess(response.user);
        showNotification(`🎉 Welcome ${formData.username}! Account created successfully.`, 'success', 4000);
      } else {
        const response = await authService.signin({
          username: formData.username,
          password: formData.password
        });

        authService.setToken(response.access_token);
        onAuthSuccess(response.user);
        showNotification(`👋 Welcome back, ${formData.username}!`, 'success', 3000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Authentication failed';
      setError(errorMessage);
      showNotification(`❌ ${errorMessage}`, 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isSignup ? 'Sign Up' : 'Sign In'}</h2>
          <p>
            {isSignup
              ? 'Create your account to start voting on polls'
              : 'Sign in to your account to vote on polls'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account yet?"}
            <button
              type="button"
              className="switch-button"
              onClick={handleModeSwitch}
            >
              {isSignup ? 'Sign In Instead' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
