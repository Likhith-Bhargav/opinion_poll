import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './CreatePoll.css';

const CreatePoll = ({ onCreatePoll }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Poll title is required');
      return;
    }

    const validOptions = options.filter(option => option.trim());
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const pollData = {
        title: title.trim(),
        description: description.trim() || null,
        options: validOptions.map(option => ({
          option_text: option.trim()
        }))
      };

      await onCreatePoll(pollData);

      // Reset form
      setTitle('');
      setDescription('');
      setOptions(['', '']);

      showNotification(`🎉 Poll "${title.trim()}" created successfully!`, 'success', 4000);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to create poll';
      setError(errorMessage);
      showNotification(`❌ ${errorMessage}`, 'error', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-poll">
      <div className="create-poll-header">
        <h3 className="create-poll-title">Create New Poll</h3>
        <div className="create-poll-icon">✨</div>
      </div>

      <form onSubmit={handleSubmit} className="create-poll-form">
        <div className="form-group">
          <label htmlFor="poll-title" className="form-label">
            Poll Question *
          </label>
          <input
            id="poll-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What would you like to ask the community?"
            maxLength={200}
            required
            className="form-input"
          />
          <div className="char-counter">{title.length}/200</div>
        </div>

        <div className="form-group">
          <label htmlFor="poll-description" className="form-label">
            Description (Optional)
          </label>
          <textarea
            id="poll-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide additional context or details about your poll..."
            maxLength={500}
            rows={3}
            className="form-input textarea-input"
          />
          <div className="char-counter">{description.length}/500</div>
        </div>

        <div className="form-group">
          <div className="options-header">
            <label className="form-label">Answer Options *</label>
            <span className="options-count">
              {options.filter(opt => opt.trim()).length} of {options.length} filled
            </span>
          </div>

          <div className="options-list">
            {options.map((option, index) => (
              <div key={index} className="option-input-wrapper">
                <div className="option-input-container">
                  <span className="option-number">{index + 1}</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={100}
                    required
                    className="option-input"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="remove-option"
                      title="Remove this option"
                    >
                      <span className="remove-icon">−</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="add-option-btn"
            >
              <span className="add-icon">+</span>
              Add Another Option
            </button>
          )}

          <div className="form-help">
            💡 Tip: At least 2 options required, maximum 6 options allowed
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`submit-poll-btn ${isSubmitting ? 'loading' : ''}`}
        >
          {isSubmitting ? (
            <span className="loading-state">
              <span className="spinner"></span>
              Creating Poll...
            </span>
          ) : (
            <span className="button-text">
              <span className="button-icon">🚀</span>
              Create Poll
            </span>
          )}
        </button>
      </form>

      {/* Decorative elements */}
      <div className="create-poll-decoration">
        <div className="floating-element element-1">📝</div>
        <div className="floating-element element-2">💭</div>
        <div className="floating-element element-3">⭐</div>
      </div>
    </div>
  );
};

export default CreatePoll;
