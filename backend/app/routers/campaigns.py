import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException

from app.core.sms import normalize_channels, render_sms_template, send_to_customer_channels
from app.core.security import get_current_user
from app.db.database import get_database

router = APIRouter()


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("")
async def list_campaigns(
    db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    cursor = db["campaigns"].find({"brand_id": brand_id}).sort("created_at", -1)
    campaigns = [clean(doc) async for doc in cursor]
    return {"campaigns": campaigns}


@router.post("", status_code=201)
async def create_campaign(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    campaign = {
        "campaign_id": str(uuid.uuid4()),
        "brand_id": brand_id,
        "name": body.get("name", "Untitled Campaign"),
        "status": body.get("status") or ("scheduled" if body.get("schedule") == "schedule" else "draft"),
        "channel": body.get("channel", "whatsapp"),
        "channels": normalize_channels(body.get("channels") or body.get("channel", "whatsapp")),
        "trigger": body.get("trigger", ""),
        "workflow_nodes": body.get("workflow_nodes", []),
        "message": body.get("message", ""),
        "discount_type": body.get("discount_type", "no-discount"),
        "discount_value": body.get("discount_value", ""),
        "segment": body.get("segment", "all"),
        "schedule": body.get("schedule", "now"),
        "scheduled_at": body.get("scheduled_at", ""),
        "sent": 0,
        "failed": 0,
        "opened": 0,
        "converted": 0,
        "created_at": datetime.utcnow(),
    }
    await db["campaigns"].insert_one(campaign)
    return clean(campaign)


@router.put("/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    body.pop("_id", None)
    body.pop("campaign_id", None)
    await db["campaigns"].update_one({"campaign_id": campaign_id}, {"$set": body})
    return {"status": "updated"}


@router.post("/{campaign_id}/send")
async def send_campaign_whatsapp(
    campaign_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """
    Send campaign message via selected channels to brand customers.
    Body: { message?, channel?, channels?, limit? }.
    """
    brand_id = current_user.get("brand_id", "")

    campaign = await db["campaigns"].find_one({"campaign_id": campaign_id, "brand_id": brand_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    message = body.get("message") or campaign.get("message") or campaign.get("name", "Special offer for you!")
    channels = normalize_channels(body.get("channels") or body.get("channel") or campaign.get("channels") or campaign.get("channel"))
    limit = min(int(body.get("limit", 500) or 500), 1000)
    brand = await db["brands"].find_one({"brand_id": brand_id}, {"name": 1})
    brand_name = (brand or {}).get("name") or current_user.get("brand_name") or "AVOPAY"

    has_mobile_channels = any(c in channels for c in ("sms", "whatsapp"))
    has_email_channel = "email" in channels

    customer_ids = body.get("customer_ids")
    if customer_ids:
        query = {
            "brand_id": brand_id,
            "customer_id": {"$in": customer_ids}
        }
    else:
        if has_mobile_channels and has_email_channel:
            query = {
                "brand_id": brand_id,
                "status": "active",
                "$or": [
                    {"mobile": {"$exists": True, "$nin": ["", None, "unknown"]}},
                    {"email": {"$exists": True, "$nin": ["", None, "unknown"]}}
                ]
            }
        elif has_email_channel:
            query = {
                "brand_id": brand_id,
                "status": "active",
                "email": {"$exists": True, "$nin": ["", None, "unknown"]}
            }
        else:
            query = {
                "brand_id": brand_id,
                "status": "active",
                "mobile": {"$exists": True, "$nin": ["", None, "unknown"]}
            }
        segment = body.get("segment") or campaign.get("segment", "all")
        now = datetime.utcnow()
        if segment in ("active", "champions", "loyal", "potential"):
            query["last_purchase_date"] = {"$gte": now - timedelta(days=90)}
        elif segment in ("dormant", "at-risk"):
            query["last_purchase_date"] = {"$lt": now - timedelta(days=90)}
        elif segment == "lost":
            query["last_purchase_date"] = {"$lt": now - timedelta(days=180)}
        elif segment == "new":
            query["created_at"] = {"$gte": now - timedelta(days=30)}
        elif segment == "gold-plus":
            query["loyalty_tier"] = {"$in": ["Gold", "Platinum", "Diamond"]}

    cursor = db["customers"].find(query).limit(limit)
    customers = [doc async for doc in cursor]

    sent_count = 0
    failed_count = 0
    channel_totals = {channel: {"sent": 0, "failed": 0} for channel in channels}

    for cust in customers:
        variables = {
            "name": cust.get("name") or "Customer",
            "brand": brand_name,
            "points": cust.get("current_points_balance", 0) or 0,
            "tier": cust.get("loyalty_tier", "Silver"),
            "coupon_code": body.get("coupon_code") or campaign.get("coupon_code", "AVOPAY"),
            "offer": str(campaign.get("discount_value") or body.get("offer") or message),
            "message": message,
        }
        template_key = "campaign_offer" if campaign.get("discount_type") not in ("", "no-discount", None) else "campaign_info"
        personalized = render_sms_template(template_key, variables, fallback=message)
        result = await send_to_customer_channels(
            db,
            customer=cust,
            brand_id=brand_id,
            channels=channels,
            message=personalized,
            template_key=template_key,
            campaign_id=campaign_id,
            actor=current_user.get("full_name", "Agent"),
        )
        sent_count += result["sent"]
        failed_count += result["failed"]
        for item in result["results"]:
            totals = channel_totals.setdefault(item["channel"], {"sent": 0, "failed": 0})
            if item.get("success"):
                totals["sent"] += 1
            else:
                totals["failed"] += 1

    await db["campaigns"].update_one(
        {"campaign_id": campaign_id},
        {
            "$set": {
                "status": "sent",
                "sent": sent_count,
                "failed": failed_count,
                "channels": channels,
                "channel_stats": channel_totals,
                "sent_at": datetime.utcnow(),
            }
        },
    )

    return {
        "status": "sent",
        "campaign_id": campaign_id,
        "sent": sent_count,
        "failed": failed_count,
        "channels": channels,
        "channel_stats": channel_totals,
        "total": len(customers),
    }


@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    result = await db["campaigns"].delete_one(
        {"campaign_id": campaign_id, "brand_id": brand_id}
    )
    if result.deleted_count == 0:
        # fall back to deleting by id only (legacy docs without brand scoping)
        await db["campaigns"].delete_one({"campaign_id": campaign_id})
    return {"status": "deleted", "campaign_id": campaign_id}
