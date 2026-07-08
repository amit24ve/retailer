import math
import uuid
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.core.security import get_current_user, get_data_scope
from app.db.database import get_database
from app.routers.whatsapp import send_whatsapp_message

router = APIRouter()
TIER_THRESHOLDS = {"Silver": 0, "Gold": 10000, "Platinum": 50000, "Diamond": 100000}
TIER_MULTIPLIERS = {"Silver": 1.0, "Gold": 1.25, "Platinum": 1.5, "Diamond": 2.0}
TIER_CASHBACK = {"Silver": 2.0, "Gold": 4.0, "Platinum": 6.0, "Diamond": 10.0}


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def compute_tier(lifetime_value: float) -> str:
    if lifetime_value >= 100000:
        return "Diamond"
    elif lifetime_value >= 50000:
        return "Platinum"
    elif lifetime_value >= 10000:
        return "Gold"
    return "Silver"


async def dispatch_whatsapp_receipt(db, customer_id: str, mobile: str, template: str, vars: dict):
    """
    Send the real purchase-receipt WhatsApp message via Bonvoice, then log the
    outcome (sent or skipped/failed) to the customer timeline.
    """
    summary_text = (
        f"Hi {vars.get('name') or 'there'}! Thanks for shopping at {vars.get('store')}. "
        f"You spent ₹{vars.get('amount')} and earned {vars.get('points')} points. 🎉"
    )
    result = {"success": False, "message_id": None, "error": "No mobile number on file"}
    if mobile and mobile != "unknown":
        phone = mobile if mobile.startswith("91") else f"91{mobile}"
        result = await send_whatsapp_message(to=phone, message=summary_text)

    await db["customer_timeline"].insert_one(
        {
            "event_id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "event_type": "whatsapp_sent",
            "summary": f"WhatsApp '{template}' {'sent' if result['success'] else 'not sent'}",
            "payload": {
                "template": template,
                "variables": vars,
                "status": "delivered" if result["success"] else "failed",
                "message_id": result.get("message_id"),
                "error": result.get("error"),
            },
            "created_at": datetime.utcnow(),
        }
    )
    return result.get("message_id")


