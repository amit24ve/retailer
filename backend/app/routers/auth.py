from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
import random

from app.core.security import verify_password, create_access_token, get_password_hash, get_current_user
from app.core.config import settings
from app.db.database import get_database
from app.core.email import send_email
from app.core.templates import (
    get_welcome_email,
    get_email_verification_email,
    get_forgot_password_email,
    get_password_reset_success_email,
    get_change_email_confirmation_email,
    get_login_new_device_email,
    get_retailer_registration_submitted_email
)

router = APIRouter()

# --- Request Models ---
class RegisterRetailerRequest(BaseModel):
    brand_name: str
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    gst_number: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

class ChangeEmailRequest(BaseModel):
    new_email: EmailStr

# --- Existing Endpoints with Login Device Check ---

@router.post("/token")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db=Depends(get_database)
):
    user = await db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if user.get("status") != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive or locked")

    token = create_access_token(
        data={"sub": user["user_id"]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    # 1. Trigger "Login From New Device" Security Email notification
    user_agent = request.headers.get("user-agent", "Unknown Device")
    client_ip = request.client.host if request.client else "Unknown IP"
    time_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # Asynchronously dispatch email notification
    device_html = get_login_new_device_email(user_agent, client_ip, time_str)
    await send_email("login_from_new_device", user["email"], "Security Alert: Login From New Device", device_html)

    # Update last login
    await db["users"].update_one(
        {"user_id": user["user_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "brand_name": user.get("brand_name", "RetailCRM"),
            "brand_id": user.get("brand_id"),
            "tenant_id": user.get("tenant_id"),
            "store_id": user.get("store_id"),
        }
    }

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "role": current_user["role"],
        "brand_name": current_user.get("brand_name"),
    }

# --- New Authentication & Security Endpoints ---

@router.post("/register-retailer", status_code=status.HTTP_201_CREATED)
async def register_retailer(payload: RegisterRetailerRequest, db=Depends(get_database)):
    """
    Public Retailer (Brand Owner) Registration.
    Creates a pending account, sends registration submitted email.
    """
    existing = await db["users"].find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    brand_id = f"brand-{payload.brand_name.lower().replace(' ', '-')}-{str(uuid.uuid4())[:8]}"
    tenant_id = f"tenant-{brand_id}"
    user_id = str(uuid.uuid4())

    # Create pending brand
    await db["brands"].insert_one({
        "brand_id": brand_id,
        "tenant_id": tenant_id,
        "name": payload.brand_name,
        "logo_url": f"https://ui-avatars.com/api/?name={payload.brand_name[:2].upper()}&background=7c3aed&color=fff",
        "currency": "INR",
        "credits": {
            "sms": 100,
            "email": 100,
            "wa_utility": 100,
            "wa_marketing": 100,
        },
        "settings": {
            "points_per_100": 10,
            "point_to_inr": 0.10,
            "calculation_window_days": 365,
            "min_redemption_points": 500,
            "max_redemption_pct": 0.50,
        },
        "status": "pending",  # pending approval
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    })

    # Create pending brand owner user
    await db["users"].insert_one({
        "user_id": user_id,
        "tenant_id": tenant_id,
        "brand_id": brand_id,
        "store_id": None,
        "username": payload.email.split("@")[0],
        "email": payload.email,
        "password_hash": get_password_hash(payload.password),
        "full_name": payload.full_name,
        "role": "Brand Owner",
        "brand_name": payload.brand_name,
        "phone": payload.phone or "",
        "company_name": payload.company_name or "",
        "gst_number": payload.gst_number or "",
        "status": "pending",  # pending approval
        "email_verified": False,
        "last_login": None,
        "created_at": datetime.utcnow(),
    })

    # Trigger Welcome email after account creation
    welcome_html = get_welcome_email(payload.full_name, payload.email, "Brand Owner")
    await send_email("welcome_after_account_creation", payload.email, "Welcome to Cuben Retailer", welcome_html)

    # Trigger Retailer Registration Submitted email
    submitted_html = get_retailer_registration_submitted_email(payload.brand_name)
    await send_email("retailer_registration_submitted", payload.email, "Retailer Registration Submitted", submitted_html)

    # Trigger Verification Code email
    verify_code = str(random.randint(100000, 999999))
    await db["auth_tokens"].insert_one({
        "email": payload.email,
        "code": verify_code,
        "type": "email_verification",
        "created_at": datetime.utcnow()
    })
    verify_html = get_email_verification_email(payload.email, verify_code)
    await send_email("email_verification", payload.email, "Verify Your Email Address", verify_html)

    return {
        "success": True,
        "message": "Retailer registration submitted successfully. Please check your email for verification code.",
        "user_id": user_id,
        "brand_id": brand_id
    }

@router.post("/verify-email")
async def verify_email(payload: VerifyEmailRequest, db=Depends(get_database)):
    """
    Verify email address using registration code.
    """
    token_record = await db["auth_tokens"].find_one({
        "email": payload.email,
        "code": payload.code,
        "type": "email_verification"
    })
    if not token_record:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    await db["users"].update_one(
        {"email": payload.email},
        {"$set": {"email_verified": True}}
    )
    # Remove verification token after success
    await db["auth_tokens"].delete_one({"_id": token_record["_id"]})

    return {"success": True, "message": "Email verified successfully"}

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db=Depends(get_database)):
    """
    Initiate forgot password sequence, sends email with a unique token.
    """
    user = await db["users"].find_one({"email": payload.email})
    if not user:
        # Avoid user enumeration, fail silently / return success anyway
        return {"success": True, "message": "Password reset instructions sent if email exists."}

    reset_token = str(uuid.uuid4())
    await db["auth_tokens"].insert_one({
        "email": payload.email,
        "token": reset_token,
        "type": "password_reset",
        "created_at": datetime.utcnow()
    })

    reset_url = f"https://retailer.avopay.pro/reset-password?token={reset_token}"
    forgot_html = get_forgot_password_email(payload.email, reset_url)
    await send_email("forgot_password", payload.email, "Reset Your Password - Cuben Retailer", forgot_html)

    return {"success": True, "message": "Password reset instructions sent."}

@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db=Depends(get_database)):
    """
    Complete password reset via reset token.
    """
    token_record = await db["auth_tokens"].find_one({
        "token": payload.token,
        "type": "password_reset"
    })
    if not token_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    email = token_record["email"]
    password_hash = get_password_hash(payload.new_password)

    await db["users"].update_one(
        {"email": email},
        {"$set": {"password_hash": password_hash}}
    )
    # Delete token
    await db["auth_tokens"].delete_one({"_id": token_record["_id"]})

    # Trigger Password Reset Success email
    success_html = get_password_reset_success_email(email)
    await send_email("password_reset_success", email, "Password Reset Successfully", success_html)

    return {"success": True, "message": "Password updated successfully"}

@router.post("/change-email")
async def change_email(payload: ChangeEmailRequest, current_user=Depends(get_current_user), db=Depends(get_database)):
    """
    Initiate email change process. Sends code to confirmation email.
    """
    existing = await db["users"].find_one({"email": payload.new_email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    confirm_token = str(uuid.uuid4())
    await db["auth_tokens"].insert_one({
        "user_id": current_user["user_id"],
        "current_email": current_user["email"],
        "new_email": payload.new_email,
        "token": confirm_token,
        "type": "change_email",
        "created_at": datetime.utcnow()
    })

    confirm_url = f"https://retailer.avopay.pro/confirm-email-change?token={confirm_token}"
    confirm_html = get_change_email_confirmation_email(payload.new_email, confirm_url)
    await send_email("change_email_confirmation", payload.new_email, "Confirm Your Email Change", confirm_html)

    return {"success": True, "message": "Confirmation instructions sent to the new email address."}
