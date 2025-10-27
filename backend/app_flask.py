from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
import os
from datetime import datetime, timedelta
import json
import jwt
import bcrypt

# Monkey patch for gevent compatibility
try:
    import gevent
    from gevent import monkey
    monkey.patch_all()
except ImportError:
    pass

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///./opinion_poll.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure for Render PostgreSQL
if app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgres://'):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace('postgres://', 'postgresql://', 1)

# CORS configuration for production
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, origins=cors_origins)

# SocketIO configuration for production
socketio_cors_origins = os.getenv('SOCKETIO_CORS_ORIGINS', 'http://localhost:3000').split(',')
# Try different async modes in order of preference
async_modes = ['gevent', 'eventlet', 'threading']
for mode in async_modes:
    try:
        socketio = SocketIO(app, cors_allowed_origins=socketio_cors_origins, async_mode=mode)
        print(f"Using SocketIO async mode: {mode}")
        break
    except (RuntimeError, ImportError) as e:
        print(f"Failed to use {mode} mode: {e}")
        continue
else:
    # Final fallback - disable async mode entirely (uses HTTP polling)
    socketio = SocketIO(app, cors_allowed_origins=socketio_cors_origins, async_mode=None)
db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Poll(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    total_votes = db.Column(db.Integer, default=0)
    total_likes = db.Column(db.Integer, default=0)

class PollOption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    poll_id = db.Column(db.Integer, db.ForeignKey('poll.id'), nullable=False)
    option_text = db.Column(db.String(200), nullable=False)
    vote_count = db.Column(db.Integer, default=0)

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    poll_id = db.Column(db.Integer, db.ForeignKey('poll.id'), nullable=False)
    option_id = db.Column(db.Integer, db.ForeignKey('poll_option.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    poll_id = db.Column(db.Integer, db.ForeignKey('poll.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

# Authentication utility functions
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, app.config['SECRET_KEY'], algorithm="HS256")
    return encoded_jwt

def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    payload = verify_token(token)
    if payload:
        return payload.get("sub")
    return None

# Authentication endpoints
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not all([username, password]):
            return jsonify({'error': 'Username and password are required'}), 400

        # Check if user already exists
        existing_user = User.query.filter(User.username == username).first()
        if existing_user:
            return jsonify({'error': 'User with this username already exists'}), 400

        # Create new user
        hashed_password = hash_password(password)
        new_user = User(
            username=username,
            email=f"{username}@example.com"
        )
        new_user.password_hash = hashed_password
        db.session.add(new_user)
        db.session.commit()

        # Create access token
        token_data = {"sub": str(new_user.id), "username": new_user.username}
        access_token = create_access_token(token_data)

        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email
            },
            'access_token': access_token,
            'token_type': 'bearer'
        }), 201

    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/signin', methods=['POST'])
def signin():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not all([username, password]):
            return jsonify({'error': 'Username and password are required'}), 400

        user = User.query.filter_by(username=username).first()
        if not user or not verify_password(password, user.password_hash):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Create access token
        token_data = {"sub": str(user.id), "username": user.username}
        access_token = create_access_token(token_data)

        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'access_token': access_token,
        }), 200

    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/me', methods=['GET'])
def get_current_user_info():
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200

    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
@app.route('/api/polls/', methods=['GET'])
@app.route('/api/polls', methods=['GET'])
def get_polls():
    polls = Poll.query.filter_by(is_active=True).all()
    result = []
    for poll in polls:
        creator = User.query.get(poll.creator_id)
        total_votes = db.session.query(func.sum(PollOption.vote_count)).filter(PollOption.poll_id == poll.id).scalar() or 0
        total_likes = Like.query.filter_by(poll_id=poll.id).count()

        result.append({
            'id': poll.id,
            'title': poll.title,
            'description': poll.description,
            'created_at': poll.created_at.isoformat(),
            'total_votes': total_votes,
            'total_likes': total_likes,
            'creator_username': creator.username
        })
    return jsonify(result)

@app.route('/api/polls/', methods=['POST'])
@app.route('/api/polls', methods=['POST'])
def create_poll():
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        poll = Poll(
            title=data['title'],
            description=data.get('description'),
            creator_id=user.id
        )
        db.session.add(poll)
        db.session.commit()

        for option_data in data['options']:
            option = PollOption(
                poll_id=poll.id,
                option_text=option_data['option_text']
            )
            db.session.add(option)

        db.session.commit()

        # Emit real-time update
        socketio.emit('poll_created', {
            'poll': {
                'id': poll.id,
                'title': poll.title,
                'description': poll.description,
                'total_votes': 0,
                'total_likes': 0,
                'creator_username': user.username
            }
        })

        return jsonify({'message': 'Poll created successfully'})

    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/polls/<int:poll_id>/', methods=['GET'])
