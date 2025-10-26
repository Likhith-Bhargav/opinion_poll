from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Poll schemas
class PollOptionBase(BaseModel):
    option_text: str

class PollOptionCreate(PollOptionBase):
    pass

class PollOption(PollOptionBase):
    id: int
    poll_id: int
    vote_count: int

    class Config:
        orm_mode = True

class PollBase(BaseModel):
    title: str
    description: Optional[str] = None

class PollCreate(PollBase):
    options: List[PollOptionCreate]

class PollUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Poll(PollBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    creator_id: int
    is_active: bool
    total_votes: int
    total_likes: int
    creator: User
    options: List[PollOption]

    class Config:
        orm_mode = True

class PollSummary(BaseModel):
    id: int
    title: str
    description: Optional[str]
    created_at: datetime
    total_votes: int
    total_likes: int
    creator_username: str

    class Config:
        orm_mode = True

# Vote schemas
class VoteBase(BaseModel):
    poll_id: int
    option_id: int

class VoteCreate(VoteBase):
    pass

class Vote(VoteBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Like schemas
class LikeBase(BaseModel):
    poll_id: int

class LikeCreate(LikeBase):
    pass

class Like(LikeBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# WebSocket message schemas
class WSMessage(BaseModel):
    type: str  # "poll_update", "vote", "like", "new_poll"
    data: dict

class WSMessageResponse(BaseModel):
    message: str
    data: dict
