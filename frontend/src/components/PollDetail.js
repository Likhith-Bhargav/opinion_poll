import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNotification } from '../contexts/NotificationContext';
import './PollDetail.css';

const PollDetail = ({ poll, onBack, onVote, onLike, onUnlike }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(poll);
  const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);
  const { showNotification } = useNotification();

  // Update local poll state when prop changes, but don't override during optimistic updates
  React.useEffect(() => {
    console.log('PollDetail useEffect triggered:', {
      isOptimisticUpdate,
      pollId: poll?.id,
      pollTotalVotes: poll?.total_votes,
      currentTotalVotes: currentPoll?.total_votes
    });

    if (!isOptimisticUpdate) {
      setCurrentPoll(poll);
    }
  }, [poll, isOptimisticUpdate]);

  if (!poll || !poll.options) {
    return (
      <div className="poll-detail">
        <div className="loading">Loading poll details...</div>
      </div>
    );
  }

  const handleVote = async (optionId) => {
    if (isVoting) return;

    setIsVoting(true);
    setIsOptimisticUpdate(true);

    try {
      await onVote(poll.id, optionId);

      // Optimistically update the vote count immediately
      setCurrentPoll(prev => ({
        ...prev,
        options: prev.options.map(option =>
          option.id === optionId
            ? { ...option, vote_count: option.vote_count + 1 }
            : option
        ),
        total_votes: prev.total_votes + 1
      }));

      setSelectedOption(optionId);

      // Find the selected option text for the notification
      const selectedOptionData = currentPoll.options.find(opt => opt.id === optionId);
      const optionText = selectedOptionData ? selectedOptionData.option_text : 'Unknown option';

      console.log('Vote optimistic update:', {
        optionId,
        oldCount: selectedOptionData?.vote_count,
        newCount: selectedOptionData ? selectedOptionData.vote_count + 1 : 1,
        totalVotes: currentPoll.total_votes + 1
      });

      showNotification(`✅ Vote recorded! You voted for: "${optionText}"`, 'success', 4000);

      // Clear optimistic update flag after 3 seconds (backup in case WebSocket doesn't update)
      setTimeout(() => {
        console.log('Clearing optimistic update flag after timeout');
        setIsOptimisticUpdate(false);
      }, 3000);

    } catch (error) {
      console.error('Error voting:', error);
      setIsOptimisticUpdate(false);
      showNotification('❌ Failed to record your vote. Please try again.', 'error', 4000);
    } finally {
      setIsVoting(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    setIsOptimisticUpdate(true);

    try {
      if (isLiked) {
        await onUnlike(poll.id);
        // Optimistically update the like count immediately
        setCurrentPoll(prev => ({
          ...prev,
          total_likes: prev.total_likes - 1
        }));
        setIsLiked(false);
        showNotification('💔 Poll unliked', 'info', 2000);
      } else {
        await onLike(poll.id);
        // Optimistically update the like count immediately
        setCurrentPoll(prev => ({
          ...prev,
          total_likes: prev.total_likes + 1
        }));
        setIsLiked(true);
        showNotification('❤️ Poll liked!', 'success', 2000);
      }

      // Clear optimistic update flag after 2 seconds for likes
      setTimeout(() => {
        setIsOptimisticUpdate(false);
      }, 2000);

    } catch (error) {
      console.error('Error liking:', error);
      setIsOptimisticUpdate(false);
      showNotification('❌ Failed to update like status', 'error', 3000);
    } finally {
      setIsLiking(false);
    }
  };

  const getTotalVotes = () => {
    return currentPoll.options.reduce((sum, option) => sum + option.vote_count, 0);
  };

  const getChartData = () => {
    return currentPoll.options.map(option => ({
      name: option.option_text,
      votes: option.vote_count,
      percentage: getTotalVotes() > 0 ? Math.round((option.vote_count / getTotalVotes()) * 100) : 0
    }));
  };

  const maxVotes = Math.max(...currentPoll.options.map(option => option.vote_count));

  return (
    <div className="poll-detail">
      <div className="poll-detail-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Polls
        </button>
        <div className="poll-actions">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`like-btn ${isLiked ? 'liked' : ''}`}
          >
            ❤️ {currentPoll.total_likes}
          </button>
        </div>
      </div>

      <div className="poll-content">
        <div className="poll-info">
          <h2>{currentPoll.title}</h2>
          {currentPoll.description && (
            <p className="poll-description">{currentPoll.description}</p>
          )}

          <div className="poll-meta">
            <span className="creator">Created by {currentPoll.creator.username}</span>
            <span className="created-at">
              {new Date(currentPoll.created_at).toLocaleDateString()} at{' '}
              {new Date(currentPoll.created_at).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="poll-voting">
          <div className="voting-header">
            <h3>Cast Your Vote</h3>
            <span className="total-votes">
              Total Votes: {getTotalVotes()}
            </span>
          </div>

          <div className="options-list">
            {currentPoll.options.map((option) => {
              const percentage = getTotalVotes() > 0 ? (option.vote_count / getTotalVotes()) * 100 : 0;
              const isSelected = selectedOption === option.id;
              const isWinner = option.vote_count === maxVotes && maxVotes > 0;

              return (
                <div
                  key={option.id}
                  className={`option ${isSelected ? 'selected' : ''} ${isWinner ? 'winner' : ''}`}
                  onClick={() => handleVote(option.id)}
                >
                  <div className="option-content">
                    <div className="option-text">
                      {option.option_text}
                      {isWinner && <span className="winner-badge">👑</span>}
                    </div>

                    <div className="option-stats">
                      <span className="vote-count">{option.vote_count} votes</span>
                      <span className="percentage">{Math.round(percentage)}%</span>
                    </div>
                  </div>

                  <div className="option-bar">
                    <div
                      className="bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {getTotalVotes() > 0 && (
            <div className="chart-section">
              <h4>Results Chart</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.8)"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="rgba(255,255,255,0.8)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="votes" fill="#667eea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollDetail;
