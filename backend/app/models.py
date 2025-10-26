from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    polls = relationship("Poll", back_populates="creator")
    votes = relationship("Vote", back_populates="user")
    likes = relationship("Like", back_populates="user")

class Poll(Base):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    creator_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    total_votes = Column(Integer, default=0)
    total_likes = Column(Integer, default=0)

    # Relationships
    creator = relationship("User", back_populates="polls")
    options = relationship("PollOption", back_populates="poll", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="poll", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="poll", cascade="all, delete-orphan")

class PollOption(Base):
    __tablename__ = "poll_options"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id"))
    option_text = Column(String, nullable=False)
    vote_count = Column(Integer, default=0)

    # Relationships
    poll = relationship("Poll", back_populates="options")
    votes = relationship("Vote", back_populates="option", cascade="all, delete-orphan")

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    poll_id = Column(Integer, ForeignKey("polls.id"))
    option_id = Column(Integer, ForeignKey("poll_options.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="votes")
    poll = relationship("Poll", back_populates="votes")
    option = relationship("PollOption", back_populates="votes")

class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    poll_id = Column(Integer, ForeignKey("polls.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="likes")
    poll = relationship("Poll", back_populates="likes")
