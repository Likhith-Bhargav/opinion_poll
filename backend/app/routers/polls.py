from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import time
import random

from app.database import get_db
from app.models import Poll, PollOption, Vote, Like, User
from app.schemas import PollCreate, Poll, PollUpdate, VoteCreate, LikeCreate, PollSummary
from app.websocket_manager import manager

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=Poll)
async def create_poll(poll: PollCreate, request: Request, db: Session = Depends(get_db)):
    """Create a new poll with options"""
    # Check if this is a test request with a specific user identifier
    test_user_id = request.query_params.get("test_user")
    if test_user_id:
        # Use test user ID for testing multiple users from same IP
        user_identifier = f"test_{test_user_id}"
        username = f"test_user_{test_user_id}"
        email = f"{username}@test.local"
    else:
        # Create unique anonymous user based on IP and user agent
        user_identifier = f"{client_ip}_{hash(user_agent) % 10000}"
        username = f"anonymous_{user_identifier}"
        email = f"{username}@anonymous.local"

    # Check if user exists, if not create one
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    db_poll = Poll(
        title=poll.title,
        description=poll.description,
        creator_id=user.id
    )
    db.add(db_poll)
    db.commit()
    db.refresh(db_poll)

    # Create poll options
    for option in poll.options:
        db_option = PollOption(
            poll_id=db_poll.id,
            option_text=option.option_text
        )
        db.add(db_option)

    db.commit()
    db.refresh(db_poll)

    # Broadcast new poll creation
    await manager.broadcast_poll_update(
        db_poll.id,
        "created",
        {
            "poll": {
                "id": db_poll.id,
                "title": db_poll.title,
                "description": db_poll.description,
                "total_votes": 0,
                "total_likes": 0,
                "creator_username": user.username
            }
        }
    )

    return db_poll

