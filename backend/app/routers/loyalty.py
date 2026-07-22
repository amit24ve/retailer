import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user, get_data_scope
from app.db.database import get_database

router = APIRouter()


DEFAULT_TIERS = {
    "silver": {
        "min_points": 0,
        "benefits": ["Base points on every purchase", "Birthday rewards"],
    },
    "gold": {
        "min_points": 5000,
        "benefits": ["10% bonus points", "Priority support", "Exclusive coupons"],
    },
    "platinum": {
        "min_points": 10000,
        "benefits": ["20% bonus points", "Free delivery", "Early sale access"],
    },
    "diamond": {
        "min_points": 15000,
        "benefits": ["30% bonus points", "VIP support", "Quarterly premium rewards"],
    },
}


def _store_scope_filter(store_id: str) -> dict:
    return {"$or": [{"store_id": store_id}, {"store_ids": store_id}]}


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("")
async def get_loyalty_program(
    db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id, store_id = get_data_scope(current_user)

    rule_query = {}
    if brand_id:
        rule_query["brand_id"] = brand_id

    rules = [
        clean(doc)
        async for doc in db["loyalty_rules"]
        .find(rule_query)
        .sort("created_at", -1)
    ]
    active_rules = [rule for rule in rules if rule.get("is_active", True)]
    primary_rule = next(
        (rule for rule in active_rules if rule.get("actions", {}).get("points_per_100")),
        None,
    ) or next(
        (
            rule
            for rule in active_rules
            if rule.get("rule_type") in {"points_earning", "amount_spent"}
        ),
        active_rules[0] if active_rules else None,
    )

    actions = (primary_rule or {}).get("actions", {})
    points_per_100 = actions.get("points_per_100")
    earn_per_rupee = int(100 / points_per_100) if points_per_100 else 10

    program = {
        "type": (primary_rule or {}).get("rule_type", "amount_spent"),
        "name": (primary_rule or {}).get("name", "Loyalty Program"),
        "earn_per_rupee": earn_per_rupee,
        "redemption_rate": actions.get("redemption_rate", 100),
        "redemption_value": actions.get("redemption_value", 10),
        "min_redemption_points": actions.get("min_redemption_points", 200),
        "points_expiry_days": actions.get("points_expiry_days", 365),
        "tiers": actions.get("tiers", DEFAULT_TIERS),
        "is_active": bool(primary_rule.get("is_active", True)) if primary_rule else False,
    }

    customer_filters = []
    if brand_id:
        customer_filters.append({"brand_id": brand_id})
    if store_id:
        customer_filters.append(_store_scope_filter(store_id))
    customer_query = {"$and": customer_filters} if customer_filters else {}

    pipeline = [
        {"$match": customer_query},
        {"$group": {"_id": "$loyalty_tier", "count": {"$sum": 1}}},
    ]
    tier_counts = await db["customers"].aggregate(pipeline).to_list(None)
    distribution = {tier: 0 for tier in DEFAULT_TIERS}
    for item in tier_counts:
        tier = str(item.get("_id") or "Silver").lower()
        if tier in distribution:
            distribution[tier] = item.get("count", 0)

    return {
        "loyalty": {
            "program": program,
            "rules": rules,
        },
        "distribution": distribution,
    }


@router.get("/rules")
async def list_rules(db=Depends(get_database), current_user=Depends(get_current_user)):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    cursor = db["loyalty_rules"].find({"brand_id": brand_id})
    rules = [clean(doc) async for doc in cursor]
    return {"rules": rules}


@router.post("/rules", status_code=201)
async def create_rule(
    body: dict, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    rule = {
        "rule_id": str(uuid.uuid4()),
        "brand_id": brand_id,
        "name": body.get("name"),
        "rule_type": body.get("rule_type", "points_earning"),
        "conditions": body.get("conditions", {}),
        "actions": body.get("actions", {}),
        "is_active": body.get("is_active", True),
        "start_date": datetime.utcnow(),
        "end_date": None,
        "created_at": datetime.utcnow(),
    }
    await db["loyalty_rules"].insert_one(rule)
    return clean(rule)


@router.put("/rules/{rule_id}")
async def update_rule(
    rule_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    body.pop("_id", None)
    body.pop("rule_id", None)
    result = await db["loyalty_rules"].update_one({"rule_id": rule_id}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"status": "updated"}


@router.delete("/rules/{rule_id}")
async def delete_rule(
    rule_id: str, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    result = await db["loyalty_rules"].delete_one({"rule_id": rule_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"status": "deleted"}


@router.get("/ledger/{customer_id}")
async def get_ledger(
    customer_id: str, db=Depends(get_database), current_user=Depends(get_current_user)
):
    brand_id = current_user.get("brand_id", "")
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    cursor = (
        db["loyalty_ledger"]
        .find({"customer_id": customer_id})
        .sort("created_at", -1)
        .limit(50)
    )
    entries = [clean(doc) async for doc in cursor]
    return {"customer_id": customer_id, "entries": entries}
