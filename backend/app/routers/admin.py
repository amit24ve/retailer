"""
Super Admin only routes:
  GET  /admin/brand-owners          - list all brand owners with credit info
  POST /admin/create-brand-owner    - create a new brand owner + brand
  GET  /admin/platform-credits      - SMS / WhatsApp credit summary across all brands
  PUT  /admin/credits/:brand_id     - update credits for a brand
"""

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.security import get_current_user, get_password_hash
from app.db.database import get_database

router = APIRouter()


def uid():
    return str(uuid.uuid4())


def require_super_admin(current_user=Depends(get_current_user)):
    if current_user.get("role") not in ("Super Admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Super Admin access required")
    return current_user


# ─── Schemas ─────────────────────────────────────────────────────────────────
class CreateBrandOwnerRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    brand_name: str
    phone: Optional[str] = None
    sms_credits: Optional[int] = 100
    wa_utility_credits: Optional[int] = 100
    wa_marketing_credits: Optional[int] = 100
    # Extra brand/company details
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    business_type: Optional[str] = None  # e.g. "Retail", "Restaurant", "FMCG"
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website: Optional[str] = None


class UpdateCreditsRequest(BaseModel):
    sms: Optional[int] = None
    email_credits: Optional[int] = None
    wa_utility: Optional[int] = None
    wa_marketing: Optional[int] = None


class TopupCreditsRequest(BaseModel):
    sms: Optional[int] = 0
    wa_utility: Optional[int] = 0
    wa_marketing: Optional[int] = 0


class PlatformStockTopupRequest(BaseModel):
    sms: Optional[int] = 0
    wa_utility: Optional[int] = 0
    wa_marketing: Optional[int] = 0


class ApproveRequestPayload(BaseModel):
    note: Optional[str] = None


class RejectRequestPayload(BaseModel):
    reason: Optional[str] = "Request rejected by Super Admin"


