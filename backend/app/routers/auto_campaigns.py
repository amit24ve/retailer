import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query

from app.core.sms import normalize_channels
from app.core.security import get_current_user
from app.db.database import get_database

router = APIRouter()


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("")
async def list_auto_campaigns(
    db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    cursor = db["auto_campaigns"].find({"brand_id": brand_id}).sort("created_at", -1)
    campaigns = [clean(doc) async for doc in cursor]
    return {"campaigns": campaigns}


@router.post("", status_code=201)
async def create_auto_campaign(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    campaign = {
        "campaign_id": str(uuid.uuid4()),
        "brand_id": brand_id,
        "name": body.get("name", "Untitled Auto Campaign"),
        "trigger": body.get(
            "trigger", "birthday"
        ),  # birthday | anniversary | inactive_60 | tier_upgrade | etc.
        "message": body.get("message", ""),
        "channel": body.get("channel", "whatsapp"),
        "channels": normalize_channels(body.get("channels") or body.get("channel", "whatsapp")),
        "delay_hours": body.get("delay_hours", 0),
        "status": "active",
        "sent": 0,
        "opened": 0,
        "converted": 0,
        "created_at": datetime.utcnow(),
    }
    await db["auto_campaigns"].insert_one(campaign)
    return clean(campaign)


@router.put("/{campaign_id}")
async def update_auto_campaign(
    campaign_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    body.pop("_id", None)
    body.pop("campaign_id", None)
    await db["auto_campaigns"].update_one({"campaign_id": campaign_id}, {"$set": body})
    return {"status": "updated"}


@router.delete("/{campaign_id}")
async def delete_auto_campaign(
    campaign_id: str, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    await db["auto_campaigns"].delete_one({"campaign_id": campaign_id})
    return {"status": "deleted"}


@router.post("/{campaign_id}/toggle")
async def toggle_auto_campaign(
    campaign_id: str, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    doc = await db["auto_campaigns"].find_one({"campaign_id": campaign_id})
    if not doc:
        return {"status": "not_found"}
    new_status = "paused" if doc.get("status") == "active" else "active"
    await db["auto_campaigns"].update_one(
        {"campaign_id": campaign_id}, {"$set": {"status": new_status}}
    )
    return {"status": new_status}
