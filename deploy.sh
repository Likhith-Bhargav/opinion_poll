#!/bin/bash

# Opinion Poll Platform - Automated Deployment Script
# This script helps deploy backend to Render and frontend to Vercel

echo "🚀 Opinion Poll Platform - Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Install with: npm install -g vercel"
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    else
        print_success "Vercel CLI found"
    fi

    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 not found. Please install Python 3.9+"
        exit 1
    else
        print_success "Python 3 found"
    fi

    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js"
        exit 1
    else
        print_success "Node.js found"
    fi
}

# Backend deployment function (Render)
deploy_backend() {
    print_status "Backend deployment to Render..."
    print_status "Note: Render deployment is done through their web dashboard"
    print_status ""
    print_status "To deploy backend to Render:"
    print_status "1. Go to https://render.com"
    print_status "2. Click 'New' → 'Web Service'"
    print_status "3. Connect your GitHub repository"
    print_status "4. Configure the service:"
    print_status "   - Name: opinion-poll-backend"
    print_status "   - Runtime: Python 3"
    print_status "   - Build Command: pip install -r requirements.txt"
    print_status "   - Start Command: gunicorn --worker-class eventlet -w 1 -b 0.0.0.0:10000 app_flask:app"
    print_status ""
    print_status "5. Set Environment Variables:"
    print_status "   FLASK_ENV = production"
    print_status "   CORS_ORIGINS = https://your-frontend.vercel.app"
    print_status "   SOCKETIO_CORS_ORIGINS = https://your-frontend.vercel.app"
    print_status ""
    print_status "6. Click 'Create Web Service'"
    print_status ""
    print_warning "Backend URL will be: https://your-app.onrender.com"
}

# Frontend deployment function
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."

    cd frontend

    # Check if vercel project exists
    if ! vercel ls &> /dev/null; then
        print_warning "No Vercel project linked. Creating new project..."
        vercel
    fi

    # Set environment variables
    print_status "Setting environment variables..."

    # Read backend URL from user input or file
    if [ -f "../.backend_url.txt" ]; then
        BACKEND_URL=$(cat ../.backend_url.txt)
        print_status "Using backend URL: $BACKEND_URL"
    else
        print_warning "Backend URL not found."
        print_status "Please enter your Render backend URL (e.g., https://your-app.onrender.com):"
        read -p "Backend URL: " BACKEND_URL

        if [ -z "$BACKEND_URL" ]; then
            print_error "Backend URL is required for frontend deployment"
            exit 1
        fi

        echo $BACKEND_URL > ../.backend_url.txt
    fi

    # Set Vercel environment variables
    print_status "Setting Vercel environment variables..."
    vercel env rm REACT_APP_API_URL 2>/dev/null || true
    vercel env rm REACT_APP_WS_URL 2>/dev/null || true

    vercel env add REACT_APP_API_URL
    vercel env add REACT_APP_WS_URL

    print_status "Deploying to Vercel..."
    vercel --prod

    FRONTEND_URL=$(vercel ls | grep -E "https://.*\.vercel\.app" | head -1 | awk '{print $2}')
    print_success "Frontend deployed at: $FRONTEND_URL"

    cd ..
}

# Main deployment function
main() {
    echo "Choose deployment option:"
    echo "1) Deploy Backend only (Render - Manual)"
    echo "2) Deploy Frontend only (Vercel)"
    echo "3) Deploy Both (Backend + Frontend)"
    echo "4) Setup Development Environment"
    read -p "Enter your choice (1-4): " choice

    case $choice in
        1)
            check_dependencies
            deploy_backend
            ;;
        2)
            check_dependencies
            deploy_frontend
            ;;
        3)
            check_dependencies
            deploy_backend
            echo ""
            read -p "Press Enter after deploying backend to Render and getting the URL..."
            deploy_frontend
            print_success "🎉 Deployment complete!"
            print_status "Backend: Render (manual deployment required)"
            print_status "Frontend: $(cat .backend_url.txt 2>/dev/null || echo 'Not deployed')"
            ;;
        4)
            print_status "Setting up development environment..."
            cd backend
            python3 -m venv venv
            source venv/bin/activate
            pip install -r requirements.txt
            cd ../frontend
            npm install
            print_success "Development environment ready!"
            print_status "Start backend: cd backend && source venv/bin/activate && python run.py"
            print_status "Start frontend: cd frontend && npm start"
            ;;
        *)
            print_error "Invalid choice. Please select 1-4."
            exit 1
            ;;
    esac
}

# Run main function
main
