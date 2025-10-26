import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class PollService {
  async getPolls() {
    const response = await api.get('/polls/');
    return response.data;
  }

  async getPoll(pollId) {
    const response = await api.get(`/polls/${pollId}`);
    return response.data;
  }

  async createPoll(pollData) {
    const response = await api.post('/polls/', pollData);
    return response.data;
  }

  async vote(pollId, optionId) {
    const response = await api.post(`/polls/${pollId}/vote`, {
      poll_id: pollId,
      option_id: optionId
    });
    return response.data;
  }

  async likePoll(pollId) {
    const response = await api.post(`/polls/${pollId}/like`);
    return response.data;
  }

  async unlikePoll(pollId) {
    const response = await api.delete(`/polls/${pollId}/like`);
    return response.data;
  }
}

export const pollService = new PollService();
