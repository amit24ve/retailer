import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException

from app.core.sms import render_sms_template, send_to_customer_channels
from app.core.security import get_current_user
from app.db.database import get_database
from app.routers.whatsapp import send_whatsapp_message

router = APIRouter()


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("")
async def list_qr_codes(
    db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    cursor = db["qr_codes"].find({"brand_id": brand_id}).sort("created_at", -1)
    items = [clean(doc) async for doc in cursor]
    return {"qr_codes": items}


@router.get("/stats")
async def get_qr_stats(db=Depends(get_database), current_user=Depends(get_current_user)):
    brand_id = current_user.get("brand_id", "")
    total_scans = await db["qr_codes"].aggregate([
        {"$match": {"brand_id": brand_id}},
        {"$group": {"_id": None, "scans": {"$sum": "$scans"}}},
    ]).to_list(1)
    active = await db["qr_codes"].find_one({"brand_id": brand_id, "active": {"$ne": False}})
    scans = int(total_scans[0]["scans"]) if total_scans else 0
    return {
        "scans_today": 0,
        "total_scans": scans,
        "new_customers": 0,
        "conversion_rate": 0,
        "active_objective": (active or {}).get("type", "customer_registration"),
    }


@router.post("", status_code=201)
async def create_qr_code(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    qr_id = str(uuid.uuid4())
    # Accept custom destination URL from the frontend, default to a fallback if none provided
    destination_url = body.get("url") or f"https://retailer.avopay.pro"
    qr = {
        "qr_id": qr_id,
        "brand_id": brand_id,
        "name": body.get("name", "Unnamed QR"),
        "type": body.get(
            "type", "checkin"
        ),  # checkin | payment | campaign | referral | signup
        "store": body.get("store", "All Stores"),
        "url": destination_url,
        "scans": 0,
        "active": True,
        "created_at": datetime.utcnow(),
    }
    await db["qr_codes"].insert_one(qr)
    return clean(qr)


@router.post("/{qr_id}/scan")
async def record_scan(qr_id: str, body: dict, db=Depends(get_database)):
    """Record a QR scan — called when customer scans the QR code"""
    await db["qr_codes"].update_one(
        {"qr_id": qr_id},
        {"$inc": {"scans": 1}, "$set": {"last_scan": datetime.utcnow()}},
    )
    # Find the qr code to get the brand_id and destination url dynamically
    qr = await db["qr_codes"].find_one({"qr_id": qr_id})
    brand_id = (
        qr.get("brand_id", "brand-fashion-india-001")
        if qr
        else "brand-fashion-india-001"
    )
    destination_url = qr.get("url") if qr else "https://retailer.avopay.pro"
    qr_type = qr.get("type", "custom") if qr else "custom"
    qr_name = qr.get("name", "") if qr else ""

    # Record scan event
    await db["qr_scans"].insert_one(
        {
            "scan_id": str(uuid.uuid4()),
            "qr_id": qr_id,
            "brand_id": brand_id,
            "customer_mobile": body.get("mobile", ""),
            "store": body.get("store", ""),
            "scanned_at": datetime.utcnow(),
        }
    )
    return {
        "status": "recorded",
        "url": destination_url,
        "type": qr_type,
        "name": qr_name,
    }


@router.put("/{qr_id}")
async def update_qr_code(
    qr_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    body.pop("_id", None)
    body.pop("qr_id", None)
    await db["qr_codes"].update_one({"qr_id": qr_id}, {"$set": body})
    return {"status": "updated"}


@router.delete("/{qr_id}")
async def delete_qr_code(
    qr_id: str, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    await db["qr_codes"].delete_one({"qr_id": qr_id})
    return {"status": "deleted"}


@router.post("/{qr_id}/share-whatsapp")
async def share_qr_via_whatsapp(
    qr_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """
    Send a QR code link via WhatsApp to a phone number.
    Body: { to, message? }
    """
    to = body.get("to", "").strip()
    if not to:
        raise HTTPException(status_code=400, detail="'to' phone number is required")

    # Fetch the QR to get its URL
    qr = await db["qr_codes"].find_one({"qr_id": qr_id})
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")

    qr_url = qr.get("url", "https://retailer.avopay.pro")
    qr_name = qr.get("name", "QR Code")

    custom_message = body.get("message", "").strip()
    message = custom_message or (
        f"Hi! Here is your QR code link for '{qr_name}'.\n\n"
        f"Scan or click: {qr_url}\n\n"
        f"Powered by Cuben Retailer 🚀"
    )

    phone = to if to.startswith("91") else f"91{to}"
    result = await send_whatsapp_message(to=phone, message=message)

    if result["success"]:
        return {
            "status": "sent",
            "message_id": result["message_id"],
            "qr_id": qr_id,
            "to": phone,
        }
    else:
        raise HTTPException(status_code=502, detail=f"WhatsApp send failed: {result['error']}")


@router.post("/{qr_id}/share-sms")
async def share_qr_via_sms(
    qr_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Send a QR code link via SMS to a phone number. Body: { to, message? }"""
    return await share_qr_via_channels(qr_id, {**body, "channels": ["sms"]}, db, current_user)


@router.post("/{qr_id}/share-message")
async def share_qr_via_channels(
    qr_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Send a QR code link via sms, whatsapp, or both. Body: { to, message?, channels? }"""
    to = body.get("to", "").strip()
    if not to:
        raise HTTPException(status_code=400, detail="'to' phone number is required")

    brand_id = current_user.get("brand_id", "")
    qr = await db["qr_codes"].find_one({"qr_id": qr_id, "brand_id": brand_id})
    if not qr:
        raise HTTPException(status_code=404, detail="QR code not found")

    qr_url = qr.get("url", "https://retailer.avopay.pro")
    qr_name = qr.get("name", "QR Code")
    brand = await db["brands"].find_one({"brand_id": brand_id}, {"name": 1})
    brand_name = (brand or {}).get("name") or "AVOPAY"
    message = body.get("message", "").strip() or render_sms_template(
        "qr_share",
        {"brand": brand_name, "qr_name": qr_name, "qr_url": qr_url},
    )

    result = await send_to_customer_channels(
        db,
        customer={"customer_id": body.get("customer_id"), "mobile": to},
        brand_id=brand_id,
        channels=body.get("channels") or body.get("channel") or ["sms"],
        message=message,
        template_key="qr_share",
        actor=current_user.get("full_name", "Agent"),
    )
    if result["sent"] > 0:
        return {"status": "sent", "qr_id": qr_id, **result}
    raise HTTPException(status_code=502, detail="QR share failed on all selected channels")
