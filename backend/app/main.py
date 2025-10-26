from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging

from app.database import engine
from app.models import Base
from app.routers import polls, websocket

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Opinion Poll Platform",
    description="Real-time polling platform with live updates",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(polls.router, prefix="/api/polls", tags=["polls"])
app.include_router(websocket.router, prefix="/api", tags=["websocket"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to Opinion Poll Platform API"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
