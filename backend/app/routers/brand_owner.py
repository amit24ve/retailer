"""
Brand Owner routes for credit management:
  POST /brand-owner/credit-request   - Submit a credit refill request
  GET  /brand-owner/credit-requests  - View own credit requests
"""

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from app.core.security import get_current_user
from app.db.database import get_database

router = APIRouter()


def require_brand_owner(current_user=Depends(get_current_user)):
    if current_user.get("role") not in ("Brand Owner", "Brand Admin", "brand_owner"):
        raise HTTPException(
            status_code=403, detail="Brand Owner or Brand Admin access required"
        )
    return current_user


class CreditRefillRequest(BaseModel):
    sms: Optional[int] = 0
    wa_utility: Optional[int] = 0
    wa_marketing: Optional[int] = 0
    note: Optional[str] = None


# ─── POST /brand-owner/credit-request ─────────────────────────────────────────
@router.post("/credit-request")
async def submit_credit_request(
    payload: CreditRefillRequest,
    db=Depends(get_database),
    current_user=Depends(require_brand_owner),
):
    """Brand Owner submits a credit refill request to Super Admin."""
    if (
        (payload.sms or 0) <= 0
        and (payload.wa_utility or 0) <= 0
        and (payload.wa_marketing or 0) <= 0
    ):
        raise HTTPException(
            status_code=400, detail="Please request at least some credits"
        )

    # Get brand info
    brand_id = current_user.get("brand_id")
    brand = (
        await db["brands"].find_one({"brand_id": brand_id}, {"_id": 0, "name": 1})
        if brand_id
        else None
    )

    # Check for existing pending request
    existing = await db["credit_requests"].find_one(
        {"user_id": current_user.get("user_id"), "status": "pending"}
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending credit request. Please wait for Super Admin to process it.",
        )

    request_id = str(uuid.uuid4())
    await db["credit_requests"].insert_one(
        {
            "request_id": request_id,
            "brand_id": brand_id or "",
            "brand_name": brand.get("name", current_user.get("brand_name", "Unknown"))
            if brand
            else current_user.get("brand_name", "Unknown"),
            "user_id": current_user.get("user_id"),
            "owner_name": current_user.get("full_name", ""),
            "sms_requested": payload.sms or 0,
            "wa_utility_requested": payload.wa_utility or 0,
            "wa_marketing_requested": payload.wa_marketing or 0,
            "note": payload.note or "",
            "status": "pending",
            "requested_at": datetime.utcnow(),
            "processed_at": None,
            "processed_by": None,
            "rejection_reason": None,
        }
    )

    return {
        "success": True,
        "request_id": request_id,
        "message": "Credit refill request submitted. Super Admin will process within 24 hours.",
    }


# ─── GET /brand-owner/credit-requests ─────────────────────────────────────────
@router.get("/credit-requests")
async def get_my_credit_requests(
    db=Depends(get_database),
    current_user=Depends(require_brand_owner),
):
    """Brand Owner views their own credit requests."""
    requests = (
        await db["credit_requests"]
        .find({"user_id": current_user.get("user_id")}, {"_id": 0})
        .sort("requested_at", -1)
        .to_list(50)
    )

    result = []
    for r in requests:
        r["requested_at"] = str(r.get("requested_at", ""))
        r["processed_at"] = (
            str(r.get("processed_at", "")) if r.get("processed_at") else None
        )
        result.append(r)

    return {"requests": result, "total": len(result)}


# ─── GET /brand-owner/credits ──────────────────────────────────────────────────
@router.get("/credits")
async def get_my_credits(
    db=Depends(get_database),
    current_user=Depends(require_brand_owner),
):
    """Brand Owner views their own credit balance."""
    brand_id = current_user.get("brand_id")
    if not brand_id:
        return {"sms": 0, "wa_utility": 0, "wa_marketing": 0, "email": 0}

    brand = await db["brands"].find_one(
        {"brand_id": brand_id}, {"_id": 0, "credits": 1}
    )
    credits = (brand.get("credits") if brand else None) or {
        "sms": 0,
        "email": 0,
        "wa_utility": 0,
        "wa_marketing": 0,
    }
    return credits


# ─── POST /brand-owner/create-store-manager ────────────────────────────────
class CreateStoreManagerRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    store_id: str  # which store they manage
    store_name: str  # display name of the store
    phone: Optional[str] = None


