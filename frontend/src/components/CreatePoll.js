import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
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
      <h3>Create New Poll</h3>

      <form onSubmit={handleSubmit} className="create-poll-form">
        <div className="form-group">
          <label htmlFor="poll-title">Poll Title *</label>
          <input
            id="poll-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question?"
            maxLength={200}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="poll-description">Description (optional)</label>
          <textarea
            id="poll-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more context for your poll..."
            maxLength={500}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Options *</label>
          <div className="options-list">
            {options.map((option, index) => (
              <div key={index} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="remove-option"
                    title="Remove option"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="add-option-btn"
            >
              + Add Option
            </button>
          )}

          <small className="form-help">
            At least 2 options required, maximum 6 options allowed
          </small>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-poll-btn"
        >
          {isSubmitting ? 'Creating...' : 'Create Poll'}
        </button>
      </form>
    </div>
  );
};

export default CreatePoll;
