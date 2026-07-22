import math
import uuid
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.core.security import get_current_user, get_data_scope
from app.core.sms import render_sms_template, send_to_customer_channels
from app.db.database import get_database

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


async def dispatch_order_notification(db, customer: dict, brand_id: str, channels, template: str, vars: dict):
    """
    Send the purchase receipt over selected channels, then log outcomes.
    """
    summary_text = render_sms_template(
        template,
        {
            "name": vars.get("name") or "Customer",
            "store": vars.get("store") or "our store",
            "amount": vars.get("amount") or 0,
            "points": vars.get("points") or 0,
        },
        fallback=(
            f"Hi {vars.get('name') or 'Customer'}, thanks for shopping at {vars.get('store')}. "
            f"Bill amount Rs {vars.get('amount')}. You earned {vars.get('points')} points. Best wishes AVOPAY."
        ),
    )
    return await send_to_customer_channels(
        db,
        customer=customer,
        brand_id=brand_id,
        channels=channels,
        message=summary_text,
        template_key=template,
        actor="POS",
    )


@router.post("/orders", status_code=201)
@router.post("/pos/orders", status_code=201)
@router.post("/orders/pos", status_code=201)
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
    requested_store_id = body.get("store_id") or store_id
    store_code = body.get("store_code")

    # Find store without breaking store-scoped users. Older frontend screens send
    # store_code, store-manager POS sends store_id.
    store = None
    if store_code:
        store = await db["stores"].find_one({"store_code": store_code, "brand_id": brand_id})
    if not store and requested_store_id:
        store = await db["stores"].find_one({"store_id": requested_store_id, "brand_id": brand_id})
    store_id = (store or {}).get("store_id") or requested_store_id
    store_name = (store or {}).get("name") or body.get("store_name") or current_user.get("store_name") or "Unknown Store"

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
            "customer_mobile": customer_mobile,
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

    notification_channels = body.get("notification_channels") or body.get("channels") or ["whatsapp"]

    # Background: purchase notification over selected channels
    background_tasks.add_task(
        dispatch_order_notification,
        db,
        customer,
        brand_id,
        notification_channels,
        "purchase_receipt",
        {
            "name": customer.get("name"),
            "store": store_name,
            "amount": net,
            "points": points_earned,
        },
    )

    # Resolve customer email and trigger order emails
    customer_email = body.get("customer_email") or customer.get("email")
    if not customer_email or customer_email == "unknown":
        manager = await db["users"].find_one({"store_id": store_id, "role": "Store Manager"})
        if manager:
            customer_email = manager["email"]
        else:
            owner = await db["users"].find_one({"brand_id": brand_id, "role": "Brand Owner"})
            if owner:
                customer_email = owner["email"]

    if customer_email:
        try:
            from app.core.email import send_email
            from app.core.templates import (
                get_new_purchase_order_email,
                get_payment_successful_email,
                get_invoice_generated_email
            )
            # New purchase order email
            po_html = get_new_purchase_order_email(invoice_number, net, customer.get("name", customer_name), store_name)
            await send_email("new_purchase_order_created", customer_email, f"New Purchase Order - {invoice_number}", po_html)

            # Payment successful email
            pay_html = get_payment_successful_email(invoice_number, net)
            await send_email("payment_successful", customer_email, f"Payment Received - {invoice_number}", pay_html)

            # Invoice generated email
            inv_html = get_invoice_generated_email(invoice_number, net)
            await send_email("invoice_generated", customer_email, f"Invoice Generated - {invoice_number}", inv_html)
        except Exception:
            pass

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


# ─── ORDER WORKFLOW & PAYMENT ENDPOINTS ───────────────────────────────────────
async def _get_order_customer_email(order: dict, db) -> str:
    """Helper to resolve customer email with fallback."""
    customer = await db["customers"].find_one({"customer_id": order.get("customer_id")})
    if customer and customer.get("email") and customer.get("email") != "unknown":
        return customer["email"]
    
    # Fallback to store manager or brand owner
    store_id = order.get("store_id")
    brand_id = order.get("brand_id")
    manager = await db["users"].find_one({"store_id": store_id, "role": "Store Manager"})
    if manager:
        return manager["email"]
    owner = await db["users"].find_one({"brand_id": brand_id, "role": "Brand Owner"})
    if owner:
        return owner["email"]
    return None


