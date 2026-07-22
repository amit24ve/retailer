import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query

from app.core.security import get_current_user
from app.db.database import get_database

router = APIRouter()


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("")
async def list_feedback(
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    feedback_type: str = Query(""),  # promoter | passive | detractor
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    query = {"brand_id": brand_id}
    if feedback_type:
        query["feedback_type"] = feedback_type

    total = await db["feedback"].count_documents(query)
    skip = (page - 1) * limit
    cursor = db["feedback"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    items = [clean(doc) async for doc in cursor]
    return {"feedback": items, "total": total, "page": page, "limit": limit}


@router.post("", status_code=201)
async def create_feedback(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    rating = body.get("rating", 5)
    if rating >= 9:
        fb_type = "promoter"
    elif rating >= 7:
        fb_type = "passive"
    else:
        fb_type = "detractor"

    feedback = {
        "feedback_id": str(uuid.uuid4()),
        "brand_id": brand_id,
        "customer_id": body.get("customer_id"),
        "customer_name": body.get("customer_name", "Anonymous"),
        "mobile": body.get("mobile", ""),
        "rating": rating,
        "comment": body.get("comment", ""),
        "store": body.get("store", ""),
        "feedback_type": fb_type,
        "resolved": False,
        "created_at": datetime.utcnow(),
    }
    await db["feedback"].insert_one(feedback)

    # Trigger Ticket Created Email
    recipient = body.get("email")
    if not recipient and body.get("customer_id"):
        cust = await db["customers"].find_one({"customer_id": body.get("customer_id")})
        if cust and cust.get("email") and cust.get("email") != "unknown":
            recipient = cust["email"]
    if not recipient or "@" not in str(recipient):
        recipient = current_user.get("email")

    if recipient:
        try:
            from app.core.email import send_email
            from app.core.templates import get_ticket_created_email
            ticket_html = get_ticket_created_email(feedback["feedback_id"], feedback["comment"] or "No comment provided.", feedback["feedback_type"])
            await send_email("ticket_created", recipient, f"Support Ticket Created - #{feedback['feedback_id']}", ticket_html)
        except Exception:
            pass

    return clean(feedback)


@router.put("/{feedback_id}/resolve")
async def resolve_feedback(
    feedback_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    fb = await db["feedback"].find_one({"feedback_id": feedback_id})
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    note = body.get("note", "Resolved by store administrator.")

    await db["feedback"].update_one(
        {"feedback_id": feedback_id},
        {
            "$set": {
                "resolved": True,
                "resolution_note": note,
                "resolved_at": datetime.utcnow(),
            }
        },
    )

    # Resolve email and send Resolved Email
    recipient = fb.get("email")
    if not recipient and fb.get("customer_id"):
        cust = await db["customers"].find_one({"customer_id": fb.get("customer_id")})
        if cust and cust.get("email") and cust.get("email") != "unknown":
            recipient = cust["email"]
    if not recipient or "@" not in str(recipient):
        recipient = current_user.get("email")

    if recipient:
        try:
            from app.core.email import send_email
            from app.core.templates import get_ticket_resolved_email
            resolved_html = get_ticket_resolved_email(feedback_id, note)
            await send_email("ticket_resolved", recipient, f"Support Ticket Resolved - #{feedback_id}", resolved_html)
        except Exception:
            pass

    return {"status": "resolved"}


@router.get("/stats")
async def get_feedback_stats(
    db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    total = await db["feedback"].count_documents({"brand_id": brand_id})
    promoters = await db["feedback"].count_documents(
        {"brand_id": brand_id, "feedback_type": "promoter"}
    )
    detractors = await db["feedback"].count_documents(
        {"brand_id": brand_id, "feedback_type": "detractor"}
    )

    nps = round(((promoters - detractors) / total * 100) if total > 0 else 39)
    return {
        "total": total,
        "promoters": promoters,
        "detractors": detractors,
        "nps_score": nps,
    }
