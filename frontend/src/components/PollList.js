import React from 'react';
import './PollList.css';

const PollList = ({ polls, onSelectPoll, onRefresh }) => {
  if (polls.length === 0) {
    return (
      <div className="poll-list">
        <div className="poll-list-header">
          <h2>Active Polls</h2>
          <button onClick={onRefresh} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
        <div className="no-polls">
          <p>No active polls available.</p>
          <p>Create a poll to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-list">
      <div className="poll-list-header">
        <h2>Active Polls</h2>
        <button onClick={onRefresh} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="polls-grid">
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="poll-card"
            onClick={() => onSelectPoll(poll)}
          >
            <div className="poll-card-header">
              <h3>{poll.title}</h3>
              {poll.description && (
                <p className="poll-description">{poll.description}</p>
              )}
            </div>

            <div className="poll-card-stats">
              <div className="stat">
                <span className="stat-icon">🗳️</span>
                <span className="stat-value">{poll.total_votes}</span>
                <span className="stat-label">votes</span>
              </div>

              <div className="stat">
                <span className="stat-icon">❤️</span>
                <span className="stat-value">{poll.total_likes}</span>
                <span className="stat-label">likes</span>
              </div>
            </div>

            <div className="poll-card-footer">
              <span className="creator">by {poll.creator_username}</span>
              <span className="created-at">
                {new Date(poll.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollList;