@router.post("/orders/{order_id}/accept")
async def accept_order(
    order_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    order = await db["orders"].find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db["orders"].update_one({"order_id": order_id}, {"$set": {"status": "accepted"}})
    recipient = await _get_order_customer_email(order, db)

    if recipient:
        try:
            from app.core.email import send_email
            from app.core.templates import get_order_accepted_email
            html = get_order_accepted_email(order["invoice_number"])
            await send_email("order_accepted", recipient, f"Order Accepted - {order['invoice_number']}", html)
        except Exception:
            pass

    return {"success": True, "status": "accepted"}


@router.post("/orders/{order_id}/reject")
async def reject_order(
    order_id: str,
    payload: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    order = await db["orders"].find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    reason = payload.get("reason", "Out of stock or store closing.")
    await db["orders"].update_one({"order_id": order_id}, {"$set": {"status": "rejected", "rejection_reason": reason}})
    recipient = await _get_order_customer_email(order, db)

    if recipient:
        try:
            from app.core.email import send_email
            from app.core.templates import get_order_rejected_email
            html = get_order_rejected_email(order["invoice_number"], reason)
            await send_email("order_rejected", recipient, f"Order Rejected - {order['invoice_number']}", html)
        except Exception:
            pass

    return {"success": True, "status": "rejected"}


@router.post("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    order = await db["orders"].find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db["orders"].update_one({"order_id": order_id}, {"$set": {"status": "cancelled"}})
    recipient = await _get_order_customer_email(order, db)

    if recipient:
        try:
            from app.core.email import send_email
            from app.core.templates import get_order_cancelled_email
            html = get_order_cancelled_email(order["invoice_number"])
            await send_email("order_cancelled", recipient, f"Order Cancelled - {order['invoice_number']}", html)
        except Exception:
            pass

    return {"success": True, "status": "cancelled"}


@router.post("/orders/{order_id}/dispatch")
async def dispatch_order(
    order_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    order = await db["orders"].find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db["orders"].update_one({"order_id": order_id}, {"$set": {"status": "dispatched"}})
    recipient = await _get_order_customer_email(order, db)

    if recipient:
        try:
            from app.core.email import send_email
            from app.core.templates import get_order_dispatched_email
            html = get_order_dispatched_email(order["invoice_number"])
            await send_email("order_dispatched", recipient, f"Order Dispatched 🚚 - {order['invoice_number']}", html)
        except Exception:
            pass

    return {"success": True, "status": "dispatched"}


@router.post("/orders/{order_id}/deliver")
async def deliver_order(
    order_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    order = await db["orders"].find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db["orders"].update_one({"order_id": order_id}, {"$set": {"status": "delivered"}})
    recipient = await _get_order_customer_email(order, db)

    if recipient:
        try:
            from app.core.email import send_email
            from app.core.templates import get_order_delivered_email
            html = get_order_delivered_email(order["invoice_number"])
            await send_email("order_delivered", recipient, f"Order Delivered 🎉 - {order['invoice_number']}", html)
        except Exception:
            pass

    return {"success": True, "status": "delivered"}


@router.post("/orders/{order_id}/return")
async def return_order(
    order_id: str,
    payload: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    order = await db["orders"].find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    amount = float(payload.get("amount", order.get("net_amount", 0)))
    await db["orders"].update_one({"order_id": order_id}, {"$set": {"status": "returned", "return_amount": amount}})
    recipient = await _get_order_customer_email(order, db)

    if recipient:
        try:
            from app.core.email import send_email
            from app.core.templates import get_order_returned_email
            html = get_order_returned_email(order["invoice_number"], amount)
            await send_email("order_returned", recipient, f"Order Returned - {order['invoice_number']}", html)
        except Exception:
            pass

    return {"success": True, "status": "returned", "return_amount": amount}


@router.post("/orders/{order_id}/refund")
async def refund_order(
    order_id: str,
    payload: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    order = await db["orders"].find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    amount = float(payload.get("amount", order.get("net_amount", 0)))
    await db["orders"].update_one(
        {"order_id": order_id},
        {"$set": {"payment_status": "refunded", "refund_amount": amount}}
    )
    recipient = await _get_order_customer_email(order, db)

    if recipient:
        try:
            from app.core.email import send_email
            from app.core.templates import get_refund_processed_email
            html = get_refund_processed_email(order["invoice_number"], amount)
            await send_email("refund_processed", recipient, f"Refund Processed - {order['invoice_number']}", html)
        except Exception:
            pass

    return {"success": True, "payment_status": "refunded", "refund_amount": amount}


@router.post("/orders/{order_id}/payment-failed")
async def payment_failed(
    order_id: str,
    payload: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    order = await db["orders"].find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    amount = float(payload.get("amount", order.get("net_amount", 0)))
    error_msg = payload.get("error", "Declined by issuing bank.")
    await db["orders"].update_one(
        {"order_id": order_id},
        {"$set": {"payment_status": "failed", "payment_error": error_msg}}
    )
    recipient = await _get_order_customer_email(order, db)

    if recipient:
        try:
            from app.core.email import send_email
            from app.core.templates import get_payment_failed_email
            html = get_payment_failed_email(order["invoice_number"], amount, error_msg)
            await send_email("payment_failed", recipient, "Payment Failed - Action Required", html)
        except Exception:
            pass

    return {"success": True, "payment_status": "failed", "error_message": error_msg}
