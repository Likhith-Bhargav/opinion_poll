#!/usr/bin/env python3
"""
Run script for the Opinion Poll Platform Backend (Flask version)
"""
from app_flask import app, socketio

if __name__ == "__main__":
    socketio.run(
        app,
        host="0.0.0.0",
        port=8000,
        debug=True
    )