@router.post("/create-store-manager", status_code=201)
async def create_store_manager(
    payload: CreateStoreManagerRequest,
    db=Depends(get_database),
    current_user=Depends(require_brand_owner),
):
    """Brand Owner creates a Store Manager for one of their stores."""
    from datetime import datetime

    from app.core.security import get_password_hash

    brand_id = current_user.get("brand_id")
    tenant_id = current_user.get("tenant_id", "")
    brand_name = current_user.get("brand_name", "")

    # Verify the store belongs to this brand
    store = await db["stores"].find_one(
        {"store_id": payload.store_id, "brand_id": brand_id}
    )
    if not store:
        raise HTTPException(
            status_code=404, detail="Store not found or does not belong to your brand"
        )

    # Check duplicate email
    existing = await db["users"].find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    await db["users"].insert_one(
        {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "brand_id": brand_id,
            "store_id": payload.store_id,
            "username": payload.email.split("@")[0],
            "email": payload.email,
            "password_hash": get_password_hash(payload.password),
            "full_name": payload.full_name,
            "role": "Store Manager",
            "brand_name": brand_name,
            "store_name": payload.store_name,
            "phone": payload.phone or "",
            "status": "active",
            "last_login": None,
            "created_at": datetime.utcnow(),
        }
    )

    # Trigger welcome email
    try:
        from app.core.email import send_email
        from app.core.templates import get_welcome_email
        welcome_html = get_welcome_email(payload.full_name, payload.email, "Store Manager")
        await send_email("welcome_after_account_creation", payload.email, "Welcome to Cuben Retailer", welcome_html)
    except Exception:
        pass

    return {
        "success": True,
        "message": f"Store Manager '{payload.full_name}' created successfully",
        "user_id": user_id,
        "store_id": payload.store_id,
        "store_name": payload.store_name,
        "login_credentials": {
            "email": payload.email,
            "password": payload.password,
            "role": "Store Manager",
            "login_url": "/login",
        },
    }


# ─── POST /brand-owner/create-user ──────────────────────────────────────────
class CreateUserRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str  # "Brand Admin" | "Regional Manager" | "Store Manager" | "Cashier" | "Sales Executive"
    store_id: Optional[str] = None
    store_name: Optional[str] = None
    phone: Optional[str] = None


@router.post("/create-user", status_code=201)
async def create_brand_user(
    payload: CreateUserRequest,
    db=Depends(get_database),
    current_user=Depends(require_brand_owner),
):
    """Brand Owner/Admin creates any sub-role user."""
    from app.core.security import get_password_hash

    ALLOWED_ROLES = {
        "Brand Admin",
        "Regional Manager",
        "Store Manager",
        "Cashier",
        "Sales Executive",
    }
    if payload.role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400, detail=f"Invalid role. Allowed: {ALLOWED_ROLES}"
        )

    brand_id = current_user.get("brand_id")
    tenant_id = current_user.get("tenant_id", "")
    brand_name = current_user.get("brand_name", "")

    # Store-level roles need a store_id
    if payload.role in ("Store Manager", "Cashier", "Sales Executive"):
        if not payload.store_id:
            raise HTTPException(
                status_code=400, detail="store_id required for store-level roles"
            )
        store = await db["stores"].find_one(
            {"store_id": payload.store_id, "brand_id": brand_id}
        )
        if not store:
            raise HTTPException(
                status_code=404, detail="Store not found or not in your brand"
            )

    existing = await db["users"].find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    await db["users"].insert_one(
        {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "brand_id": brand_id,
            "store_id": payload.store_id,
            "username": payload.email.split("@")[0],
            "email": payload.email,
            "password_hash": get_password_hash(payload.password),
            "full_name": payload.full_name,
            "role": payload.role,
            "brand_name": brand_name,
            "store_name": payload.store_name or "",
            "phone": payload.phone or "",
            "status": "active",
            "last_login": None,
            "created_at": datetime.utcnow(),
        }
    )

    # Trigger welcome email
    try:
        from app.core.email import send_email
        from app.core.templates import get_welcome_email
        welcome_html = get_welcome_email(payload.full_name, payload.email, payload.role)
        await send_email("welcome_after_account_creation", payload.email, "Welcome to Cuben Retailer", welcome_html)
    except Exception:
        pass

    return {
        "success": True,
        "user_id": user_id,
        "role": payload.role,
        "email": payload.email,
        "login_credentials": {
            "email": payload.email,
            "password": payload.password,
            "role": payload.role,
        },
    }


