from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models import User
from app.auth_schemas import UserSignup, UserSignin, Token, UserResponse
from app.auth_utils import hash_password, verify_password, create_access_token, get_current_user
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """User signup endpoint"""
    try:
        data = request.get_json()
        user_data = UserSignup(**data)

        # Check if user already exists
        db = next(get_db())
        existing_user = db.query(User).filter(User.username == user_data.username).first()

        if existing_user:
            return jsonify({"error": "User with this username already exists"}), 400

        # Create new user
        hashed_password = hash_password(user_data.password)
        new_user = User(
            username=user_data.username,
            email=f"{user_data.username}@example.com"  # Generate a placeholder email
        )
        new_user.password_hash = hashed_password

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Create access token
        token_data = {"sub": str(new_user.id), "username": new_user.username}
        access_token = create_access_token(token_data)

        return jsonify({
            "message": "User created successfully",
            "user": UserResponse.from_orm(new_user).dict(),
            "access_token": access_token,
            "token_type": "bearer"
        }), 201

    except IntegrityError:
        return jsonify({"error": "User with this username already exists"}), 400
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@auth_bp.route('/signin', methods=['POST'])
def signin():
    """User signin endpoint"""
    try:
        data = request.get_json()
        user_data = UserSignin(**data)

        db = next(get_db())
        user = db.query(User).filter(User.username == user_data.username).first()

        if not user or not verify_password(user_data.password, user.password_hash):
            return jsonify({"error": "Invalid credentials"}), 401

        # Create access token
        token_data = {"sub": str(user.id), "username": user.username}
        access_token = create_access_token(token_data)

        return jsonify({
            "message": "Login successful",
            "user": UserResponse.from_orm(user).dict(),
            "access_token": access_token,
            "token_type": "bearer"
        }), 200

    except Exception as e:
        logger.error(f"Signin error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user_info():
    """Get current user information"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authentication required"}), 401

        token = auth_header.split(' ')[1]
        user_id = get_current_user(token)

        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        db = next(get_db())
        user = db.query(User).filter(User.id == int(user_id)).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "user": UserResponse.from_orm(user).dict()
        }), 200

    except Exception as e:
        logger.error(f"Get user info error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
