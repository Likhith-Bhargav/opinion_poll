# 📊 Opinion Poll Platform

A real-time polling platform where users can create polls, vote, like polls, and see live updates as other users interact. Built with Python FastAPI backend and React frontend.

## ✨ Features

- **Create Polls**: Users can create polls with multiple options (2-6 options)
- **Real-time Voting**: Submit votes and see results update instantly across all users
- **Like System**: Like polls and track popularity with real-time like counts
- **Live Updates**: WebSocket integration for instant updates without page refresh
- **Responsive Design**: Modern, mobile-friendly UI with glass morphism effects
- **Data Visualization**: Interactive charts showing poll results
- **Anonymous Participation**: No user registration required for basic features

## 🏗️ Architecture

### Backend (Python/Flask)
- **Flask 2.3.3**: Python web framework (Python 3.13 compatible)
- **Flask-SocketIO 5.3.6**: Real-time bidirectional communication
- **Flask-SQLAlchemy 3.0.5**: ORM for database interactions (Python 3.13 compatible)
- **SQLite**: Lightweight database for development
- **Flask-CORS 4.0.0**: Cross-origin resource sharing support

### Frontend (React)
- **React 18**: Modern React with hooks
- **Axios**: HTTP client for API calls
- **Recharts**: Data visualization library
- **Socket.IO Client 4.7.2**: Real-time WebSocket communication
- **CSS3**: Modern styling with backdrop filters

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ (3.13+ recommended)
- Node.js 16+
- SQLite (included with Python)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd opinion_poll_platform
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create database tables
python3 -c "from app_flask import app, db; app.app_context().push(); db.create_all(); print('Database tables created successfully')"

# Start the backend server
python3 run.py
```

Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

Frontend will be available at `http://localhost:3000`

## 📡 API Endpoints

### Polls
- `GET /api/polls/` - Get all active polls
- `GET /api/polls/{poll_id}` - Get specific poll details
- `POST /api/polls/` - Create new poll
- `POST /api/polls/{poll_id}/vote` - Vote on a poll option
- `POST /api/polls/{poll_id}/like` - Like a poll
- `DELETE /api/polls/{poll_id}/like` - Unlike a poll

### WebSocket
- `WS /api/ws` - Real-time updates connection

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost/opinion_poll
```

### Frontend Environment Variables

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/api/ws
```

## 🗄️ Database Schema

The application uses SQLite for development (easily switchable to PostgreSQL for production).

### Tables
- **users**: User information
- **polls**: Poll details and metadata
- **poll_options**: Individual poll options
- **votes**: User votes on polls
- **likes**: User likes on polls

### Production Deployment

For production, update the database configuration in `backend/app_flask.py`:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/opinion_poll'
```

And install PostgreSQL dependencies:
```bash
pip install psycopg2==2.9.9
```

## 🎨 UI Components

### Frontend Structure
```
src/
├── components/
│   ├── PollList.js      # Grid of all polls
│   ├── PollDetail.js    # Individual poll view with voting
│   └── CreatePoll.js    # Poll creation form
├── services/
│   ├── pollService.js   # API service layer
│   └── websocketService.js # WebSocket service
└── App.js              # Main application component
```

## 🔄 Real-time Features

The platform uses WebSockets to provide live updates:

1. **New Poll Creation**: Instantly appears for all users
2. **Vote Updates**: Vote counts update in real-time
3. **Like Updates**: Like counts update instantly
4. **Results Charts**: Automatically refresh with new data

## 🚀 Deployment

### Option 1: Manual Deployment

1. **Backend**: Deploy to Heroku, DigitalOcean, or any Python hosting
2. **Frontend**: Deploy to Netlify, Vercel, or any static hosting
3. **Database**: Use PostgreSQL hosting (AWS RDS, Google Cloud SQL, etc.)

### Option 2: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🧪 Development

### Running Tests

```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test
```

### Database Management

```bash
# Create migration
cd backend && alembic revision --autogenerate -m "description"

# Apply migrations
cd backend && alembic upgrade head
```

## 📱 Screenshots

[Add screenshots of your application here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI for the robust backend framework
- React for the modern frontend experience
- Recharts for beautiful data visualization
- PostgreSQL for reliable data storage

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the development team.

---

Made with ❤️ using FastAPI and React
# opinion_poll
