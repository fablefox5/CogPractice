from datetime import datetime, timezone, timedelta

import bcrypt
from fastapi import Depends, HTTPException, status, Request
from config import ACCESS_TOKEN_EXPIRE_MINUTES, JWT_ALGORITHM
from dotenv import load_dotenv
from database.database import get_user
import os
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from schemas import HashedLogin

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

load_dotenv()

def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')

    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)

    return hashed_bytes.decode('utf-8')

def verify_password(plain: str, hashed:str) -> bool:
    password_bytes = plain.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')

    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_in_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_in_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, os.getenv("SECRET_KEY"), JWT_ALGORITHM)

async def authenticate_user(username: str, password: str) -> HashedLogin | None:
    user: HashedLogin = await get_user(username)
    if not user:
        print("No user")
        return None

    verified_password = verify_password(password, user.hashed_password)
    if not verified_password:
        print("Verification password fail")
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    invalid_cred_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise invalid_cred_exception
    except JWTError:
        raise invalid_cred_exception

    user: HashedLogin = await get_user(username)

    if not user:
        raise invalid_cred_exception

    return {"username": user.username, "is_admin": getattr(user, "is_admin", False), "user_id": getattr(user, "user_id")}


def verify_ownership_or_admin(owner_user_id: int, current_user: dict):
    if owner_user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="owner's user_id is required in the body"
        )


    is_owner = current_user.get("user_id") == owner_user_id
    is_admin = current_user.get("is_admin") is True

    if not (is_admin or is_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only access your own resource."
        )
    # return current_user

def require_admin(payload: dict = Depends(get_current_user)):
    is_admin = payload.get("is_admin", False)

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )

    return payload
