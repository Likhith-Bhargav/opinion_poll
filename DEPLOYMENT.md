# 🚀 Opinion Poll Platform - Deployment Guide

This guide provides step-by-step instructions for deploying the Opinion Poll Platform with backend on Railway and frontend on Vercel.

## 📋 Prerequisites

- GitHub account with repository access
- Railway account (railway.app)
- Vercel account (vercel.com)
- Node.js and npm installed locally (for frontend)
- Python 3.9+ installed locally (for backend)

## 🏗️ Backend Deployment (Railway)

### Step 1: Prepare Backend for Deployment

The backend is configured with the following files:
- `railway.json` - Railway deployment configuration
- `Procfile` - Process file for Railway
- `requirements.txt` - Python dependencies
- `.env.example` - Environment variables template

### Step 2: Deploy to Railway

1. **Connect Railway to GitHub:**
   ```bash
   # Install Railway CLI (if not already installed)
   npm install -g @railway/cli

   # Login to Railway
   railway login
   ```

2. **Create New Project:**
   ```bash
   # Create new Railway project
   railway init

   # Or link existing project
   railway link [project-id]
   ```

3. **Set Environment Variables:**
   ```bash
   railway variables set JWT_SECRET_KEY=your-super-secret-key-here
   railway variables set CORS_ORIGINS=https://your-frontend-domain.vercel.app
   railway variables set SOCKETIO_CORS_ORIGINS=https://your-frontend-domain.vercel.app
   railway variables set DATABASE_URL=postgresql://... # Railway will provide this
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

### Step 3: Get Railway Backend URL

After deployment, Railway will provide your backend URL (e.g., `https://your-app.railway.app`).

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

The frontend is configured with:
- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to ignore during deployment
- Environment variables configured for production

### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend:**
   ```bash
   # Navigate to frontend directory
   cd frontend

   # Deploy to Vercel
   vercel --prod
   ```

3. **Set Environment Variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add the following variables:
     ```
     REACT_APP_API_URL = https://your-backend.railway.app/api
     REACT_APP_WS_URL = https://your-backend.railway.app
     ```

## 🔗 Connection Configuration

### Backend CORS Configuration

The backend is configured to accept requests from your Vercel domain:

```python
# In app_flask.py
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=cors_origins)

socketio_cors_origins = os.getenv('SOCKETIO_CORS_ORIGINS', 'http://localhost:3000').split(',')
socketio = SocketIO(app, cors_allowed_origins=socketio_cors_origins)
```

### Frontend API Configuration

The frontend automatically uses environment variables:

```javascript
// In services/*.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8000';
```

## 🔧 Environment Variables

### Railway Backend Variables:
```
JWT_SECRET_KEY=your-super-secret-key-here
CORS_ORIGINS=https://your-frontend.vercel.app
SOCKETIO_CORS_ORIGINS=https://your-frontend.vercel.app
DATABASE_URL=postgresql://... (provided by Railway)
PORT=8000 (set automatically by Railway)
```

### Vercel Frontend Variables:
```
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_WS_URL=https://your-backend.railway.app
```

## 🚀 Deployment Commands

### Quick Deploy (Automated):
```bash
# Backend
railway up

# Frontend
cd frontend && vercel --prod
```

### Manual Deploy:
```bash
# Backend to Railway
railway login
railway link [your-project-id]
railway up

# Frontend to Vercel
vercel login
cd frontend
vercel --prod
```

## 🔍 Testing the Deployment

1. **Check Backend Health:**
   ```bash
   curl https://your-backend.railway.app/health
   ```

2. **Check Frontend:**
   - Visit your Vercel deployment URL
   - Try creating an account and poll

3. **Test WebSocket Connection:**
   - Open browser developer tools
   - Check console for WebSocket connection logs

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Ensure CORS_ORIGINS includes your Vercel domain
   - Check Railway logs: `railway logs`

2. **WebSocket Connection Issues:**
   - Verify SOCKETIO_CORS_ORIGINS includes your Vercel domain
   - Check if Railway WebSocket port is open

3. **Database Connection:**
   - Ensure DATABASE_URL is correctly set in Railway
   - Check if PostgreSQL is provisioned in Railway

4. **Build Errors:**
   - Check Railway build logs: `railway logs --follow`
   - Check Vercel deployment logs in dashboard

### Railway Logs:
```bash
railway logs --follow
```

### Vercel Logs:
- Check deployment logs in Vercel dashboard
- Use `vercel logs [deployment-url]` for specific deployment

## 📝 Production Checklist

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] CORS origins updated for production domains
- [ ] Database connection working
- [ ] WebSocket connection working
- [ ] Authentication working
- [ ] Real-time updates working
- [ ] Mobile responsive

## 🔄 Updates and Redeployment

### Backend Updates:
```bash
git add .
git commit -m "Update backend"
git push origin main
railway up
```

### Frontend Updates:
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push origin main
vercel --prod
```

## 📞 Support

If you encounter issues:
1. Check Railway and Vercel deployment logs
2. Verify environment variables
3. Test CORS configuration
4. Ensure database connectivity

## 🎯 Next Steps

After successful deployment:
1. Set up custom domains (optional)
2. Configure SSL certificates (automatic with Railway/Vercel)
3. Set up monitoring and logging
4. Configure backup strategies
5. Set up CI/CD pipelines for automated deployments