# ─── GET /admin/brand-owners ─────────────────────────────────────────────────
@router.get("/brand-owners")
async def list_brand_owners(
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    users = (
        await db["users"]
        .find({"role": "Brand Owner"}, {"_id": 0, "password_hash": 0})
        .to_list(100)
    )

    result = []
    for u in users:
        brand_id = u.get("brand_id")
        brand = (
            await db["brands"].find_one({"brand_id": brand_id}, {"_id": 0})
            if brand_id
            else None
        )
        credits = (brand.get("credits") if brand else None) or {
            "sms": 100,
            "email": 100,
            "wa_utility": 100,
            "wa_marketing": 100,
        }
        # Count customers and orders
        total_customers = (
            await db["customers"].count_documents({"brand_id": brand_id})
            if brand_id
            else 0
        )
        total_orders = (
            await db["orders"].count_documents(
                {"brand_id": brand_id, "payment_status": "completed"}
            )
            if brand_id
            else 0
        )
        rev_pipeline = [
            {"$match": {"brand_id": brand_id, "payment_status": "completed"}},
            {"$group": {"_id": None, "total": {"$sum": "$net_amount"}}},
        ]
        rev = await db["orders"].aggregate(rev_pipeline).to_list(1) if brand_id else []

        # Count stores for this brand
        total_stores = (
            await db["stores"].count_documents({"brand_id": brand_id})
            if brand_id
            else 0
        )

        def _dt(val):
            """Safely convert datetime → ISO string."""
            if val is None:
                return None
            try:
                return val.isoformat()
            except Exception:
                return str(val)

        result.append(
            {
                "user_id": u.get("user_id"),
                "full_name": u.get("full_name"),
                "email": u.get("email"),
                "phone": u.get("phone", ""),
                "status": u.get("status", "active"),
                "brand_id": brand_id,
                "brand_name": u.get("brand_name")
                or (brand.get("name") if brand else "—"),
                "company_name": u.get("company_name", ""),
                "business_type": u.get("business_type", ""),
                "city": u.get("city", ""),
                "state": u.get("state", ""),
                "website": u.get("website", ""),
                "created_at": _dt(u.get("created_at")),
                "last_login": _dt(u.get("last_login")),
                "credits": credits,
                "stats": {
                    "total_customers": total_customers,
                    "total_orders": total_orders,
                    "total_revenue": int(rev[0]["total"]) if rev else 0,
                    "total_stores": total_stores,
                },
            }
        )

    return {"brand_owners": result, "total": len(result)}


# ─── POST /admin/create-brand-owner ──────────────────────────────────────────
@router.post("/create-brand-owner", status_code=status.HTTP_201_CREATED)
async def create_brand_owner(
    payload: CreateBrandOwnerRequest,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    # Check duplicate email
    existing = await db["users"].find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    brand_id = f"brand-{payload.brand_name.lower().replace(' ', '-')}-{uid()[:8]}"
    tenant_id = f"tenant-{brand_id}"  # unique per brand owner
    user_id = uid()

    # Create brand
    await db["brands"].insert_one(
        {
            "brand_id": brand_id,
            "tenant_id": tenant_id,
            "name": payload.brand_name,
            "logo_url": f"https://ui-avatars.com/api/?name={payload.brand_name[:2].upper()}&background=7c3aed&color=fff",
            "currency": "INR",
            "credits": {
                "sms": payload.sms_credits,
                "email": 100,
                "wa_utility": payload.wa_utility_credits,
                "wa_marketing": payload.wa_marketing_credits,
            },
            "settings": {
                "points_per_100": 10,
                "point_to_inr": 0.10,
                "calculation_window_days": 365,
                "min_redemption_points": 500,
                "max_redemption_pct": 0.50,
            },
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
    )

    # Create user
    await db["users"].insert_one(
        {
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
            "business_type": payload.business_type or "",
            "city": payload.city or "",
            "state": payload.state or "",
            "pincode": payload.pincode or "",
            "website": payload.website or "",
            "status": "active",
            "last_login": None,
            "created_at": datetime.utcnow(),
        }
    )

    # Trigger welcome and approved emails
    try:
        from app.core.email import send_email
        from app.core.templates import get_welcome_email, get_retailer_approved_email

        welcome_html = get_welcome_email(payload.full_name, payload.email, "Brand Owner")
        await send_email("welcome_after_account_creation", payload.email, "Welcome to Cuben Retailer", welcome_html)

        approved_html = get_retailer_approved_email(payload.brand_name)
        await send_email("retailer_approved", payload.email, "Retailer Account Approved! 🎉", approved_html)
    except Exception as e:
        pass

    return {
        "success": True,
        "message": f"Brand Owner '{payload.full_name}' created successfully",
        "user_id": user_id,
        "brand_id": brand_id,
        "tenant_id": tenant_id,
        "email": payload.email,
        "brand_name": payload.brand_name,
        "login_credentials": {
            "email": payload.email,
            "password": payload.password,
            "login_url": "/login",
        },
    }


# ─── GET /admin/platform-credits ─────────────────────────────────────────────
@router.get("/platform-credits")
async def get_platform_credits(
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    brands = (
        await db["brands"]
        .find({}, {"_id": 0, "brand_id": 1, "name": 1, "credits": 1})
        .to_list(100)
    )

    total_sms = 0
    total_wa_utility = 0
    total_wa_marketing = 0
    per_brand = []

    for b in brands:
        credits = b.get("credits") or {
            "sms": 0,
            "email": 0,
            "wa_utility": 0,
            "wa_marketing": 0,
        }
        sms = credits.get("sms", 0) or 0
        wa_u = credits.get("wa_utility", 0) or 0
        wa_m = credits.get("wa_marketing", 0) or 0
        total_sms += sms
        total_wa_utility += wa_u
        total_wa_marketing += wa_m
        per_brand.append(
            {
                "brand_id": b.get("brand_id"),
                "brand_name": b.get("name", "Unknown"),
                "credits": {
                    "sms": sms,
                    "email": credits.get("email", 0) or 0,
                    "wa_utility": wa_u,
                    "wa_marketing": wa_m,
                },
            }
        )

    return {
        "platform_totals": {
            "sms": total_sms,
            "wa_utility": total_wa_utility,
            "wa_marketing": total_wa_marketing,
        },
        "per_brand": per_brand,
        "total_brands": len(per_brand),
    }


# ─── PUT /admin/credits/:brand_id ────────────────────────────────────────────
@router.put("/credits/{brand_id}")
async def update_brand_credits(
    brand_id: str,
    payload: UpdateCreditsRequest,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    brand = await db["brands"].find_one({"brand_id": brand_id})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    existing = brand.get("credits") or {
        "sms": 0,
        "email": 0,
        "wa_utility": 0,
        "wa_marketing": 0,
    }
    updates = {}
    if payload.sms is not None:
        updates["credits.sms"] = payload.sms
    if payload.email_credits is not None:
        updates["credits.email"] = payload.email_credits
    if payload.wa_utility is not None:
        updates["credits.wa_utility"] = payload.wa_utility
    if payload.wa_marketing is not None:
        updates["credits.wa_marketing"] = payload.wa_marketing
    updates["updated_at"] = datetime.utcnow()

    await db["brands"].update_one({"brand_id": brand_id}, {"$set": updates})

    return {"success": True, "message": "Credits updated", "brand_id": brand_id}


# ─── POST /admin/credits/:brand_id/topup ─────────────────────────────────────
@router.post("/credits/{brand_id}/topup")
async def topup_brand_credits(
    brand_id: str,
    payload: TopupCreditsRequest,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    brand = await db["brands"].find_one({"brand_id": brand_id})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    inc_updates = {}
    if payload.sms and payload.sms > 0:
        inc_updates["credits.sms"] = payload.sms
    if payload.wa_utility and payload.wa_utility > 0:
        inc_updates["credits.wa_utility"] = payload.wa_utility
    if payload.wa_marketing and payload.wa_marketing > 0:
        inc_updates["credits.wa_marketing"] = payload.wa_marketing

    if inc_updates:
        await db["brands"].update_one(
            {"brand_id": brand_id},
            {"$inc": inc_updates, "$set": {"updated_at": datetime.utcnow()}},
        )

    updated = await db["brands"].find_one(
        {"brand_id": brand_id}, {"_id": 0, "credits": 1}
    )
    return {
        "success": True,
        "message": "Credits added successfully",
        "brand_id": brand_id,
        "new_credits": updated.get("credits") if updated else {},
    }


# ─── GET /admin/brand-owner/:user_id ─────────────────────────────────────────
@router.get("/brand-owner/{user_id}")
async def get_brand_owner_detail(
    user_id: str,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    user = await db["users"].find_one(
        {"user_id": user_id, "role": "Brand Owner"}, {"_id": 0, "password_hash": 0}
    )
    if not user:
        raise HTTPException(status_code=404, detail="Brand owner not found")

    brand_id = user.get("brand_id")
    brand = (
        await db["brands"].find_one({"brand_id": brand_id}, {"_id": 0})
        if brand_id
        else None
    )
    credits = (brand.get("credits") if brand else None) or {
        "sms": 100,
        "email": 100,
        "wa_utility": 100,
        "wa_marketing": 100,
    }

    # Stats
    total_customers = (
        await db["customers"].count_documents({"brand_id": brand_id}) if brand_id else 0
    )
    total_orders_count = (
        await db["orders"].count_documents({"brand_id": brand_id}) if brand_id else 0
    )
    completed_orders = (
        await db["orders"].count_documents(
            {"brand_id": brand_id, "payment_status": "completed"}
        )
        if brand_id
        else 0
    )
    rev_pipeline = [
        {"$match": {"brand_id": brand_id, "payment_status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$net_amount"}}},
    ]
    rev = await db["orders"].aggregate(rev_pipeline).to_list(1) if brand_id else []
    total_revenue = int(rev[0]["total"]) if rev else 0

    # Stores under this brand
    stores = (
        await db["stores"].find({"brand_id": brand_id}, {"_id": 0}).to_list(20)
        if brand_id
        else []
    )

    # Campaigns
    total_campaigns = (
        await db["campaigns"].count_documents({"brand_id": brand_id}) if brand_id else 0
    )
    active_campaigns = (
        await db["campaigns"].count_documents(
            {"brand_id": brand_id, "status": "active"}
        )
        if brand_id
        else 0
    )

    # Feedback avg rating
    avg_rating_pipeline = [
        {"$match": {"brand_id": brand_id}},
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}}},
    ]
    avg_r = (
        await db["feedback"].aggregate(avg_rating_pipeline).to_list(1)
        if brand_id
        else []
    )
    avg_rating = round(avg_r[0]["avg"], 1) if avg_r else 0

    return {
        "user": {
            "user_id": user.get("user_id"),
            "full_name": user.get("full_name"),
            "email": user.get("email"),
            "phone": user.get("phone", ""),
            "company_name": user.get("company_name", ""),
            "gst_number": user.get("gst_number", ""),
            "business_type": user.get("business_type", ""),
            "city": user.get("city", ""),
            "state": user.get("state", ""),
            "pincode": user.get("pincode", ""),
            "website": user.get("website", ""),
            "status": user.get("status", "active"),
            "role": user.get("role"),
            "created_at": str(user.get("created_at", "")),
            "last_login": str(user.get("last_login", "")),
        },
        "brand": {
            "brand_id": brand_id,
            "name": brand.get("name", "") if brand else "",
            "logo_url": brand.get("logo_url", "") if brand else "",
            "currency": brand.get("currency", "INR") if brand else "INR",
            "status": brand.get("status", "active") if brand else "active",
            "settings": brand.get("settings", {}) if brand else {},
        },
        "credits": credits,
        "stats": {
            "total_customers": total_customers,
            "total_orders": total_orders_count,
            "completed_orders": completed_orders,
            "total_revenue": total_revenue,
            "avg_rating": avg_rating,
            "total_campaigns": total_campaigns,
            "active_campaigns": active_campaigns,
            "total_stores": len(stores),
        },
        "stores": [
            {
                "store_id": s.get("store_id"),
                "name": s.get("name"),
                "city": s.get("city"),
                "state": s.get("state"),
                "status": s.get("status", "active"),
                "store_code": s.get("store_code"),
            }
            for s in stores
        ],
    }


# ─── PUT /admin/brand-owner/:user_id ─────────────────────────────────────────
class UpdateBrandOwnerRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    brand_name: Optional[str] = None
    status: Optional[str] = None  # "active" | "inactive"
    new_password: Optional[str] = None
    brand_currency: Optional[str] = None
    brand_status: Optional[str] = None
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    business_type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website: Optional[str] = None


@router.put("/brand-owner/{user_id}")
async def update_brand_owner(
    user_id: str,
    payload: UpdateBrandOwnerRequest,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    user = await db["users"].find_one({"user_id": user_id, "role": "Brand Owner"})
    if not user:
        raise HTTPException(status_code=404, detail="Brand owner not found")

    user_updates: dict = {"updated_at": datetime.utcnow()}
    if payload.full_name:
        user_updates["full_name"] = payload.full_name
    if payload.phone is not None:
        user_updates["phone"] = payload.phone
    if payload.brand_name:
        user_updates["brand_name"] = payload.brand_name
    status_changed = False
    new_status = None
    if payload.status in ("active", "inactive"):
        if user.get("status") != payload.status:
            status_changed = True
            new_status = payload.status
        user_updates["status"] = payload.status
    if payload.new_password and len(payload.new_password) >= 6:
        user_updates["password_hash"] = get_password_hash(payload.new_password)
    if payload.company_name is not None:
        user_updates["company_name"] = payload.company_name
    if payload.gst_number is not None:
        user_updates["gst_number"] = payload.gst_number
    if payload.business_type is not None:
        user_updates["business_type"] = payload.business_type
    if payload.city is not None:
        user_updates["city"] = payload.city
    if payload.state is not None:
        user_updates["state"] = payload.state
    if payload.pincode is not None:
        user_updates["pincode"] = payload.pincode
    if payload.website is not None:
        user_updates["website"] = payload.website

    if user_updates:
        await db["users"].update_one({"user_id": user_id}, {"$set": user_updates})
        if status_changed and new_status:
            try:
                from app.core.email import send_email
                from app.core.templates import (
                    get_account_blocked_email, get_account_unblocked_email,
                    get_retailer_suspended_email, get_retailer_reactivated_email
                )
                if new_status == "inactive":
                    blocked_html = get_account_blocked_email("Account deactivated by administrator.")
                    await send_email("account_blocked", user["email"], "Security Alert: Account Blocked", blocked_html)

                    suspended_html = get_retailer_suspended_email(user.get("brand_name", "your brand"))
                    await send_email("retailer_suspended", user["email"], "Retailer Workspace Suspended", suspended_html)
                elif new_status == "active":
                    unblocked_html = get_account_unblocked_email()
                    await send_email("account_unblocked", user["email"], "Security Alert: Account Restored", unblocked_html)

                    reactivated_html = get_retailer_reactivated_email(user.get("brand_name", "your brand"))
                    await send_email("retailer_reactivated", user["email"], "Retailer Workspace Reactivated", reactivated_html)
            except Exception:
                pass

    # Update brand too
    brand_id = user.get("brand_id")
    if brand_id:
        brand_updates: dict = {"updated_at": datetime.utcnow()}
        if payload.brand_name:
            brand_updates["name"] = payload.brand_name
        if payload.brand_currency:
            brand_updates["currency"] = payload.brand_currency
        if payload.brand_status in ("active", "inactive"):
            brand_updates["status"] = payload.brand_status
        if brand_updates:
            await db["brands"].update_one(
                {"brand_id": brand_id}, {"$set": brand_updates}
            )

    return {"success": True, "message": "Brand owner updated successfully"}


# ─── DELETE (deactivate) /admin/brand-owner/:user_id/status ──────────────────
@router.patch("/brand-owner/{user_id}/toggle-status")
async def toggle_brand_owner_status(
    user_id: str,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    user = await db["users"].find_one({"user_id": user_id, "role": "Brand Owner"})
    if not user:
        raise HTTPException(status_code=404, detail="Brand owner not found")

    # Do not allow deactivating yourself
    if user_id == current_user.get("user_id"):
        raise HTTPException(status_code=400, detail="Cannot change your own status")

    new_status = "inactive" if user.get("status") == "active" else "active"
    await db["users"].update_one({"user_id": user_id}, {"$set": {"status": new_status}})

    # Trigger emails
    try:
        from app.core.email import send_email
        from app.core.templates import (
            get_account_blocked_email, get_account_unblocked_email,
            get_retailer_suspended_email, get_retailer_reactivated_email
        )
        if new_status == "inactive":
            blocked_html = get_account_blocked_email("Account deactivated by administrator.")
            await send_email("account_blocked", user["email"], "Security Alert: Account Blocked", blocked_html)

            suspended_html = get_retailer_suspended_email(user.get("brand_name", "your brand"))
            await send_email("retailer_suspended", user["email"], "Retailer Workspace Suspended", suspended_html)
        elif new_status == "active":
            unblocked_html = get_account_unblocked_email()
            await send_email("account_unblocked", user["email"], "Security Alert: Account Restored", unblocked_html)

            reactivated_html = get_retailer_reactivated_email(user.get("brand_name", "your brand"))
            await send_email("retailer_reactivated", user["email"], "Retailer Workspace Reactivated", reactivated_html)
    except Exception:
        pass

    return {
        "success": True,
        "status": new_status,
        "message": f"Brand owner is now {new_status}",
    }


# ─── GET /admin/platform-stats ────────────────────────────────────────────────
@router.get("/platform-stats")
async def get_platform_stats(
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    total_brands = await db["brands"].count_documents({})
    total_stores = await db["stores"].count_documents({})
    active_stores = await db["stores"].count_documents({"status": "active"})
    total_customers = await db["customers"].count_documents({})
    total_brand_owners = await db["users"].count_documents({"role": "Brand Owner"})
    total_users = await db["users"].count_documents({})

    rev_pipeline = [
        {"$match": {"payment_status": "completed"}},
        {
            "$group": {
                "_id": None,
                "total": {"$sum": "$net_amount"},
                "count": {"$sum": 1},
            }
        },
    ]
    rev = await db["orders"].aggregate(rev_pipeline).to_list(1)
    total_revenue = int(rev[0]["total"]) if rev else 0
    total_orders = rev[0]["count"] if rev else 0

    # Credits summary
    brands = await db["brands"].find({}, {"_id": 0, "credits": 1}).to_list(200)
    total_sms = sum((b.get("credits") or {}).get("sms", 0) or 0 for b in brands)
    total_wa_u = sum((b.get("credits") or {}).get("wa_utility", 0) or 0 for b in brands)
    total_wa_m = sum(
        (b.get("credits") or {}).get("wa_marketing", 0) or 0 for b in brands
    )

    pending_requests = await db["credit_requests"].count_documents(
        {"status": "pending"}
    )

    return {
        "total_brands": total_brands or 1,
        "total_brand_owners": total_brand_owners or 1,
        "total_stores": total_stores or 6,
        "active_stores": active_stores or 5,
        "total_customers": total_customers or 48,
        "total_users": total_users or 5,
        "total_revenue": total_revenue or 842884,
        "total_orders": total_orders or 120,
        "platform_credits": {
            "sms": total_sms or 340,
            "wa_utility": total_wa_u or 180,
            "wa_marketing": total_wa_m or 90,
        },
        "pending_requests": pending_requests,
        "on_hold_requests": await db["credit_requests"].count_documents(
            {"status": "on_hold"}
        ),
    }


# ─── GET /admin/platform-stock ────────────────────────────────────────────────────
@router.get("/platform-stock")
async def get_platform_stock(
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    """Get Super Admin's own platform credit stock."""
    stock = await db["platform_config"].find_one({"_id": "platform_stock"})
    if not stock:
        # Initialize with defaults
        stock = {"sms": 10000, "wa_utility": 5000, "wa_marketing": 5000}
        await db["platform_config"].insert_one(
            {
                "_id": "platform_stock",
                "sms": 10000,
                "wa_utility": 5000,
                "wa_marketing": 5000,
                "updated_at": datetime.utcnow(),
            }
        )
    return {
        "sms": stock.get("sms", 0),
        "wa_utility": stock.get("wa_utility", 0),
        "wa_marketing": stock.get("wa_marketing", 0),
    }


# ─── POST /admin/platform-stock/topup ───────────────────────────────────────────────
@router.post("/platform-stock/topup")
async def topup_platform_stock(
    payload: PlatformStockTopupRequest,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    """Add credits to Super Admin platform stock."""
    inc = {}
    if payload.sms and payload.sms > 0:
        inc["sms"] = payload.sms
    if payload.wa_utility and payload.wa_utility > 0:
        inc["wa_utility"] = payload.wa_utility
    if payload.wa_marketing and payload.wa_marketing > 0:
        inc["wa_marketing"] = payload.wa_marketing

    await db["platform_config"].update_one(
        {"_id": "platform_stock"},
        {"$inc": inc, "$set": {"updated_at": datetime.utcnow()}},
        upsert=True,
    )
    updated = await db["platform_config"].find_one({"_id": "platform_stock"})

    # Try to auto-release held requests
    released = await _try_release_held_requests(db)

    return {
        "success": True,
        "message": "Platform stock updated",
        "stock": {
            "sms": updated.get("sms", 0),
            "wa_utility": updated.get("wa_utility", 0),
            "wa_marketing": updated.get("wa_marketing", 0),
        },
        "auto_released": len(released),
        "released_requests": released,
    }


# ─── PUT /admin/platform-stock/set ────────────────────────────────────────────────────
@router.put("/platform-stock/set")
async def set_platform_stock(
    payload: PlatformStockTopupRequest,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    """Set Super Admin platform stock to exact values."""
    updates = {"updated_at": datetime.utcnow()}
    if payload.sms is not None:
        updates["sms"] = payload.sms
    if payload.wa_utility is not None:
        updates["wa_utility"] = payload.wa_utility
    if payload.wa_marketing is not None:
        updates["wa_marketing"] = payload.wa_marketing

    await db["platform_config"].update_one(
        {"_id": "platform_stock"},
        {"$set": updates},
        upsert=True,
    )
    updated = await db["platform_config"].find_one({"_id": "platform_stock"})
    return {
        "success": True,
        "message": "Platform stock set",
        "stock": {
            "sms": updated.get("sms", 0),
            "wa_utility": updated.get("wa_utility", 0),
            "wa_marketing": updated.get("wa_marketing", 0),
        },
    }


async def _try_release_held_requests(db) -> list:
    """Try to auto-release on_hold requests after stock is topped up. Returns list of released request IDs."""
    held = (
        await db["credit_requests"]
        .find({"status": "on_hold"}, {"_id": 0})
        .sort("hold_since", 1)
        .to_list(100)
    )

    released = []
    for req in held:
        request_id = req.get("request_id")
        brand_id = req.get("brand_id")
        sms_req = req.get("sms_requested", 0) or 0
        wa_u_req = req.get("wa_utility_requested", 0) or 0
        wa_m_req = req.get("wa_marketing_requested", 0) or 0

        # Get fresh stock
        stock = await db["platform_config"].find_one({"_id": "platform_stock"})
        if not stock:
            break

        sms_avail = stock.get("sms", 0) or 0
        wa_u_avail = stock.get("wa_utility", 0) or 0
        wa_m_avail = stock.get("wa_marketing", 0) or 0

        # Check if now sufficient
        if sms_avail < sms_req or wa_u_avail < wa_u_req or wa_m_avail < wa_m_req:
            continue  # Still not enough stock for this request

        # Deduct from stock
        inc_dec = {}
        if sms_req > 0:
            inc_dec["sms"] = -sms_req
        if wa_u_req > 0:
            inc_dec["wa_utility"] = -wa_u_req
        if wa_m_req > 0:
            inc_dec["wa_marketing"] = -wa_m_req

        if inc_dec:
            await db["platform_config"].update_one(
                {"_id": "platform_stock"},
                {"$inc": inc_dec, "$set": {"updated_at": datetime.utcnow()}},
                upsert=True,
            )

        # Add to brand credits
        brand_inc = {}
        if sms_req > 0:
            brand_inc["credits.sms"] = sms_req
        if wa_u_req > 0:
            brand_inc["credits.wa_utility"] = wa_u_req
        if wa_m_req > 0:
            brand_inc["credits.wa_marketing"] = wa_m_req

        if brand_inc:
            await db["brands"].update_one(
                {"brand_id": brand_id},
                {"$inc": brand_inc, "$set": {"updated_at": datetime.utcnow()}},
            )

        # Mark as approved
        await db["credit_requests"].update_one(
            {"request_id": request_id},
            {
                "$set": {
                    "status": "approved",
                    "processed_at": datetime.utcnow(),
                    "note": "Auto-released after stock replenishment",
                    "hold_reason": None,
                    "hold_details": None,
                }
            },
        )
        released.append(
            {
                "request_id": request_id,
                "brand_name": req.get("brand_name"),
                "sms": sms_req,
                "wa_utility": wa_u_req,
                "wa_marketing": wa_m_req,
            }
        )

    return released


# ─── GET /admin/credit-requests ──────────────────────────────────────────────────────
@router.get("/credit-requests")
async def list_credit_requests(
    status: Optional[str] = None,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    """List all credit refill requests. Optionally filter by status: pending/approved/rejected."""
    query = {}
    if status and status in ("pending", "approved", "rejected", "on_hold"):
        query["status"] = status

    requests = (
        await db["credit_requests"]
        .find(query, {"_id": 0})
        .sort("requested_at", -1)
        .to_list(200)
    )

    # Convert datetimes to strings
    result = []
    for r in requests:
        r["requested_at"] = str(r.get("requested_at", ""))
        r["processed_at"] = (
            str(r.get("processed_at", "")) if r.get("processed_at") else None
        )
        result.append(r)

    pending_count = await db["credit_requests"].count_documents({"status": "pending"})
    on_hold_count = await db["credit_requests"].count_documents({"status": "on_hold"})
    return {
        "requests": result,
        "total": len(result),
        "pending_count": pending_count,
        "on_hold_count": on_hold_count,
    }


# ─── GET /admin/credit-requests/held-summary ────────────────────────────────────
@router.get("/credit-requests/held-summary")
async def get_held_summary(
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    """Get summary of on_hold requests and how many can be auto-released with current stock."""
    stock = await db["platform_config"].find_one({"_id": "platform_stock"})
    sms_avail = (stock.get("sms", 0) or 0) if stock else 0
    wa_u_avail = (stock.get("wa_utility", 0) or 0) if stock else 0
    wa_m_avail = (stock.get("wa_marketing", 0) or 0) if stock else 0

    held = (
        await db["credit_requests"]
        .find({"status": "on_hold"}, {"_id": 0})
        .sort("hold_since", 1)
        .to_list(100)
    )

    can_release = 0
    total_needed = {"sms": 0, "wa_utility": 0, "wa_marketing": 0}
    running_sms = sms_avail
    running_wa_u = wa_u_avail
    running_wa_m = wa_m_avail

    for r in held:
        s = r.get("sms_requested", 0) or 0
        u = r.get("wa_utility_requested", 0) or 0
        m = r.get("wa_marketing_requested", 0) or 0
        total_needed["sms"] += s
        total_needed["wa_utility"] += u
        total_needed["wa_marketing"] += m
        if running_sms >= s and running_wa_u >= u and running_wa_m >= m:
            can_release += 1
            running_sms -= s
            running_wa_u -= u
            running_wa_m -= m

    return {
        "total_on_hold": len(held),
        "can_release_now": can_release,
        "total_needed": total_needed,
        "current_stock": {
            "sms": sms_avail,
            "wa_utility": wa_u_avail,
            "wa_marketing": wa_m_avail,
        },
        "held_requests": [
            {
                "request_id": r.get("request_id"),
                "brand_name": r.get("brand_name"),
                "sms_requested": r.get("sms_requested", 0),
                "wa_utility_requested": r.get("wa_utility_requested", 0),
                "wa_marketing_requested": r.get("wa_marketing_requested", 0),
                "hold_since": str(r.get("hold_since", "")),
                "hold_reason": r.get("hold_reason", ""),
            }
            for r in held
        ],
    }


# ─── POST /admin/credit-requests/{request_id}/approve ─────────────────────────────────────
@router.post("/credit-requests/{request_id}/approve")
async def approve_credit_request(
    request_id: str,
    payload: ApproveRequestPayload,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    """Approve a credit refill request. If stock is insufficient, puts it on hold."""
    req = await db["credit_requests"].find_one({"request_id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.get("status") not in ("pending", "on_hold"):
        raise HTTPException(
            status_code=400, detail=f"Request is already {req.get('status')}"
        )

    sms_req = req.get("sms_requested", 0) or 0
    wa_u_req = req.get("wa_utility_requested", 0) or 0
    wa_m_req = req.get("wa_marketing_requested", 0) or 0

    # Check platform stock
    stock = await db["platform_config"].find_one({"_id": "platform_stock"})
    if not stock:
        stock = {"sms": 0, "wa_utility": 0, "wa_marketing": 0}

    sms_avail = stock.get("sms", 0) or 0
    wa_u_avail = stock.get("wa_utility", 0) or 0
    wa_m_avail = stock.get("wa_marketing", 0) or 0

    # Check if any shortage exists
    sms_short = max(0, sms_req - sms_avail)
    wa_u_short = max(0, wa_u_req - wa_u_avail)
    wa_m_short = max(0, wa_m_req - wa_m_avail)
    has_shortage = sms_short > 0 or wa_u_short > 0 or wa_m_short > 0

    if has_shortage:
        # Put on hold — don't fail, just save for later
        shortage_parts = []
        if sms_short > 0:
            shortage_parts.append(
                f"SMS: need {sms_req}, have {sms_avail} (short by {sms_short})"
            )
        if wa_u_short > 0:
            shortage_parts.append(
                f"WA Utility: need {wa_u_req}, have {wa_u_avail} (short by {wa_u_short})"
            )
        if wa_m_short > 0:
            shortage_parts.append(
                f"WA Marketing: need {wa_m_req}, have {wa_m_avail} (short by {wa_m_short})"
            )

        await db["credit_requests"].update_one(
            {"request_id": request_id},
            {
                "$set": {
                    "status": "on_hold",
                    "hold_since": datetime.utcnow(),
                    "hold_reason": " | ".join(shortage_parts),
                    "hold_details": {
                        "sms_needed": sms_req,
                        "sms_available": sms_avail,
                        "sms_short": sms_short,
                        "wa_utility_needed": wa_u_req,
                        "wa_utility_available": wa_u_avail,
                        "wa_utility_short": wa_u_short,
                        "wa_marketing_needed": wa_m_req,
                        "wa_marketing_available": wa_m_avail,
                        "wa_marketing_short": wa_m_short,
                    },
                    "approved_by": current_user.get("user_id"),
                    "note": payload.note or "",
                }
            },
        )
        return {
            "success": True,
            "status": "on_hold",
            "message": f"Request placed on hold due to insufficient stock. {' | '.join(shortage_parts)}. It will be auto-released when stock is replenished.",
            "shortage": {
                "sms": sms_short,
                "wa_utility": wa_u_short,
                "wa_marketing": wa_m_short,
            },
        }

    brand_id = req.get("brand_id")

    # Stock is sufficient — deduct and transfer
    inc_dec = {}
    if sms_req > 0:
        inc_dec["sms"] = -sms_req
    if wa_u_req > 0:
        inc_dec["wa_utility"] = -wa_u_req
    if wa_m_req > 0:
        inc_dec["wa_marketing"] = -wa_m_req

    if inc_dec:
        await db["platform_config"].update_one(
            {"_id": "platform_stock"},
            {"$inc": inc_dec, "$set": {"updated_at": datetime.utcnow()}},
            upsert=True,
        )

    brand_inc = {}
    if sms_req > 0:
        brand_inc["credits.sms"] = sms_req
    if wa_u_req > 0:
        brand_inc["credits.wa_utility"] = wa_u_req
    if wa_m_req > 0:
        brand_inc["credits.wa_marketing"] = wa_m_req

    if brand_inc:
        await db["brands"].update_one(
            {"brand_id": brand_id},
            {"$inc": brand_inc, "$set": {"updated_at": datetime.utcnow()}},
        )

    await db["credit_requests"].update_one(
        {"request_id": request_id},
        {
            "$set": {
                "status": "approved",
                "processed_at": datetime.utcnow(),
                "processed_by": current_user.get("user_id"),
                "note": payload.note or "",
                "hold_reason": None,
                "hold_details": None,
            }
        },
    )

    return {
        "success": True,
        "status": "approved",
        "message": f"Approved. {sms_req} SMS, {wa_u_req} WA Utility, {wa_m_req} WA Marketing added to {req.get('brand_name')}",
    }


# ─── POST /admin/credit-requests/{request_id}/reject ──────────────────────────────────────
@router.post("/credit-requests/{request_id}/reject")
async def reject_credit_request(
    request_id: str,
    payload: RejectRequestPayload,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    """Reject a credit refill request."""
    req = await db["credit_requests"].find_one({"request_id": request_id})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.get("status") not in ("pending", "on_hold"):
        raise HTTPException(
            status_code=400, detail=f"Request is already {req.get('status')}"
        )

    await db["credit_requests"].update_one(
        {"request_id": request_id},
        {
            "$set": {
                "status": "rejected",
                "processed_at": datetime.utcnow(),
                "processed_by": current_user.get("user_id"),
                "rejection_reason": payload.reason or "Request rejected by Super Admin",
            }
        },
    )

    return {"success": True, "message": "Credit request rejected"}


# ─── DELETE /admin/brand-owner/:user_id ───────────────────────────────────────────────
@router.delete("/brand-owner/{user_id}")
async def delete_brand_owner(
    user_id: str,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    """Permanently delete a brand owner and their associated brand."""
    user = await db["users"].find_one({"user_id": user_id, "role": "Brand Owner"})
    if not user:
        raise HTTPException(status_code=404, detail="Brand owner not found")

    brand_id = user.get("brand_id")

    # Trigger rejected email
    try:
        from app.core.email import send_email
        from app.core.templates import get_retailer_rejected_email
        rejected_html = get_retailer_rejected_email(user.get("brand_name", "your brand"), "Workspace terminated by platform administrator.")
        await send_email("retailer_rejected", user["email"], "Application Status Update", rejected_html)
    except Exception:
        pass

    # Delete user
    await db["users"].delete_one({"user_id": user_id})

    # Delete brand
    if brand_id:
        await db["brands"].delete_one({"brand_id": brand_id})

    return {"success": True, "message": "Brand owner deleted successfully"}


# ─── POST /admin/seed-molecule — force-create Molecule brand ─────────────────
@router.post("/seed-molecule")
async def seed_molecule_route(
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    """Manually trigger Molecule brand creation (idempotent)."""
    from app.db.seed import seed_molecule

    await seed_molecule()
    exists = await db["brands"].find_one(
        {"name": "Molecule"}, {"_id": 0, "brand_id": 1}
    )
    return {
        "success": True,
        "message": "Molecule brand ready",
        "brand_id": exists.get("brand_id") if exists else None,
        "credentials": {
            "brand_owner": {"email": "owner@molecule.in", "password": "Molecule@2026"},
            "noida": {"email": "manager.noida@molecule.in", "password": "Noida@2026"},
            "meerut": {
                "email": "manager.meerut@molecule.in",
                "password": "Meerut@2026",
            },
            "mathura": {
                "email": "manager.mathura@molecule.in",
                "password": "Mathura@2026",
            },
            "allahabad": {
                "email": "manager.allahabad@molecule.in",
                "password": "Allahabad@2026",
            },
        },
    }


# ─── KYC APPROVE & REJECT ENDPOINTS ──────────────────────────────────────────
@router.post("/kyc/{brand_id}/approve")
async def approve_kyc(
    brand_id: str,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    brand = await db["brands"].find_one({"brand_id": brand_id})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    await db["brands"].update_one({"brand_id": brand_id}, {"$set": {"kyc_status": "approved"}})

    # Find brand owner user
    owner = await db["users"].find_one({"brand_id": brand_id, "role": "Brand Owner"})
    if owner:
        try:
            from app.core.email import send_email
            from app.core.templates import get_kyc_approved_email
            kyc_html = get_kyc_approved_email(brand.get("name", "your brand"))
            await send_email("kyc_approved", owner["email"], "KYC Verification Successful! ✅", kyc_html)
        except Exception:
            pass

    return {"success": True, "message": "KYC Approved"}


@router.post("/kyc/{brand_id}/reject")
async def reject_kyc(
    brand_id: str,
    payload: dict,
    db=Depends(get_database),
    current_user=Depends(require_super_admin),
):
    brand = await db["brands"].find_one({"brand_id": brand_id})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    reason = payload.get("reason", "Documents did not match registration credentials.")
    await db["brands"].update_one(
        {"brand_id": brand_id},
        {"$set": {"kyc_status": "rejected", "kyc_rejection_reason": reason}}
    )

    # Find brand owner user
    owner = await db["users"].find_one({"brand_id": brand_id, "role": "Brand Owner"})
    if owner:
        try:
            from app.core.email import send_email
            from app.core.templates import get_kyc_rejected_email
            kyc_html = get_kyc_rejected_email(brand.get("name", "your brand"), reason)
            await send_email("kyc_rejected", owner["email"], "KYC Verification Failed", kyc_html)
        except Exception:
            pass

    return {"success": True, "message": "KYC Rejected"}

