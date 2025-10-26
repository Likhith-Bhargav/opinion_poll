import React, { useState, useEffect, useCallback } from 'react';
import './ClassicTheme.css';
import Auth from './Auth';
import PollList from './PollList';
import CreatePoll from './CreatePoll';
import PollDetail from './PollDetail';
import { pollService } from '../../services/pollService';
import { websocketService } from '../../services/websocketService';
import { authService } from '../../services/authService';

function ClassicApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const checkAuthStatus = async () => {
    if (authService.isAuthenticated()) {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user.user);
      } catch (error) {
        authService.removeToken();
      }
    }
    setLoading(false);
  };

  const loadPolls = async () => {
    try {
      const fetchedPolls = await pollService.getPolls();
      setPolls(fetchedPolls);
    } catch (error) {
      console.error('Error loading polls:', error);
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    loadPolls();
  };

  const handleLogout = () => {
    authService.removeToken();
    setCurrentUser(null);
    setSelectedPoll(null);
  };

  const handlePollUpdate = useCallback((update) => {
    console.log('WebSocket poll update received:', update);

    if (update.type === 'poll_created') {
      setPolls(prev => [update.data.poll, ...prev]);
    } else if (update.type.startsWith('poll_')) {
      setPolls(prev => prev.map(poll =>
        poll.id === update.data.poll_id
          ? { ...poll, ...update.data }
          : poll
      ));

      if (selectedPoll && selectedPoll.id === update.data.poll_id) {
        console.log('Updating selectedPoll with WebSocket data:', update.data);
        console.log('Current selectedPoll votes:', selectedPoll.total_votes);
        console.log('WebSocket update votes:', update.data.total_votes);

        // Only update if WebSocket data is significantly different (prevents override of optimistic updates)
        const hasSignificantChange = update.data.total_votes !== selectedPoll.total_votes ||
                                   update.data.total_likes !== selectedPoll.total_likes ||
                                   JSON.stringify(update.data.options?.map(o => o.vote_count)) !==
                                   JSON.stringify(selectedPoll.options?.map(o => o.vote_count));

        console.log('Significant change check:', {
          totalVotesChanged: update.data.total_votes !== selectedPoll.total_votes,
          totalLikesChanged: update.data.total_likes !== selectedPoll.total_likes,
          optionsChanged: JSON.stringify(update.data.options?.map(o => o.vote_count)) !==
                         JSON.stringify(selectedPoll.options?.map(o => o.vote_count)),
          hasSignificantChange
        });

        if (hasSignificantChange) {
          setSelectedPoll(prev => ({ ...prev, ...update.data }));
        }
      }
    }
  }, [selectedPoll]);

  const handleCreatePoll = async (pollData) => {
    try {
      const newPoll = await pollService.createPoll(pollData);
      return newPoll;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  };

  const handleVote = async (pollId, optionId) => {
    try {
      await pollService.vote(pollId, optionId);
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    }
  };

  const handleLike = async (pollId) => {
    try {
      await pollService.likePoll(pollId);
    } catch (error) {
      console.error('Error liking poll:', error);
      throw error;
    }
  };

  const handleUnlike = async (pollId) => {
    try {
      await pollService.unlikePoll(pollId);
    } catch (error) {
      console.error('Error unliking poll:', error);
      throw error;
    }
  };

  const handleSelectPoll = async (pollSummary) => {
    try {
      const fullPoll = await pollService.getPoll(pollSummary.id);
      setSelectedPoll(fullPoll);
    } catch (error) {
      console.error('Error loading poll details:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    loadPolls();

    websocketService.connect(
      () => setWsConnected(true),
      () => setWsConnected(false)
    );

    websocketService.onPollUpdate((update) => {
      handlePollUpdate(update);
    });

    return () => {
      websocketService.disconnect();
    };
  }, [handlePollUpdate]);

  if (loading) {
    return (
      <div className="classic-theme">
        <div className="App">
          <div className="loading">Authenticating</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="classic-theme">
        <div className="App">
          <header className="App-header">
            <div className="header-left">
              <h1>📊 Opinion Poll</h1>
              <div className="connection-status">
                <span className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}></span>
                {wsConnected ? 'Live Updates Active' : 'Connection Offline'}
              </div>
            </div>
          </header>
          <main className="App-main">
            <div className="container">
              <div className="content">
                <Auth onAuthSuccess={handleAuthSuccess} />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="classic-theme">
      <div className="App">
        <header className="App-header">
          <div className="header-left">
            <h1>📊 Opinion Poll</h1>
            <div className="connection-status">
              <span className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}></span>
              {wsConnected ? 'Live Updates Active' : 'Connection Offline'}
            </div>
          </div>
          <div className="header-right">
            <span className="user-info">Welcome, {currentUser.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              Sign Out
            </button>
          </div>
        </header>

        <main className="App-main">
          <div className="container">
            <div className="sidebar">
              <CreatePoll onCreatePoll={handleCreatePoll} />
            </div>

            <div className="content">
              {selectedPoll ? (
                <PollDetail
                  poll={selectedPoll}
                  onBack={() => setSelectedPoll(null)}
                  onVote={handleVote}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ) : (
                <PollList
                  polls={polls}
                  onSelectPoll={handleSelectPoll}
                  onRefresh={loadPolls}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClassicApp;
