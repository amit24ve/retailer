from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.db.database import get_database

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme), db=Depends(get_database)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db["users"].find_one({"user_id": user_id})
    if user is None:
        raise credentials_exception
    return user


# ─── Role-based data scoping ───────────────────────────────────────────────────

BRAND_LEVEL_ROLES = {"Brand Owner", "Brand Admin", "Regional Manager"}
STORE_LEVEL_ROLES = {"Store Manager", "Cashier", "Sales Executive"}
ALL_ROLES = {"Super Admin", "super_admin"} | BRAND_LEVEL_ROLES | STORE_LEVEL_ROLES


def get_data_scope(current_user: dict):
    """
    Returns (brand_id_filter, store_id_filter) based on user role.
    - Super Admin: (None, None) — sees all data
    - Brand Owner / Brand Admin: (brand_id, None) — all stores in brand
    - Regional Manager: (brand_id, None) — all brand stores (region filtering can be added later)
    - Store Manager / Cashier / Sales Executive: (brand_id, store_id) — only their store
    """
    role = current_user.get("role", "")
    brand_id = current_user.get("brand_id", "")
    store_id = current_user.get("store_id")

    if role in ("Super Admin", "super_admin"):
        return None, None
    elif role in ("Brand Owner", "Brand Admin", "Regional Manager"):
        return brand_id, None
    elif role in ("Store Manager", "Cashier", "Sales Executive"):
        return brand_id, store_id
    # default — brand scope
    return brand_id, None


def require_role(*allowed_roles):
    """FastAPI dependency — raises 403 if role not in allowed_roles."""
    from fastapi import Depends, HTTPException

    async def check(current_user=Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role '{current_user.get('role')}' not allowed",
            )
        return current_user

    return check
