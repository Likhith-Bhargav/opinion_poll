#!/bin/bash

# Opinion Poll Platform - Automated Deployment Script
# This script helps deploy both backend and frontend

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

    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Install with: npm install -g @railway/cli"
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    else
        print_success "Railway CLI found"
    fi

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

# Backend deployment function
deploy_backend() {
    print_status "Deploying backend to Railway..."

    cd backend

    # Check if railway project exists
    if ! railway status &> /dev/null; then
        print_warning "No Railway project linked. Creating new project..."
        railway init
    fi

    # Set environment variables
    print_status "Setting environment variables..."
    railway variables set FLASK_ENV=production
    railway variables set JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")

    print_status "Deploying to Railway..."
    railway up

    # Get the backend URL
    BACKEND_URL=$(railway domain)
    print_success "Backend deployed at: $BACKEND_URL"

    cd ..
    echo $BACKEND_URL > .backend_url.txt
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

    # Read backend URL from file
    if [ -f "../.backend_url.txt" ]; then
        BACKEND_URL=$(cat ../.backend_url.txt)
        print_status "Using backend URL: $BACKEND_URL"

        # Set Vercel environment variables
        vercel env add REACT_APP_API_URL
        vercel env add REACT_APP_WS_URL
    else
        print_warning "Backend URL not found. Please deploy backend first."
        print_status "You can set environment variables manually in Vercel dashboard:"
        print_status "REACT_APP_API_URL = https://your-backend.railway.app/api"
        print_status "REACT_APP_WS_URL = https://your-backend.railway.app"
    fi

    print_status "Deploying to Vercel..."
    vercel --prod

    FRONTEND_URL=$(vercel ls | grep -E "https://.*\.vercel\.app" | head -1 | awk '{print $2}')
    print_success "Frontend deployed at: $FRONTEND_URL"

    cd ..
}

# Main deployment function
main() {
    echo "Choose deployment option:"
    echo "1) Deploy Backend only (Railway)"
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
            deploy_frontend
            print_success "🎉 Deployment complete!"
            print_status "Frontend: $(cat .backend_url.txt 2>/dev/null || echo 'Not deployed')"
            print_status "Backend: $(cat frontend/.vercel_url.txt 2>/dev/null || echo 'Not deployed')"
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
