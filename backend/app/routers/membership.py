import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import get_current_user
from app.db.database import get_database

router = APIRouter()


DEFAULT_MEMBERSHIP_PLANS = [
    {
        "id": "default-silver",
        "tier": "Silver",
        "name": "Silver Member",
        "price": 499,
        "validity": "12 months",
        "benefits": [
            "5% cashback on every purchase",
            "Birthday bonus - 200 extra points",
            "Early access to new arrivals",
            "Priority billing queue",
        ],
        "members": 0,
    },
    {
        "id": "default-gold",
        "tier": "Gold",
        "name": "Gold Member",
        "price": 999,
        "validity": "12 months",
        "benefits": [
            "10% cashback on every purchase",
            "Birthday bonus - 500 extra points",
            "2x loyalty points all year",
            "Free home delivery",
            "Exclusive Gold-only offers",
        ],
        "members": 0,
    },
    {
        "id": "default-platinum",
        "tier": "Platinum",
        "name": "Platinum Elite",
        "price": 1999,
        "validity": "12 months",
        "benefits": [
            "15% cashback on every purchase",
            "Birthday bonus - 1,000 extra points",
            "3x loyalty points all year",
            "Unlimited free home delivery",
            "VIP event invitations",
        ],
        "members": 0,
    },
    {
        "id": "default-diamond",
        "tier": "Diamond",
        "name": "Diamond VIP",
        "price": 3999,
        "validity": "12 months",
        "benefits": [
            "20% cashback on every purchase",
            "Birthday bonus - 2,000 extra points",
            "5x loyalty points all year",
            "Annual appreciation gift",
            "Personal account manager",
        ],
        "members": 0,
    },
]


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def _format_date(value):
    if isinstance(value, datetime):
        return value.date().isoformat()
    if value:
        return str(value)[:10]
    return ""


def _plan_tier(plan):
    explicit_tier = plan.get("tier")
    if explicit_tier:
        return explicit_tier
    name = (plan.get("name") or "").lower()
    for tier in ("Diamond", "Platinum", "Gold", "Silver"):
        if tier.lower() in name:
            return tier
    return "Silver"


def _validity_label(days):
    if not days:
        return "12 months"
    if days % 365 == 0:
        years = days // 365
        return "12 months" if years == 1 else f"{years} years"
    if days % 30 == 0:
        months = days // 30
        return f"{months} month" if months == 1 else f"{months} months"
    return f"{days} days"


def _plan_card(plan):
    return {
        "id": plan.get("plan_id") or plan.get("id"),
        "tier": _plan_tier(plan),
        "name": plan.get("name", "Membership Plan"),
        "price": plan.get("price", 0),
        "validity": _validity_label(plan.get("duration_days", 365)),
        "benefits": plan.get("benefits", []),
        "members": plan.get("members_count", 0),
    }


@router.get("")
async def get_membership_overview(
    db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    query = {"brand_id": brand_id} if brand_id else {}

    plan_docs = [
        clean(doc)
        async for doc in db["membership_plans"].find(query).sort("price", 1)
    ]
    plans = [_plan_card(plan) for plan in plan_docs] or DEFAULT_MEMBERSHIP_PLANS

    member_docs = [
        clean(doc)
        async for doc in db["membership_members"]
        .find(query)
        .sort("joined_at", -1)
        .limit(5)
    ]
    customer_ids = [doc.get("customer_id") for doc in member_docs if doc.get("customer_id")]
    customers = {}
    if customer_ids:
        cursor = db["customers"].find(
            {"customer_id": {"$in": customer_ids}},
            {"customer_id": 1, "name": 1},
        )
        customers = {
            doc["customer_id"]: doc.get("name", "Customer") async for doc in cursor
        }

    recent_signups = [
        {
            "id": doc.get("membership_id"),
            "customer_name": customers.get(doc.get("customer_id"), "Customer"),
            "plan": doc.get("plan_name", "Membership Plan"),
            "purchase_date": _format_date(doc.get("joined_at")),
            "expiry": _format_date(doc.get("expires_at")),
            "amount": doc.get("paid_amount", 0),
        }
        for doc in member_docs
    ]

    return {"plans": plans, "recent_signups": recent_signups}


@router.get("/plans")
async def list_plans(db=Depends(get_database), current_user=Depends(get_current_user)):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    cursor = db["membership_plans"].find({"brand_id": brand_id}).sort("price", 1)
    plans = [clean(doc) async for doc in cursor]
    return {"plans": plans}


@router.post("/plans", status_code=201)
async def create_plan(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    plan = {
        "plan_id": str(uuid.uuid4()),
        "brand_id": brand_id,
        "name": body.get("name", "New Plan"),
        "price": body.get("price", 499),
        "duration_days": body.get("duration_days", 365),
        "benefits": body.get("benefits", []),
        "welcome_points": body.get("welcome_points", 0),
        "cashback_pct": body.get("cashback_pct", 0),
        "active": True,
        "members_count": 0,
        "created_at": datetime.utcnow(),
    }
    await db["membership_plans"].insert_one(plan)
    return clean(plan)


@router.put("/plans/{plan_id}")
async def update_plan(
    plan_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    body.pop("_id", None)
    body.pop("plan_id", None)
    await db["membership_plans"].update_one({"plan_id": plan_id}, {"$set": body})
    return {"status": "updated"}


@router.get("/members")
async def list_members(
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=100),
    plan_id: str = Query(""),
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    query = {"brand_id": brand_id}
    if plan_id:
        query["plan_id"] = plan_id

    total = await db["membership_members"].count_documents(query)
    skip = (page - 1) * limit
    cursor = (
        db["membership_members"]
        .find(query)
        .sort("joined_at", -1)
        .skip(skip)
        .limit(limit)
    )
    members = [clean(doc) async for doc in cursor]
    return {"members": members, "total": total}


@router.post("/members", status_code=201)
async def enroll_member(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    plan = await db["membership_plans"].find_one(
        {"plan_id": body.get("plan_id"), "brand_id": brand_id}
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    duration = plan.get("duration_days", 365)
    member = {
        "membership_id": str(uuid.uuid4()),
        "brand_id": brand_id,
        "customer_id": body.get("customer_id"),
        "plan_id": body.get("plan_id"),
        "plan_name": plan.get("name"),
        "paid_amount": plan.get("price"),
        "joined_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=duration),
        "status": "active",
    }
    await db["membership_members"].insert_one(member)

    # Award welcome points
    if plan.get("welcome_points", 0) > 0:
        await db["customers"].update_one(
            {"customer_id": body.get("customer_id")},
            {"$inc": {"current_points_balance": plan["welcome_points"]}},
        )

    return clean(member)
