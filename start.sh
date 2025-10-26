#!/bin/bash

# Opinion Poll Platform - Development Startup Script
echo "🚀 Starting Opinion Poll Platform..."

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if backend port is available
if check_port 8000; then
    echo "⚠️  Warning: Port 8000 is already in use. Backend may not start properly."
fi

# Check if frontend port is available
if check_port 3000; then
    echo "⚠️  Warning: Port 3000 is already in use. Frontend may not start properly."
fi

echo "📦 Setting up backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1

echo "🗄️  Setting up database..."
python3 -c "from app_flask import app, db; app.app_context().push(); db.create_all(); print('Database tables created successfully')" > /dev/null 2>&1

echo "🌐 Starting Flask backend server..."
python3 run.py &
BACKEND_PID=$!

cd ..
echo "📦 Setting up frontend..."
cd frontend
npm install > /dev/null 2>&1

echo "🌐 Starting React frontend server..."
npm start &
FRONTEND_PID=$!

cd ..
echo ""
echo "✅ Opinion Poll Platform is starting up!"
echo "📋 Backend (Flask): http://localhost:8000"
echo "🌐 Frontend (React): http://localhost:3000"
echo ""
echo "📊 Features:"
echo "   • Create polls with multiple options"
echo "   • Real-time voting with live updates"
echo "   • Like polls and track popularity"
echo "   • Socket.IO integration for instant updates"
echo "   • Responsive design with modern UI"
echo ""
echo "🛑 To stop both servers, press Ctrl+C"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