# ─── GET /brand-owner/users ───────────────────────────────────────────────────────
@router.get("/users")
async def list_brand_users(
    db=Depends(get_database),
    current_user=Depends(require_brand_owner),
):
    """List all users under this brand."""
    brand_id = current_user.get("brand_id")
    users = (
        await db["users"]
        .find(
            {"brand_id": brand_id, "role": {"$ne": "Super Admin"}},
            {"_id": 0, "password_hash": 0},
        )
        .to_list(500)
    )

    result = []
    for u in users:
        u["created_at"] = u["created_at"].isoformat() if u.get("created_at") else None
        u["last_login"] = u["last_login"].isoformat() if u.get("last_login") else None
        result.append(u)

    return {"users": result, "total": len(result)}


# ─── GET /brand-owner/store-managers ───────────────────────────────────────
@router.get("/store-managers")
async def list_store_managers(
    db=Depends(get_database),
    current_user=Depends(require_brand_owner),
):
    """Brand Owner lists all Store Managers for their brand."""
    brand_id = current_user.get("brand_id")
    managers = (
        await db["users"]
        .find(
            {"brand_id": brand_id, "role": "Store Manager"},
            {"_id": 0, "password_hash": 0},
        )
        .to_list(100)
    )

    result = []
    for m in managers:
        m["created_at"] = str(m.get("created_at", ""))
        m["last_login"] = str(m.get("last_login", "")) if m.get("last_login") else None
        result.append(m)

    return {"store_managers": result, "total": len(result)}


# ─── KYC, COMMISSION & PAYOUT ENDPOINTS ──────────────────────────────────────
@router.post("/kyc/submit")
async def submit_kyc(
    db=Depends(get_database),
    current_user=Depends(require_brand_owner),
):
    brand_id = current_user.get("brand_id")
    await db["brands"].update_one(
        {"brand_id": brand_id},
        {"$set": {"kyc_status": "submitted", "kyc_submitted_at": datetime.utcnow()}}
    )

    # Send KYC Submitted Email
    try:
        from app.core.email import send_email
        from app.core.templates import get_kyc_submitted_email
        kyc_html = get_kyc_submitted_email(current_user.get("brand_name", "your brand"))
        await send_email("kyc_submitted", current_user["email"], "KYC Documents Uploaded Successfully", kyc_html)
    except Exception:
        pass

    return {"success": True, "message": "KYC submitted successfully"}


@router.post("/commission/credit")
async def credit_commission(
    payload: dict,
    db=Depends(get_database),
    current_user=Depends(require_brand_owner),
):
    amount = float(payload.get("amount", 0))
    period = payload.get("period", "this month")

    # Log to a custom commission collection
    await db["commission_logs"].insert_one({
        "brand_id": current_user.get("brand_id"),
        "amount": amount,
        "period": period,
        "created_at": datetime.utcnow()
    })

    # Trigger Commission Credited Email
    try:
        from app.core.email import send_email
        from app.core.templates import get_commission_credited_email
        comm_html = get_commission_credited_email(amount, period)
        await send_email("commission_credited", current_user["email"], "Partner Commission Account Credit", comm_html)
    except Exception:
        pass

    return {"success": True, "amount": amount, "period": period}


@router.post("/payout/process")
async def process_payout(
    payload: dict,
    db=Depends(get_database),
    current_user=Depends(require_brand_owner),
):
    amount = float(payload.get("amount", 0))
    bank_account = payload.get("bank_account", "Primary bank account")

    # Log to a custom payout collection
    await db["payout_logs"].insert_one({
        "brand_id": current_user.get("brand_id"),
        "amount": amount,
        "bank_account": bank_account,
        "created_at": datetime.utcnow()
    })

    # Trigger Payout Processed Email
    try:
        from app.core.email import send_email
        from app.core.templates import get_payout_processed_email
        payout_html = get_payout_processed_email(amount, bank_account)
        await send_email("payout_processed", current_user["email"], "Payout Processed Successfully", payout_html)
    except Exception:
        pass

    return {"success": True, "amount": amount, "bank_account": bank_account}

