from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    nombre: str
    rol: UserRole = UserRole.STUDENT_SUCCESS


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre: Optional[str] = None
    rol: Optional[UserRole] = None
    activo: Optional[bool] = None


class UserInDB(UserBase):
    id: int
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True


class User(UserInDB):
    hashed_password: str = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
