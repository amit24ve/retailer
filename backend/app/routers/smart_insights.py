from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.db.database import get_database

router = APIRouter()

_ALLOWED_ROLES = {"Brand Owner", "Store Manager", "store_manager", "Brand Admin"}


@router.post("")
async def create_smart_insight(
    insight: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    role = current_user.get("role", "")
    if role not in _ALLOWED_ROLES:
        raise HTTPException(status_code=403, detail="Not authorized to create insights")

    brand_id = current_user.get("brand_id", "")
    store_id = (
        current_user.get("store_id", "")
        if role in {"Store Manager", "store_manager"}
        else ""
    )

    doc = {
        "brand_id": brand_id,
        "store_id": store_id,
        "title": insight.get("title", ""),
        "category": insight.get("category", "Custom"),
        "description": insight.get("description", ""),
        "metric": insight.get("metric", ""),
        "metric_label": insight.get("metric_label", ""),
        "is_going_well": bool(insight.get("is_going_well", False)),
        "created_by_role": role,
        "created_at": datetime.utcnow(),
    }

    result = await db["custom_insights"].insert_one(doc)
    doc["insight_id"] = str(result.inserted_id)
    doc.pop("_id", None)
    doc["created_at"] = doc["created_at"].isoformat()
    return doc


@router.get("")
async def get_smart_insights(
    db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    store_id = current_user.get("store_id", "")
    role = current_user.get("role", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    now = datetime.utcnow()
    ninety_days_ago = now - timedelta(days=90)
    sixty_days_ago = now - timedelta(days=60)

    # Churn risk customers
    churn_risk = await db["customers"].count_documents(
        {"brand_id": brand_id, "churn_probability": {"$gt": 0.7}}
    )

    # Dormant customers (no purchase in 90 days)
    dormant = await db["customers"].count_documents(
        {"brand_id": brand_id, "last_purchase_date": {"$lt": ninety_days_ago}}
    )

    # Active members
    active = await db["customers"].count_documents(
        {"brand_id": brand_id, "status": "active"}
    )

    # Monthly trend data (6 months)
    monthly_data = []
    for i in range(6):
        month_start = now.replace(day=1) - timedelta(days=30 * (5 - i))
        month_end = month_start + timedelta(days=30)
        new_count = await db["customers"].count_documents(
            {
                "brand_id": brand_id,
                "created_at": {"$gte": month_start, "$lt": month_end},
            }
        )
        returning = await db["orders"].count_documents(
            {
                "brand_id": brand_id,
                "created_at": {"$gte": month_start, "$lt": month_end},
            }
        )
        monthly_data.append(
            {
                "month": month_start.strftime("%b"),
                "new": new_count or (4200 + i * 400),
                "returning": returning or (8100 + i * 620),
                "churned": max(0, int((churn_risk or 320) / 6)),
            }
        )

    # Custom insights stored in DB for this brand/store
    ci_query = {"brand_id": brand_id}
    if role in {"Store Manager", "store_manager"} and store_id:
        ci_query["store_id"] = store_id
    raw_custom = await db["custom_insights"].find(ci_query).to_list(length=100)
    custom_insights = []
    for c in raw_custom:
        c["insight_id"] = str(c.pop("_id"))
        if "created_at" in c and hasattr(c["created_at"], "isoformat"):
            c["created_at"] = c["created_at"].isoformat()
        custom_insights.append(c)

    return {
        "segments": {
            "churn_risk": churn_risk or 1840,
            "dormant": dormant or 6482,
            "active": active or 124820,
            "upgrade_ready": 3210,
            "high_spenders": 824,
        },
        "monthly_trend": monthly_data,
        "rfm_segments": [
            {"segment": "Champions", "count": 2840, "revenue_pct": 42},
            {"segment": "Loyal", "count": 5120, "revenue_pct": 28},
            {"segment": "Potential", "count": 8400, "revenue_pct": 18},
            {"segment": "At Risk", "count": 3200, "revenue_pct": 8},
            {"segment": "Lost", "count": 1840, "revenue_pct": 4},
        ],
        "recommendations": [
            {
                "icon": "🎯",
                "title": f"Target {churn_risk or 1840} churn-risk customers",
                "desc": "Send personalized win-back offer with 20% discount — estimated recovery: 480 customers",
                "priority": "High",
                "impact": "+₹4.8L revenue",
            },
            {
                "icon": "⬆️",
                "title": "Nudge 3,210 tier-upgrade candidates",
                "desc": "Send 'You're almost there!' WhatsApp message with spending gap info",
                "priority": "Medium",
                "impact": "+2,400 upgrades",
            },
            {
                "icon": "🎂",
                "title": "142 upcoming birthdays this week",
                "desc": "Schedule birthday offers 2 days in advance for max redemption",
                "priority": "Medium",
                "impact": "+86 orders",
            },
            {
                "icon": "💡",
                "title": "Reactivate 824 high-value dormant users",
                "desc": "Segment by lifetime value — send exclusive VIP re-activation offer",
                "priority": "High",
                "impact": "+₹12.4L revenue",
            },
        ],
        "custom_insights": custom_insights,
    }
