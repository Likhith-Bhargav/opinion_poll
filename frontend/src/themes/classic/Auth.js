import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { useNotification } from '../../contexts/NotificationContext';
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
          <h2 className={isSignup ? 'title-signup' : 'title-signin'}>
            {isSignup ? 'Join the Conversation' : 'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            {isSignup
              ? 'Create your account to share your opinions and vote on polls'
              : 'Sign in to continue sharing your thoughts with the community'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="form-input"
            />
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="form-input"
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`auth-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">
                <span className="spinner"></span>
                Authenticating...
              </span>
            ) : (
              isSignup ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isSignup ? 'Already part of our community?' : "New to our platform?"}
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

      {/* Decorative elements */}
      <div className="auth-decoration">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
      </div>
    </div>
  );
};

export default Auth;
