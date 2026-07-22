import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.core.sms import render_sms_template, send_to_customer_channels
from app.core.security import get_current_user
from app.db.database import get_database

router = APIRouter()


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("")
async def list_referrals(
    db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    cursor = (
        db["referrals"].find({"brand_id": brand_id}).sort("created_at", -1).limit(100)
    )
    referrals = [clean(doc) async for doc in cursor]
    return {"referrals": referrals}


@router.post("", status_code=201)
async def create_referral(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    """Record a referral that was sent / invited to a friend."""
    brand_id = current_user.get("brand_id", "")
    referral = {
        "referral_id": str(uuid.uuid4()),
        "brand_id": brand_id,
        "referrer_name": body.get("referrer_name", "").strip() or "Unknown",
        "referred_name": body.get("referred_name", "").strip(),
        "referred_mobile": body.get("referred_mobile", "").strip(),
        "referred_email": body.get("referred_email", "").strip(),
        "referral_code": body.get("referral_code", "").strip() or f"REF{uuid.uuid4().hex[:6].upper()}",
        "status": body.get("status", "pending"),
        "referrer_reward_credited": bool(body.get("referrer_reward_credited", False)),
        "referred_reward_credited": bool(body.get("referred_reward_credited", False)),
        "channel": body.get("channel", "whatsapp"),
        "channels": body.get("channels") or [body.get("channel", "whatsapp")],
        "created_at": datetime.utcnow(),
    }
    await db["referrals"].insert_one(referral)
    send_result = None
    if referral["referred_mobile"]:
        brand = await db["brands"].find_one({"brand_id": brand_id}, {"name": 1})
        brand_name = (brand or {}).get("name") or current_user.get("brand_name") or "AVOPAY"
        offer_text = body.get("offer_text") or f"Join AVOPAY using referral code {referral['referral_code']}"
        message = body.get("message") or render_sms_template(
            "campaign_offer",
            {
                "name": referral["referred_name"] or "Customer",
                "brand": brand_name,
                "offer": offer_text,
                "coupon_code": referral["referral_code"],
            },
        )
        send_result = await send_to_customer_channels(
            db,
            customer={
                "customer_id": None,
                "mobile": referral["referred_mobile"],
                "email": referral["referred_email"],
                "name": referral["referred_name"],
            },
            brand_id=brand_id,
            channels=body.get("channels") or body.get("channel", "whatsapp"),
            message=message,
            template_key="referral_invite",
            actor=current_user.get("full_name", "Agent"),
        )
        await db["referrals"].update_one(
            {"referral_id": referral["referral_id"]},
            {"$set": {"send_result": send_result}},
        )
        referral["send_result"] = send_result
    return clean(referral)


@router.put("/{referral_id}")
async def update_referral(
    referral_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    body.pop("_id", None)
    body.pop("referral_id", None)
    result = await db["referrals"].update_one(
        {"referral_id": referral_id, "brand_id": brand_id}, {"$set": body}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Referral not found")
    return {"status": "updated", "referral_id": referral_id}


@router.delete("/{referral_id}")
async def delete_referral(
    referral_id: str, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    result = await db["referrals"].delete_one(
        {"referral_id": referral_id, "brand_id": brand_id}
    )
    if result.deleted_count == 0:
        await db["referrals"].delete_one({"referral_id": referral_id})
    return {"status": "deleted", "referral_id": referral_id}


@router.get("/program")
async def get_referral_program(
    db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    program = await db["referral_programs"].find_one({"brand_id": brand_id})
    return {"program": clean(program) if program else None}


@router.post("/program")
async def save_referral_program(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    """Save / update the referral program configuration for the brand."""
    brand_id = current_user.get("brand_id", "")
    body.pop("_id", None)
    config = {**body, "brand_id": brand_id, "updated_at": datetime.utcnow()}
    await db["referral_programs"].update_one(
        {"brand_id": brand_id},
        {"$set": config, "$setOnInsert": {"created_at": datetime.utcnow()}},
        upsert=True,
    )
    return {"status": "saved"}
