import uuid
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from app.core.security import get_current_user, get_data_scope
from app.core.sms import render_sms_template, send_to_customer_channels
from app.db.database import get_database
from app.routers.whatsapp import send_whatsapp_message

router = APIRouter()


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def normalize_mobile(value):
    digits = "".join(ch for ch in str(value or "") if ch.isdigit())
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[2:]
    return digits[-10:] if len(digits) >= 10 else digits


def _store_scope_filter(store_id: str) -> dict:
    return {"$or": [{"store_id": store_id}, {"store_ids": store_id}]}


async def resolve_enrollment_store_id(db, body: dict, brand_id: str, scoped_store_id: str | None):
    if scoped_store_id:
        return scoped_store_id

    requested_store_id = body.get("store_id")
    if not requested_store_id:
        return None

    store = await db["stores"].find_one(
        {"store_id": requested_store_id, "brand_id": brand_id}
    )
    if not store:
        raise HTTPException(status_code=400, detail="Invalid store selected")
    return requested_store_id


@router.get("")
async def list_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(15, le=1000),
    search: str = Query(""),
    tier: str = Query(""),
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id, store_id = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    filters = []
    if brand_id:
        filters.append({"brand_id": brand_id})
    if store_id:
        filters.append(_store_scope_filter(store_id))
    if search:
        filters.append(
            {
                "$or": [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"mobile": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}},
                ]
            }
        )
    if tier:
        filters.append({"loyalty_tier": tier})
    query = {"$and": filters} if filters else {}

    total = await db["customers"].count_documents(query)
    skip = (page - 1) * limit
    cursor = db["customers"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    customers = []
    async for doc in cursor:
        customers.append(clean(doc))

    return {"customers": customers, "total": total, "page": page, "limit": limit}


@router.post("", status_code=201)
async def create_customer(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id, store_id = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    mobile = normalize_mobile(body.get("mobile"))
    if not mobile:
        raise HTTPException(status_code=400, detail="Mobile number is required")
    if len(mobile) != 10:
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit mobile number")

    enrollment_store_id = await resolve_enrollment_store_id(db, body, brand_id, store_id)

    existing = await db["customers"].find_one({"brand_id": brand_id, "mobile": mobile})
    if existing:
        updates = {"updated_at": datetime.utcnow()}
        update_doc = {"$set": updates}
        if enrollment_store_id:
            update_doc["$addToSet"] = {"store_ids": enrollment_store_id}
            if not existing.get("store_id"):
                updates["store_id"] = enrollment_store_id
        await db["customers"].update_one(
            {"customer_id": existing["customer_id"]}, update_doc
        )
        existing = clean(await db["customers"].find_one({"customer_id": existing["customer_id"]}))
        existing["duplicate"] = True
        existing["enrolled_store_id"] = enrollment_store_id
        return JSONResponse(status_code=200, content=jsonable_encoder(existing))

    customer_id = str(uuid.uuid4())
    store_ids = [enrollment_store_id] if enrollment_store_id else []
    customer = {
        "customer_id": customer_id,
        "brand_id": brand_id,
        "tenant_id": tenant_id,
        "store_id": enrollment_store_id,
        "store_ids": store_ids,
        "name": body.get("name", ""),
        "mobile": mobile,
        "email": body.get("email"),
        "gender": body.get("gender"),
        "dob": datetime.fromisoformat(body["dob"]) if body.get("dob") else None,
        "anniversary": datetime.fromisoformat(body["anniversary"])
        if body.get("anniversary")
        else None,
        "address": body.get("address"),
        "city": body.get("city"),
        "state": body.get("state"),
        "pincode": body.get("pincode"),
        "loyalty_tier": "Silver",
        "lifetime_value": 0.0,
        "total_purchases": 0,
        "last_purchase_date": None,
        "current_points_balance": 0,
        "lifetime_points_earned": 0,
        "cashback_wallet_balance": 0.0,
        "referral_count": 0,
        "referral_code": f"REF{body.get('name', 'NEW')[:3].upper()}{customer_id[:4].upper()}",
        "feedback_score": 5.0,
        "churn_probability": 0.0,
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    await db["customers"].insert_one(customer)
    return clean(customer)


@router.post("/bulk-import")
async def bulk_import_customers(
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    customers_data = body.get("customers", [])
    brand_id, store_id = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "")
    enrollment_store_id = await resolve_enrollment_store_id(db, body, brand_id, store_id)

    created_list = []
    dup_list = []
    err_list = []

    def _parse_date(v):
        if not v:
            return None
        try:
            return datetime.fromisoformat(v)
        except (ValueError, TypeError):
            pass
        try:
            return datetime.strptime(v, "%d/%m/%Y")
        except (ValueError, TypeError):
            return None

    for i, row in enumerate(customers_data):
        mobile = normalize_mobile(row.get("mobile", ""))
        if not mobile:
            err_list.append(
                {
                    "row": i + 1,
                    "mobile": "-",
                    "name": row.get("name", ""),
                    "reason": "Mobile required",
                }
            )
            continue

        existing = await db["customers"].find_one(
            {"brand_id": brand_id, "mobile": mobile}
        )
        if existing:
            update_doc = {"$set": {"updated_at": datetime.utcnow()}}
            if enrollment_store_id:
                update_doc["$addToSet"] = {"store_ids": enrollment_store_id}
                if not existing.get("store_id"):
                    update_doc["$set"]["store_id"] = enrollment_store_id
            await db["customers"].update_one(
                {"customer_id": existing["customer_id"]}, update_doc
            )
            dup_list.append(
                {
                    "row": i + 1,
                    "mobile": mobile,
                    "name": row.get("name", ""),
                    "enrolled_store_id": enrollment_store_id,
                }
            )
            continue

        customer_id = str(uuid.uuid4())
        store_ids = [enrollment_store_id] if enrollment_store_id else []
        customer = {
            "customer_id": customer_id,
            "brand_id": brand_id,
            "tenant_id": tenant_id,
            "store_id": enrollment_store_id,
            "store_ids": store_ids,
            "name": row.get("name", ""),
            "mobile": mobile,
            "email": row.get("email"),
            "gender": row.get("gender"),
            "dob": _parse_date(row.get("dob")),
            "anniversary": _parse_date(row.get("anniversary")),
            "address": row.get("address"),
            "city": row.get("city"),
            "state": row.get("state"),
            "pincode": row.get("pincode"),
            "loyalty_tier": "Silver",
            "lifetime_value": 0.0,
            "total_purchases": 0,
            "last_purchase_date": None,
            "current_points_balance": 0,
            "lifetime_points_earned": 0,
            "cashback_wallet_balance": 0.0,
            "referral_count": 0,
            "referral_code": f"REF{(row.get('name', 'NEW')[:3]).upper()}{customer_id[:4].upper()}",
            "feedback_score": 5.0,
            "churn_probability": 0.0,
            "status": "active",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        await db["customers"].insert_one(customer)
        clean(customer)
        created_list.append(customer)

    return {
        "total": len(customers_data),
        "created": len(created_list),
        "duplicates": len(dup_list),
        "errors": len(err_list),
        "created_list": created_list,
        "duplicate_list": dup_list,
        "error_list": err_list,
    }


@router.post("/import-transactions")
async def import_transactions(
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    transactions = body.get("transactions", [])
    brand_id, store_id = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "")

    processed_list = []
    errors = []
    total_points = 0

    def _parse_date(v):
        if not v:
            return None
        try:
            return datetime.strptime(v, "%d/%m/%Y")
        except (ValueError, TypeError):
            return None

    for i, row in enumerate(transactions):
        mobile = normalize_mobile(row.get("mobile", ""))
        amount = float(row.get("amount", 0) or 0)

        if not mobile or amount <= 0:
            errors.append(
                {
                    "row": i + 1,
                    "mobile": mobile or "-",
                    "reason": "Mobile and a positive amount are required",
                }
            )
            continue

        customer = await db["customers"].find_one(
            {"brand_id": brand_id, "mobile": mobile}
        )
        if not customer:
            errors.append(
                {
                    "row": i + 1,
                    "mobile": mobile,
                    "reason": "Customer not found — add them first",
                }
            )
            continue

        points = int(amount / 10)
        parsed_date = _parse_date(row.get("date")) or datetime.utcnow()
        now = datetime.utcnow()

        order_id = str(uuid.uuid4())
        order_doc = {
            "order_id": order_id,
            "brand_id": brand_id,
            "store_id": current_user.get("store_id"),
            "tenant_id": tenant_id,
            "customer_id": customer["customer_id"],
            "net_amount": amount,
            "points_earned": points,
            "payment_status": "completed",
            "created_at": parsed_date,
        }
        await db["orders"].insert_one(order_doc)

        await db["customers"].update_one(
            {"customer_id": customer["customer_id"]},
            {
                "$inc": {
                    "current_points_balance": points,
                    "lifetime_points_earned": points,
                    "total_purchases": 1,
                    "lifetime_value": amount,
                },
                "$set": {
                    "last_purchase_date": parsed_date,
                    "updated_at": now,
                },
            },
        )

        total_points += points
        processed_list.append(
            {"row": i + 1, "mobile": mobile, "amount": amount, "points": points}
        )

    return {
        "total": len(transactions),
        "processed": len(processed_list),
        "errors": len(errors),
        "total_points_awarded": total_points,
        "error_list": errors,
    }


@router.get("/{customer_id}")
async def get_customer(
    customer_id: str, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id, store_id = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    doc = await db["customers"].find_one({"customer_id": customer_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Customer not found")
    return clean(doc)


@router.put("/{customer_id}")
async def update_customer(
    customer_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id, store_id = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    body.pop("customer_id", None)
    body.pop("_id", None)
    body["updated_at"] = datetime.utcnow()
    if body.get("dob") and isinstance(body["dob"], str):
        body["dob"] = datetime.fromisoformat(body["dob"])
    if body.get("anniversary") and isinstance(body["anniversary"], str):
        body["anniversary"] = datetime.fromisoformat(body["anniversary"])

    result = await db["customers"].update_one(
        {"customer_id": customer_id}, {"$set": body}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"status": "updated"}


@router.get("/{customer_id}/timeline")
async def get_timeline(
    customer_id: str,
    limit: int = Query(20, le=100),
    event_filter: str = Query(""),
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id, store_id = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    query = {"customer_id": customer_id}
    if event_filter:
        query["event_type"] = {"$in": event_filter.split(",")}

    cursor = db["customer_timeline"].find(query).sort("created_at", -1).limit(limit)
    events = []
    async for doc in cursor:
        events.append(clean(doc))

    return {"customer_id": customer_id, "events_count": len(events), "timeline": events}


@router.post("/{customer_id}/adjust-points")
async def adjust_points(
    customer_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id, store_id = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    delta = int(body.get("delta", 0))
    remarks = body.get("remarks", "Manual adjustment")

    await db["customers"].update_one(
        {"customer_id": customer_id},
        {
            "$inc": {"current_points_balance": delta},
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    await db["loyalty_ledger"].insert_one(
        {
            "ledger_id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "transaction_type": "bonus_adjustment",
            "points_delta": delta,
            "remarks": remarks,
            "created_at": datetime.utcnow(),
            "is_expired": False,
        }
    )
    await db["customer_timeline"].insert_one(
        {
            "event_id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "event_type": "points_earned" if delta > 0 else "points_redeemed",
            "summary": f"Manual points adjustment: {'+' if delta > 0 else ''}{delta} points — {remarks}",
            "payload": {
                "points_delta": delta,
                "remarks": remarks,
                "by": current_user.get("full_name"),
            },
            "created_at": datetime.utcnow(),
        }
    )
    return {"status": "adjusted", "delta": delta}


@router.post("/{customer_id}/send-whatsapp")
async def send_whatsapp_to_customer(
    customer_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Send a real WhatsApp message to a customer via Bonvoice API."""
    brand_id, store_id = get_data_scope(current_user)

    # Fetch customer to get mobile number
    customer = await db["customers"].find_one({"customer_id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    mobile = customer.get("mobile", "")
    if not mobile:
        raise HTTPException(status_code=400, detail="Customer has no mobile number")

    message = body.get("message", "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="'message' is required")

    # Ensure country code
    phone = mobile if mobile.startswith("91") else f"91{mobile}"

    result = await send_whatsapp_message(to=phone, message=message)

    # Log in timeline regardless of success
    await db["customer_timeline"].insert_one(
        {
            "event_id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "event_type": "whatsapp_sent",
            "summary": f"WhatsApp {'sent' if result['success'] else 'failed'}: {message[:80]}{'...' if len(message) > 80 else ''}",
            "payload": {
                "to": phone,
                "message": message,
                "message_id": result.get("message_id"),
                "success": result.get("success"),
                "by": current_user.get("full_name", "Agent"),
            },
            "created_at": datetime.utcnow(),
        }
    )

    if result["success"]:
        return {
            "status": "sent",
            "message_id": result["message_id"],
            "to": phone,
        }
    else:
        raise HTTPException(
            status_code=502,
            detail=f"WhatsApp send failed: {result['error']}",
        )


@router.post("/{customer_id}/send-sms")
async def send_sms_to_customer(
    customer_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Send an SMS message to a customer via mTalkz."""
    brand_id, store_id = get_data_scope(current_user)
    customer = await db["customers"].find_one({"customer_id": customer_id, "brand_id": brand_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    template_key = body.get("template_key", "welcome_customer")
    if template_key in ("welcome_customer", "customer_welcome", "welcome"):
        brand = await db["brands"].find_one({"brand_id": brand_id}, {"name": 1})
        message = render_sms_template(
            "welcome_customer",
            {
                "brand": (brand or {}).get("name") or current_user.get("brand_name") or "AVOPAY",
                "name": customer.get("name") or "Customer",
                "tier": customer.get("loyalty_tier", "Silver"),
                "referral_code": customer.get("referral_code", "AVOPAY"),
            },
        )
    else:
        message = body.get("message", "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="'message' is required")

    result = await send_to_customer_channels(
        db,
        customer=customer,
        brand_id=brand_id,
        channels=["sms"],
        message=message,
        template_key=template_key,
        actor=current_user.get("full_name", "Agent"),
    )
    if result["sent"] > 0:
        return {"status": "sent", **result}
    raise HTTPException(status_code=502, detail=result["results"][0].get("error", "SMS send failed"))


@router.post("/{customer_id}/send-message")
async def send_message_to_customer(
    customer_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Send a customer message over sms, whatsapp, or both."""
    brand_id, store_id = get_data_scope(current_user)
    customer = await db["customers"].find_one({"customer_id": customer_id, "brand_id": brand_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    template_key = body.get("template_key", "custom")
    if template_key in ("welcome_customer", "customer_welcome", "welcome"):
        brand = await db["brands"].find_one({"brand_id": brand_id}, {"name": 1})
        message = render_sms_template(
            "welcome_customer",
            {
                "brand": (brand or {}).get("name") or current_user.get("brand_name") or "AVOPAY",
                "name": customer.get("name") or "Customer",
                "tier": customer.get("loyalty_tier", "Silver"),
                "referral_code": customer.get("referral_code", "AVOPAY"),
            },
        )
    else:
        message = body.get("message", "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="'message' is required")

    result = await send_to_customer_channels(
        db,
        customer=customer,
        brand_id=brand_id,
        channels=body.get("channels") or body.get("channel") or "whatsapp",
        message=message,
        template_key=template_key,
        actor=current_user.get("full_name", "Agent"),
    )
    if result["sent"] > 0:
        return {"status": "sent", **result}
    raise HTTPException(status_code=502, detail="All selected channels failed")