@router.get("/", response_model=List[PollSummary])
async def get_polls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all active polls"""
    polls = db.query(Poll).filter(Poll.is_active == True).offset(skip).limit(limit).all()

    result = []
    for poll in polls:
        # Get creator username
        creator = db.query(User).filter(User.id == poll.creator_id).first()

        # Calculate total votes
        total_votes = db.query(func.sum(PollOption.vote_count)).filter(
            PollOption.poll_id == poll.id
        ).scalar() or 0

        # Calculate total likes
        total_likes = db.query(func.count(Like.id)).filter(
            Like.poll_id == poll.id
        ).scalar() or 0

        result.append(PollSummary(
            id=poll.id,
            title=poll.title,
            description=poll.description,
            created_at=poll.created_at,
            total_votes=total_votes,
            total_likes=total_likes,
            creator_username=creator.username if creator else "anonymous"
        ))

    return result

@router.get("/{poll_id}", response_model=Poll)
async def get_poll(poll_id: int, db: Session = Depends(get_db)):
    """Get a specific poll with all options"""
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.is_active == True).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")

    return poll

@router.post("/{poll_id}/vote")
async def vote_on_poll(poll_id: int, vote: VoteCreate, request: Request, db: Session = Depends(get_db)):
    """Submit a vote for a poll option"""
    # Check if poll exists and is active
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.is_active == True).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")

    # Check if option exists
    option = db.query(PollOption).filter(
        PollOption.id == vote.option_id,
        PollOption.poll_id == poll_id
    ).first()
    if not option:
        raise HTTPException(status_code=404, detail="Poll option not found")

    # Get client IP for user identification
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "unknown")

    # Check if this is a test request with a specific user identifier
    test_user_id = request.query_params.get("test_user")
    if test_user_id:
        # Use test user ID for testing multiple users from same IP
        timestamp = int(time.time() * 1000000)  # microseconds
        random_suffix = random.randint(1000, 9999)
        user_identifier = f"test_{test_user_id}_{timestamp}_{random_suffix}"
        username = f"test_user_{test_user_id}_{timestamp}_{random_suffix}"
        email = f"{username}@test.local"
    else:
        # Create unique anonymous user based on IP and user agent
        user_identifier = f"{client_ip}_{hash(user_agent) % 10000}"
        username = f"anonymous_{user_identifier}"
        email = f"{username}@anonymous.local"

    # Check if user exists, if not create one
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Check if user already voted on this poll
    existing_vote = db.query(Vote).filter(
        Vote.user_id == user.id,
        Vote.poll_id == poll_id
    ).first()

    if existing_vote:
        # Update existing vote
        old_option = db.query(PollOption).filter(PollOption.id == existing_vote.option_id).first()
        if old_option:
            old_option.vote_count -= 1

        existing_vote.option_id = vote.option_id
        db.commit()
    else:
        # Create new vote
        new_vote = Vote(
            user_id=user.id,
            poll_id=poll_id,
            option_id=vote.option_id
        )
        db.add(new_vote)

        # Update poll total votes
        poll.total_votes += 1

    # Update option vote count
    option.vote_count += 1
    db.commit()

    # Refresh data for broadcast
    db.refresh(poll)
    db.refresh(option)

    # Broadcast vote update
    await manager.broadcast_poll_update(
        poll_id,
        "vote",
        {
            "option_id": option.id,
            "option_text": option.option_text,
            "vote_count": option.vote_count,
            "total_votes": poll.total_votes
        }
    )

    return {"message": "Vote recorded successfully"}

@router.post("/{poll_id}/like")
async def like_poll(poll_id: int, request: Request, db: Session = Depends(get_db)):
    """Like a poll"""
    # Check if poll exists and is active
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.is_active == True).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")

    # Get client IP for user identification
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "unknown")

    # Check if this is a test request with a specific user identifier
    test_user_id = request.query_params.get("test_user")
    if test_user_id:
        # Use test user ID for testing multiple users from same IP
        timestamp = int(time.time() * 1000000)  # microseconds
        random_suffix = random.randint(1000, 9999)
        user_identifier = f"test_{test_user_id}_{timestamp}_{random_suffix}"
        username = f"test_user_{test_user_id}_{timestamp}_{random_suffix}"
        email = f"{username}@test.local"
    else:
        # Create unique anonymous user based on IP and user agent
        user_identifier = f"{client_ip}_{hash(user_agent) % 10000}"
        username = f"anonymous_{user_identifier}"
        email = f"{username}@anonymous.local"

    # Check if user exists, if not create one
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Check if user already liked this poll
    existing_like = db.query(Like).filter(
        Like.user_id == user.id,
        Like.poll_id == poll_id
    ).first()

    if existing_like:
        raise HTTPException(status_code=400, detail="Already liked this poll")

    # Create new like
    new_like = Like(
        user_id=user.id,
        poll_id=poll_id
    )
    db.add(new_like)

    # Update poll total likes
    poll.total_likes += 1
    db.commit()

    # Broadcast like update
    await manager.broadcast_poll_update(
        poll_id,
        "like",
        {
            "total_likes": poll.total_likes,
            "liked": True
        }
    )

    return {"message": "Poll liked successfully"}

@router.delete("/{poll_id}/like")
async def unlike_poll(poll_id: int, request: Request, db: Session = Depends(get_db)):
    """Unlike a poll"""
    # Check if poll exists and is active
    poll = db.query(Poll).filter(Poll.id == poll_id, Poll.is_active == True).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")

    # Get client IP for user identification
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "unknown")

    # Check if this is a test request with a specific user identifier
    test_user_id = request.query_params.get("test_user")
    if test_user_id:
        # Use test user ID for testing multiple users from same IP
        timestamp = int(time.time() * 1000000)  # microseconds
        random_suffix = random.randint(1000, 9999)
        user_identifier = f"test_{test_user_id}_{timestamp}_{random_suffix}"
        username = f"test_user_{test_user_id}_{timestamp}_{random_suffix}"
        email = f"{username}@test.local"
    else:
        # Create unique anonymous user based on IP and user agent
        user_identifier = f"{client_ip}_{hash(user_agent) % 10000}"
        username = f"anonymous_{user_identifier}"
        email = f"{username}@anonymous.local"

    # Check if user exists, if not create one
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find and remove like
    like = db.query(Like).filter(
        Like.user_id == user.id,
        Like.poll_id == poll_id
    ).first()

    if not like:
        raise HTTPException(status_code=404, detail="Like not found")

    # Remove like
    db.delete(like)

    # Update poll total likes
    poll.total_likes -= 1
    db.commit()

    # Broadcast like update
    await manager.broadcast_poll_update(
        poll_id,
        "like",
        {
            "total_likes": poll.total_likes,
            "liked": False
        }
    )

    return {"message": "Poll unliked successfully"}
