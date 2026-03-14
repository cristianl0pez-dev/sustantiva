from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User, UserRole
from app.core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    
    if not user.activo:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.activo:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


class RequireRole:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles
    
    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.rol not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user


def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.rol != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


def require_student_success(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.rol not in [UserRole.ADMIN, UserRole.STUDENT_SUCCESS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student Success privileges required"
        )
    return current_user
