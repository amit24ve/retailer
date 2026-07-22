import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.db.database import get_database

router = APIRouter()


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def parse_expiry_date(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid expiry date")


def parse_float(value, default=0.0):
    if value in (None, ""):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid numeric value")


def parse_int(value, default=0):
    if value in (None, ""):
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid numeric value")


@router.get("")
async def list_coupons(
    db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    cursor = db["coupons"].find({"brand_id": brand_id}).sort("created_at", -1)
    coupons = [clean(doc) async for doc in cursor]
    return {"coupons": coupons}


@router.post("", status_code=201)
async def create_coupon(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    code = (body.get("code") or "").strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Coupon code is required")
    existing = await db["coupons"].find_one({"brand_id": brand_id, "code": code})
    if existing:
        raise HTTPException(status_code=409, detail="Coupon code already exists")

    coupon = {
        "coupon_id": str(uuid.uuid4()),
        "brand_id": brand_id,
        "code": code,
        "discount_type": body.get("discount_type", "flat"),
        "discount_value": parse_float(body.get("discount_value")),
        "max_discount_cap": parse_float(body.get("max_discount_cap"), None),
        "min_cart_value": parse_float(body.get("min_cart_value")),
        "usage_limit_global": parse_int(body.get("usage_limit_global")),
        "usage_limit_per_customer": parse_int(body.get("usage_limit_per_customer"), 1),
        "current_use_count": 0,
        "is_active": True,
        "expiry_date": parse_expiry_date(body.get("expiry_date")),
        "created_at": datetime.utcnow(),
    }
    await db["coupons"].insert_one(coupon)
    return clean(coupon)


@router.put("/{coupon_id}")
async def update_coupon(
    coupon_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    existing = await db["coupons"].find_one({"coupon_id": coupon_id, "brand_id": brand_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Coupon not found")

    update = {}
    if "code" in body:
        code = (body.get("code") or "").strip().upper()
        if not code:
            raise HTTPException(status_code=400, detail="Coupon code is required")
        duplicate = await db["coupons"].find_one(
            {"brand_id": brand_id, "code": code, "coupon_id": {"$ne": coupon_id}}
        )
        if duplicate:
            raise HTTPException(status_code=409, detail="Coupon code already exists")
        update["code"] = code
    if "discount_type" in body:
        update["discount_type"] = body.get("discount_type") or "flat"
    if "discount_value" in body:
        update["discount_value"] = parse_float(body.get("discount_value"))
    if "min_cart_value" in body:
        update["min_cart_value"] = parse_float(body.get("min_cart_value"))
    if "max_discount_cap" in body:
        update["max_discount_cap"] = parse_float(body.get("max_discount_cap"), None)
    if "usage_limit_global" in body:
        update["usage_limit_global"] = parse_int(body.get("usage_limit_global"))
    if "usage_limit_per_customer" in body:
        update["usage_limit_per_customer"] = parse_int(
            body.get("usage_limit_per_customer"), 1
        )
    if "expiry_date" in body:
        update["expiry_date"] = parse_expiry_date(body.get("expiry_date"))
    if "is_active" in body:
        update["is_active"] = bool(body.get("is_active"))

    update["updated_at"] = datetime.utcnow()
    await db["coupons"].update_one({"coupon_id": coupon_id, "brand_id": brand_id}, {"$set": update})
    updated = await db["coupons"].find_one({"coupon_id": coupon_id, "brand_id": brand_id})
    return clean(updated)


@router.post("/validate")
async def validate_coupon(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    code = body.get("coupon_code", "").upper()
    cart_total = float(body.get("cart_total", 0))
    customer_id = body.get("customer_id")

    coupon = await db["coupons"].find_one({"brand_id": brand_id, "code": code})

    if not coupon:
        return {
            "is_valid": False,
            "error_code": "COUPON_NOT_FOUND",
            "validation_message": f"Coupon '{code}' does not exist.",
        }

    # Expiry check
    if coupon.get("expiry_date") and datetime.utcnow() > coupon["expiry_date"]:
        return {
            "is_valid": False,
            "error_code": "COUPON_EXPIRED",
            "validation_message": f"Coupon {code} has expired.",
            "current_cart_total": cart_total,
        }

    # Active check
    if not coupon.get("is_active", True):
        return {
            "is_valid": False,
            "error_code": "COUPON_INACTIVE",
            "validation_message": f"Coupon {code} is currently inactive.",
        }

    # Global usage limit
    limit = coupon.get("usage_limit_global", 0)
    if limit > 0 and coupon.get("current_use_count", 0) >= limit:
        return {
            "is_valid": False,
            "error_code": "USAGE_LIMIT_EXCEEDED",
            "validation_message": f"Coupon {code} has reached its usage limit.",
        }

    # Minimum cart value
    min_cart = float(coupon.get("min_cart_value", 0))
    if cart_total < min_cart:
        return {
            "is_valid": False,
            "error_code": "MIN_CART_VALUE_UNMET",
            "current_cart_total": cart_total,
            "required_min_value": min_cart,
            "validation_message": f"Coupon {code} requires a minimum purchase of ₹{min_cart:,.0f} to apply.",
        }

    # Calculate discount
    dtype = coupon.get("discount_type")
    dvalue = float(coupon.get("discount_value", 0))
    discount_applied = 0.0

    if dtype == "flat":
        discount_applied = min(dvalue, cart_total)
    elif dtype == "percentage":
        discount_applied = round(cart_total * dvalue / 100, 2)
        if coupon.get("max_discount_cap"):
            discount_applied = min(discount_applied, float(coupon["max_discount_cap"]))
    elif dtype == "cashback":
        discount_applied = round(cart_total * dvalue / 100, 2)
    elif dtype in ("free_delivery", "free_product"):
        discount_applied = dvalue

    new_cart_total = round(max(0, cart_total - discount_applied), 2)

    return {
        "is_valid": True,
        "coupon_code": code,
        "discount_type": dtype,
        "discount_applied": discount_applied,
        "new_cart_total": new_cart_total,
        "validation_message": f"Voucher successfully validated. Applied {dtype.replace('_', ' ').title()} ₹{discount_applied:,.0f} Discount.",
    }
