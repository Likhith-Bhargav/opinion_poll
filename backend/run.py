#!/usr/bin/env python3
"""
Run script for the Opinion Poll Platform Backend (Flask version)
"""
import os
from app_flask import app, socketio

if __name__ == "__main__":
    port = int(os.getenv('PORT', 8000))
    socketio.run(
        app,
        host="0.0.0.0",
        port=port,
        debug=False  # Disable debug in production
    )
