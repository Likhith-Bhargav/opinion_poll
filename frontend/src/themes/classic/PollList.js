import React from 'react';
import './PollList.css';

const PollList = ({ polls, onSelectPoll, onRefresh }) => {
  if (polls.length === 0) {
    return (
      <div className="poll-list">
        <div className="poll-list-header">
          <h2 className="section-title">Active Polls</h2>
          <button onClick={onRefresh} className="refresh-btn">
            <span className="refresh-icon">⟳</span>
            Refresh
          </button>
        </div>
        <div className="no-polls">
          <div className="no-polls-icon">📋</div>
          <h3>No Active Polls</h3>
          <p>The community hasn't created any polls yet.</p>
          <p>Be the first to start a conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-list">
      <div className="poll-list-header">
        <h2 className="section-title">Active Polls</h2>
        <button onClick={onRefresh} className="refresh-btn">
          <span className="refresh-icon">⟳</span>
          Refresh
        </button>
      </div>

      <div className="polls-grid">
        {polls.map((poll, index) => (
          <div
            key={poll.id}
            className="poll-card"
            onClick={() => onSelectPoll(poll)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="poll-card-header">
              <h3 className="poll-title">{poll.title}</h3>
              {poll.description && (
                <p className="poll-description">{poll.description}</p>
              )}
            </div>

            <div className="poll-card-stats">
              <div className="stat">
                <div className="stat-icon votes-icon">🗳️</div>
                <div className="stat-content">
                  <span className="stat-value">{poll.total_votes || 0}</span>
                  <span className="stat-label">Votes</span>
                </div>
              </div>

              <div className="stat">
                <div className="stat-icon likes-icon">❤️</div>
                <div className="stat-content">
                  <span className="stat-value">{poll.total_likes || 0}</span>
                  <span className="stat-label">Likes</span>
                </div>
              </div>
            </div>

            <div className="poll-card-footer">
              <div className="creator-info">
                <span className="creator-label">Created by</span>
                <span className="creator-name">{poll.creator_username}</span>
              </div>
              <span className="created-at">
                {new Date(poll.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Decorative corner accent */}
            <div className="card-accent"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollList;
