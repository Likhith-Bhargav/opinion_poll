from pydantic import BaseModel
from typing import Optional

class UserSignup(BaseModel):
    username: str
    password: str

class UserSignin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True