@router.post("/orders", status_code=201)
async def create_pos_order(
    body: dict,
    background_tasks: BackgroundTasks,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id, store_id = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    customer_mobile = body.get("customer_mobile")
    customer_name = body.get("customer_name", "Walk-in Customer")
    gross = float(body.get("gross_amount", 0))
    tax = float(body.get("tax_amount", 0))
    discount = float(body.get("discount_amount", 0))
    net = float(body.get("net_amount", gross + tax - discount))
    redeem_pts = int(body.get("redeem_points_requested", 0))
    cashback_applied = float(body.get("apply_cashback_wallet", 0))
    invoice_number = body.get("invoice_number", f"INV-{uuid.uuid4().hex[:8].upper()}")
    store_code = body.get("store_code", "DEL-FLAGSHIP-01")

    # Find store
    store = await db["stores"].find_one({"store_code": store_code})
    store_id = store["store_id"] if store else "s1"
    store_name = store["name"] if store else "Unknown Store"

    # Find or create customer
    customer = None
    if customer_mobile:
        customer = await db["customers"].find_one(
            {"brand_id": brand_id, "mobile": customer_mobile}
        )

    if not customer:
        # Auto-create customer
        customer_id = str(uuid.uuid4())
        customer = {
            "customer_id": customer_id,
            "brand_id": brand_id,
            "tenant_id": tenant_id,
            "name": customer_name,
            "mobile": customer_mobile or "unknown",
            "loyalty_tier": "Silver",
            "lifetime_value": 0.0,
            "total_purchases": 0,
            "current_points_balance": 0,
            "cashback_wallet_balance": 0.0,
            "status": "active",
            "created_at": datetime.utcnow(),
        }
        await db["customers"].insert_one(customer)
    else:
        customer_id = customer["customer_id"]

    # Loyalty calculation
    current_tier = customer.get("loyalty_tier", "Silver")
    tier_multiplier = TIER_MULTIPLIERS.get(current_tier, 1.0)
    cashback_pct = TIER_CASHBACK.get(current_tier, 2.0)

    points_earned = math.floor((gross / 100) * 10 * tier_multiplier)
    cashback_earned = round(net * (cashback_pct / 100), 2)

    # Clamp redemption
    max_redeem = min(redeem_pts, customer.get("current_points_balance", 0))
    max_redeem = min(max_redeem, int(net * 0.5 / 0.1))  # max 50% of bill

    new_ltv = (customer.get("lifetime_value") or 0) + net
    new_tier = compute_tier(new_ltv)
    tier_upgraded = new_tier != current_tier

    # Update customer
    await db["customers"].update_one(
        {"customer_id": customer_id},
        {
            "$set": {
                "lifetime_value": new_ltv,
                "loyalty_tier": new_tier,
                "last_purchase_date": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
            "$inc": {
                "current_points_balance": points_earned - max_redeem,
                "lifetime_points_earned": points_earned,
                "total_purchases": 1,
                "cashback_wallet_balance": cashback_earned - cashback_applied,
            },
        },
    )

    # Create order
    order_id = str(uuid.uuid4())
    await db["orders"].insert_one(
        {
            "order_id": order_id,
            "brand_id": brand_id,
            "tenant_id": tenant_id,
            "store_id": store_id,
            "store_name": store_name,
            "customer_id": customer_id,
            "customer_name": customer.get("name", customer_name),
            "invoice_number": invoice_number,
            "gross_amount": gross,
            "tax_amount": tax,
            "discount_amount": discount,
            "net_amount": net,
            "points_earned": points_earned,
            "points_redeemed": max_redeem,
            "cashback_wallet_applied": cashback_applied,
            "payment_status": "completed",
            "items": body.get("items", []),
            "created_at": datetime.utcnow(),
        }
    )

    # Loyalty ledger entry
    await db["loyalty_ledger"].insert_one(
        {
            "ledger_id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "store_id": store_id,
            "transaction_type": "earn",
            "points_delta": points_earned,
            "cashback_delta": cashback_earned,
            "reference_invoice": invoice_number,
            "created_at": datetime.utcnow(),
            "is_expired": False,
        }
    )

    # Timeline events
    await db["customer_timeline"].insert_one(
        {
            "event_id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "event_type": "order_completed",
            "reference_id": order_id,
            "summary": f"Purchased invoice {invoice_number}",
            "payload": {
                "invoice_number": invoice_number,
                "net_amount": net,
                "points_allocated": points_earned,
                "store": store_name,
            },
            "created_at": datetime.utcnow(),
        }
    )

    if tier_upgraded:
        await db["customer_timeline"].insert_one(
            {
                "event_id": str(uuid.uuid4()),
                "customer_id": customer_id,
                "event_type": "tier_upgrade",
                "summary": f"Tier upgraded from {current_tier} to {new_tier}",
                "payload": {
                    "from": current_tier,
                    "to": new_tier,
                    "trigger_spend": f"₹{net:,.2f}",
                },
                "created_at": datetime.utcnow(),
            }
        )

    # Background: WhatsApp notification (real send via Bonvoice, capped by test mode)
    background_tasks.add_task(
        dispatch_whatsapp_receipt,
        db,
        customer_id,
        customer.get("mobile", ""),
        "purchase_receipt",
        {
            "name": customer.get("name"),
            "store": store_name,
            "amount": net,
            "points": points_earned,
        },
    )

    # Refresh customer
    updated_customer = await db["customers"].find_one({"customer_id": customer_id})

    return {
        "status": "success",
        "transaction_id": order_id,
        "invoice_number": invoice_number,
        "customer": {
            "customer_id": customer_id,
            "name": updated_customer.get("name"),
            "mobile": updated_customer.get("mobile"),
            "new_tier": new_tier,
            "previous_tier": current_tier,
            "wallet_balance_inr": round(
                float(updated_customer.get("cashback_wallet_balance") or 0), 2
            ),
            "points_balance": int(updated_customer.get("current_points_balance") or 0),
        },
        "loyalty_valuation": {
            "points_earned": points_earned,
            "points_redeemed": max_redeem,
            "cashback_wallet_earned": cashback_earned,
            "cashback_wallet_debited": cashback_applied,
        },
        "comms_dispatched": {
            "whatsapp_status": "queued",
            "message_id": f"wa_msg_{str(uuid.uuid4())[:8]}",
        },
    }


@router.get("/orders")
async def list_orders(db=Depends(get_database), current_user=Depends(get_current_user)):
    brand_id, store_id = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "tenant-fashion-group-001")
    query = {}
    if brand_id:
        query["brand_id"] = brand_id
    if store_id:
        query["store_id"] = store_id
    cursor = db["orders"].find(query).sort("created_at", -1).limit(50)
    orders = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        orders.append(doc)
    return {"orders": orders}