@app.route('/api/polls/<int:poll_id>', methods=['GET'])
def get_poll(poll_id):
    poll = Poll.query.filter_by(id=poll_id, is_active=True).first()
    if not poll:
        return jsonify({'error': 'Poll not found'}), 404

    creator = User.query.get(poll.creator_id)
    options = PollOption.query.filter_by(poll_id=poll.id).all()

    # Format response to match frontend expectations
    return jsonify({
        'id': poll.id,
        'title': poll.title,
        'description': poll.description,
        'created_at': poll.created_at.isoformat(),
        'updated_at': poll.updated_at.isoformat() if poll.updated_at else None,
        'creator_id': poll.creator_id,
        'is_active': poll.is_active,
        'total_votes': poll.total_votes,
        'total_likes': poll.total_likes,
        'creator': {
            'id': creator.id,
            'username': creator.username,
            'email': creator.email,
            'created_at': creator.created_at.isoformat()
        },
        'options': [{
            'id': option.id,
            'poll_id': option.poll_id,
            'option_text': option.option_text,
            'vote_count': option.vote_count
        } for option in options]
    })

@app.route('/api/polls/<int:poll_id>/vote', methods=['POST'])
def vote_poll(poll_id):
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        poll = Poll.query.filter_by(id=poll_id, is_active=True).first()
        if not poll:
            return jsonify({'error': 'Poll not found'}), 404

        option = PollOption.query.filter_by(id=data['option_id'], poll_id=poll_id).first()
        if not option:
            return jsonify({'error': 'Poll option not found'}), 404

        # Check if user already voted
        existing_vote = Vote.query.filter_by(user_id=user.id, poll_id=poll_id).first()
        if existing_vote:
            old_option = PollOption.query.get(existing_vote.option_id)
            if old_option:
                old_option.vote_count -= 1
            existing_vote.option_id = data['option_id']
        else:
            vote = Vote(user_id=user.id, poll_id=poll_id, option_id=data['option_id'])
            db.session.add(vote)
            poll.total_votes += 1

        option.vote_count += 1
        db.session.commit()

        # Emit real-time update
        socketio.emit('poll_vote', {
            'poll_id': poll_id,
            'option_id': option.id,
            'option_text': option.option_text,
            'vote_count': option.vote_count,
            'total_votes': poll.total_votes
        })

        return jsonify({'message': 'Vote recorded successfully'})

    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/polls/<int:poll_id>/like', methods=['POST'])
def like_poll(poll_id):
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404

        poll = Poll.query.filter_by(id=poll_id, is_active=True).first()
        if not poll:
            return jsonify({'error': 'Poll not found'}), 404

        existing_like = Like.query.filter_by(user_id=user.id, poll_id=poll_id).first()
        if existing_like:
            return jsonify({'error': 'Already liked this poll'}), 400

        like = Like(user_id=user.id, poll_id=poll_id)
        db.session.add(like)
        poll.total_likes += 1
        db.session.commit()

        # Emit real-time update
        socketio.emit('poll_like', {
            'poll_id': poll_id,
            'total_likes': poll.total_likes,
            'liked': True
        })

        return jsonify({'message': 'Poll liked successfully'})

    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/polls/<int:poll_id>/like', methods=['DELETE'])
def unlike_poll(poll_id):
    try:
        user_id = get_current_user()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404

        poll = Poll.query.filter_by(id=poll_id, is_active=True).first()
        if not poll:
            return jsonify({'error': 'Poll not found'}), 404

        like = Like.query.filter_by(user_id=user.id, poll_id=poll_id).first()
        if not like:
            return jsonify({'error': 'Like not found'}), 404

        db.session.delete(like)
        poll.total_likes -= 1
        db.session.commit()

        # Emit real-time update
        socketio.emit('poll_like', {
            'poll_id': poll_id,
            'total_likes': poll.total_likes,
            'liked': False
        })

        return jsonify({'message': 'Poll unliked successfully'})

    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

# WebSocket events
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@app.route('/')
def index():
    return jsonify({'message': 'Opinion Poll Platform API'})

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    socketio.run(app, host='localhost', port=8000, debug=True)
