import logging
import json
import os
import re
import uuid
from datetime import datetime
from math import ceil
from typing import Iterable

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

SMS_TEMPLATES = {
    "campaign_offer": {
        "title": "Campaign Offer",
        "message": "Hi {name}, {brand} has a special offer for you: {offer}. Use code {coupon_code}. Visit us today. Best wishes AVOPAY.",
    },
    "campaign_info": {
        "title": "Campaign Information",
        "message": "Hi {name}, update from {brand}: {message}. Best wishes AVOPAY.",
    },
    "welcome_customer": {
        "title": "Welcome Customer",
        "message": "Welcome to {brand}, {name}. Your loyalty account is active. Tier: {tier}. Referral code: {referral_code}. Best wishes AVOPAY.",
    },
    "purchase_receipt": {
        "title": "Purchase Receipt",
        "message": "Hi {name}, thanks for shopping at {store}. Bill amount Rs {amount}. You earned {points} points. Best wishes AVOPAY.",
    },
    "points_update": {
        "title": "Points Update",
        "message": "Hi {name}, your {brand} points balance is {points} points. Keep shopping to unlock more rewards. Best wishes AVOPAY.",
    },
    "tier_upgrade": {
        "title": "Tier Upgrade",
        "message": "Congratulations {name}. You are now a {tier} member at {brand}. Enjoy your upgraded benefits. Best wishes AVOPAY.",
    },
    "birthday_offer": {
        "title": "Birthday Offer",
        "message": "Happy Birthday {name}. {brand} has a special birthday offer for you: {offer}. Valid for a limited time. Best wishes AVOPAY.",
    },
    "anniversary_offer": {
        "title": "Anniversary Offer",
        "message": "Happy Anniversary {name}. {brand} is celebrating with you. Enjoy {offer} on your next visit. Best wishes AVOPAY.",
    },
    "referral_invite": {
        "title": "Referral Invite",
        "message": "Hi {name}, invite your friend to {brand}. Share this referral link or code: {referral_code}. Rewards apply after signup. Best wishes AVOPAY.",
    },
    "qr_share": {
        "title": "QR Link Share",
        "message": "Hi, here is your {brand} QR link for {qr_name}: {qr_url}. Best wishes AVOPAY.",
    },
    "feedback_request": {
        "title": "Feedback Request",
        "message": "Hi {name}, thanks for visiting {brand}. Please share your feedback here: {feedback_url}. Best wishes AVOPAY.",
    },
    "membership_update": {
        "title": "Membership Update",
        "message": "Hi {name}, your {brand} membership {plan} is active until {expires_at}. Enjoy your benefits. Best wishes AVOPAY.",
    },
}

_sms_test_state = {"sent": 0}


def normalize_channels(value) -> list[str]:
    if value is None:
        return ["whatsapp"]
    if isinstance(value, str):
        raw = [value]
    elif isinstance(value, Iterable):
        raw = list(value)
    else:
        raw = ["whatsapp"]

    channels: list[str] = []
    for item in raw:
        channel = str(item or "").strip().lower()
        if channel == "both":
            channels.extend(["whatsapp", "sms"])
        elif channel in ("whatsapp", "sms", "email"):
            channels.append(channel)
    return list(dict.fromkeys(channels)) or ["whatsapp"]


def clean_phone(number: str) -> str:
    digits = re.sub(r"\D+", "", number or "")
    if len(digits) == 10:
        return f"91{digits}"
    return digits


def render_sms_template(template_key: str, variables: dict | None = None, fallback: str = "") -> str:
    variables = variables or {}
    template = SMS_TEMPLATES.get(template_key, {})
    text = template.get("message") or fallback
    safe_vars = {k: "" if v is None else str(v) for k, v in variables.items()}
    try:
        return text.format(**safe_vars)
    except KeyError:
        return fallback or text


def sms_units(message: str) -> int:
    if not message:
        return 0
    is_unicode = any(ord(ch) > 127 for ch in message)
    single_limit = 70 if is_unicode else 160
    multipart_limit = 67 if is_unicode else 153
    if len(message) <= single_limit:
        return 1
    return ceil(len(message) / multipart_limit)


def get_mtalkz_template_id(template_key: str | None) -> str:
    key = (template_key or "").strip().lower()
    if key in ("otp", "otp_login", "otp_template"):
        return settings.MTALKZ_DLT_TEMPLATE_ID

    env_key = f"MTALKZ_TEMPLATE_ID_{key.upper()}"
    direct = os.getenv(env_key, "").strip()
    if direct:
        return direct

    raw_mapping = (settings.MTALKZ_TEMPLATE_IDS or "").strip()
    if not raw_mapping:
        return ""
    try:
        parsed = json.loads(raw_mapping)
        return str(parsed.get(key, "")).strip()
    except Exception:
        for item in raw_mapping.split(","):
            if ":" not in item:
                continue
            item_key, item_value = item.split(":", 1)
            if item_key.strip().lower() == key:
                return item_value.strip()
    return ""


async def send_sms_message(to: str, message: str, template_id: str | None = None) -> dict:
    phone = clean_phone(to)
    if not phone:
        return {"success": False, "message_id": None, "error": "Empty phone number", "raw": None}
    if not message:
        return {"success": False, "message_id": None, "error": "Empty message", "raw": None}
    if not settings.MTALKZ_API_KEY:
        return {"success": False, "message_id": None, "error": "MTALKZ_API_KEY is not configured", "raw": None}
    if settings.SMS_TEST_MODE and _sms_test_state["sent"] >= 1:
        return {
            "success": False,
            "message_id": None,
            "error": "SMS_TEST_MODE_LIMIT_REACHED",
            "raw": None,
        }

    dlt_template_id = template_id or ""
    payload = {
        "apikey": settings.MTALKZ_API_KEY,
        "senderid": settings.MTALKZ_SENDER_ID,
        "number": phone,
        "message": message,
        "format": "json",
    }
    if dlt_template_id:
        payload["template_id"] = dlt_template_id
        payload["tempid"] = dlt_template_id
        payload["templateid"] = dlt_template_id
    if settings.MTALKZ_PE_ID:
        payload["pe_id"] = settings.MTALKZ_PE_ID
        payload["peid"] = settings.MTALKZ_PE_ID

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(settings.MTALKZ_API_URL, json=payload)
            try:
                data = response.json()
            except ValueError:
                data = {"text": response.text[:500]}

        status_value = str(data.get("status", "")).lower()
        success = response.status_code in (200, 201) and status_value in ("ok", "true", "success", "submitted", "s")
        if not success and response.status_code in (200, 201):
            raw_data = data.get("data")
            if isinstance(raw_data, list):
                success = any(str(item.get("status", "")).lower() in ("submitted", "ok", "success") for item in raw_data)

        message_id = None
        raw_data = data.get("data")
        if isinstance(raw_data, list) and raw_data:
            message_id = raw_data[0].get("id") or raw_data[0].get("msgid")
        message_id = message_id or data.get("id") or data.get("msgid") or data.get("message_id")

        if success:
            if settings.SMS_TEST_MODE:
                _sms_test_state["sent"] += 1
            return {"success": True, "message_id": message_id, "error": None, "raw": data}

        error = data.get("message") or data.get("error") or response.text[:200]
        return {"success": False, "message_id": message_id, "error": f"[{response.status_code}] {error}", "raw": data}
    except httpx.TimeoutException:
        return {"success": False, "message_id": None, "error": "Request to mTalkz API timed out", "raw": None}
    except Exception as exc:
        logger.exception("SMS send failed")
        return {"success": False, "message_id": None, "error": str(exc)[:200], "raw": None}


async def get_sms_balance() -> dict:
    if not settings.MTALKZ_API_KEY:
        return {"success": False, "error": "MTALKZ_API_KEY is not configured"}
    url = settings.MTALKZ_API_URL.rstrip("/")
    balance_url = url.rsplit("/", 1)[0] + "/V2/http-balance-api.php" if url.endswith("/api") else url + "/V2/http-balance-api.php"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(balance_url, params={"apikey": settings.MTALKZ_API_KEY, "format": "json"})
            data = response.json() if response.content else {}
            if response.status_code == 200 and data.get("status") != 404 and "Not Found" not in str(data):
                return {"success": True, "data": data}

            probe = await client.post(
                settings.MTALKZ_API_URL,
                json={"apikey": settings.MTALKZ_API_KEY, "senderid": settings.MTALKZ_SENDER_ID},
            )
            probe_data = probe.json() if probe.content else {}
        return {
            "success": probe.status_code == 200 and probe_data.get("status") not in ("AZQ02", "AZQ05"),
            "data": probe_data,
            "message": "Balance route is unavailable on this mTalkz host; provider connectivity was probed instead.",
        }
    except Exception as exc:
        return {"success": False, "error": str(exc)[:200]}


async def ensure_brand_credits(db, brand_id: str, channel: str, units: int = 1) -> tuple[bool, str]:
    if channel == "sms":
        field = "credits.sms"
    elif channel == "email":
        field = "credits.email"
    else:
        field = "credits.wa_marketing"
    brand = await db["brands"].find_one({"brand_id": brand_id}, {"credits": 1})
    available = ((brand or {}).get("credits") or {}).get(field.split(".")[1], 0) or 0
    if available < units:
        return False, f"Insufficient {channel} credits"
    return True, ""


async def deduct_brand_credits(db, brand_id: str, channel: str, units: int = 1):
    if not brand_id or units <= 0:
        return
    if channel == "sms":
        field = "credits.sms"
    elif channel == "email":
        field = "credits.email"
    else:
        field = "credits.wa_marketing"
    await db["brands"].update_one(
        {"brand_id": brand_id},
        {"$inc": {field: -units}, "$set": {"updated_at": datetime.utcnow()}},
    )


async def log_message(
    db,
    *,
    brand_id: str,
    customer_id: str | None,
    channel: str,
    to: str,
    message: str,
    result: dict,
    template_key: str = "custom",
    campaign_id: str | None = None,
    units: int = 1,
    actor: str = "System",
):
    event_id = str(uuid.uuid4())
    doc = {
        "event_id": event_id,
        "brand_id": brand_id,
        "customer_id": customer_id,
        "campaign_id": campaign_id,
        "channel": channel,
        "to": to,
        "template_key": template_key,
        "message": message,
        "units": units,
        "success": bool(result.get("success")),
        "provider_message_id": result.get("message_id"),
        "error": result.get("error"),
        "created_at": datetime.utcnow(),
    }
    await db["message_logs"].insert_one(doc)
    if customer_id:
        await db["customer_timeline"].insert_one(
            {
                "event_id": event_id,
                "customer_id": customer_id,
                "event_type": f"{channel}_sent",
                "summary": f"{channel.upper()} {'sent' if result.get('success') else 'failed'}: {message[:80]}{'...' if len(message) > 80 else ''}",
                "payload": {
                    "to": to,
                    "message": message,
                    "message_id": result.get("message_id"),
                    "success": result.get("success"),
                    "error": result.get("error"),
                    "template_key": template_key,
                    "campaign_id": campaign_id,
                    "units": units,
                    "by": actor,
                },
                "created_at": datetime.utcnow(),
            }
        )
    return doc


async def send_to_customer_channels(
    db,
    *,
    customer: dict,
    brand_id: str,
    channels,
    message: str,
    template_key: str = "custom",
    campaign_id: str | None = None,
    actor: str = "System",
) -> dict:
    channels = normalize_channels(channels)

    results = []
    sent = 0
    failed = 0
    for channel in channels:
        if channel == "sms":
            phone = clean_phone(customer.get("mobile", ""))
            if not phone:
                result = {"success": False, "message_id": None, "error": "No mobile number"}
                to_addr = "unknown"
                units = 1
            else:
                to_addr = phone
                units = sms_units(message)
                ok, reason = await ensure_brand_credits(db, brand_id, "sms", units)
                if not ok:
                    result = {"success": False, "message_id": None, "error": reason}
                else:
                    result = await send_sms_message(phone, message, template_id=get_mtalkz_template_id(template_key))
                    if result.get("success"):
                        await deduct_brand_credits(db, brand_id, "sms", units)
        elif channel == "email":
            email = customer.get("email")
            if not email or email == "unknown":
                result = {"success": False, "message_id": None, "error": "No email address"}
                to_addr = "unknown"
                units = 1
            else:
                to_addr = email
                units = 1
                ok, reason = await ensure_brand_credits(db, brand_id, "email", units)
                if not ok:
                    result = {"success": False, "message_id": None, "error": reason}
                else:
                    from app.core.email import send_email

                    campaign_subject = "Special Campaign Offer"
                    campaign_image = None
                    if campaign_id:
                        campaign_doc = await db["campaigns"].find_one({"campaign_id": campaign_id}, {"name": 1, "image": 1})
                        if campaign_doc:
                            if campaign_doc.get("name"):
                                campaign_subject = campaign_doc.get("name")
                            if campaign_doc.get("image"):
                                campaign_image = campaign_doc.get("image")

                    brand = await db["brands"].find_one({"brand_id": brand_id}, {"name": 1})
                    brand_name = (brand or {}).get("name") or "Retailer"

                    image_html = ""
                    if campaign_image:
                        image_html = f'<div style="text-align: center; margin-bottom: 20px;"><img src="{campaign_image}" style="width: 100%; max-width: 560px; height: auto; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.06);" alt="Offer Banner" /></div>'

                    html_content = f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>{campaign_subject}</title>
                    </head>
                    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 10px;">
                            <tr>
                                <td align="center">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
                                        <!-- Header Banner -->
                                        <tr>
                                            <td style="background: linear-gradient(135deg, #0891b2 0%, #0369a1 100%); padding: 32px; text-align: center;">
                                                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">{brand_name}</h1>
                                            </td>
                                        </tr>
                                        <!-- Content Body -->
                                        <tr>
                                            <td style="padding: 32px; background-color: #ffffff;">
                                                {image_html}
                                                <h2 style="color: #1e293b; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 800; line-height: 1.3;">{campaign_subject}</h2>
                                                <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; white-space: pre-line;">{message}</p>
                                                
                                                <div style="text-align: center; margin: 32px 0 16px 0;">
                                                    <a href="https://retailer.avopay.pro" style="background-color: #0891b2; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(8, 145, 178, 0.25);">Shop Exclusive Deals</a>
                                                </div>
                                            </td>
                                        </tr>
                                        <!-- Footer -->
                                        <tr>
                                            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #f1f5f9; text-align: center;">
                                                <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
                                                    You received this email because you are a registered customer of <strong>{brand_name}</strong>.
                                                </p>
                                                <p style="font-size: 11px; color: #cbd5e1; margin-top: 8px; margin-bottom: 0;">
                                                    &copy; {datetime.utcnow().year} {brand_name}. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    """

                    email_success = await send_email(
                        event_name="campaign_email",
                        recipient=email,
                        subject=campaign_subject,
                        html_content=html_content,
                        sender_name=brand_name
                    )

                    if email_success:
                        result = {"success": True, "message_id": f"mail-{uuid.uuid4()}"}
                        await deduct_brand_credits(db, brand_id, "email", units)
                    else:
                        result = {"success": False, "message_id": None, "error": "SMTP send failed"}
        else:
            phone = clean_phone(customer.get("mobile", ""))
            if not phone:
                result = {"success": False, "message_id": None, "error": "No mobile number"}
                to_addr = "unknown"
                units = 1
            else:
                to_addr = phone
                units = 1
                ok, reason = await ensure_brand_credits(db, brand_id, "whatsapp", units)
                if not ok:
                    result = {"success": False, "message_id": None, "error": reason}
                else:
                    from app.routers.whatsapp import send_whatsapp_message

                    result = await send_whatsapp_message(to=phone, message=message)
                    if result.get("success"):
                        await deduct_brand_credits(db, brand_id, "whatsapp", units)

        await log_message(
            db,
            brand_id=brand_id,
            customer_id=customer.get("customer_id"),
            channel=channel,
            to=to_addr,
            message=message,
            result=result,
            template_key=template_key,
            campaign_id=campaign_id,
            units=units,
            actor=actor,
        )
        results.append({"channel": channel, **result, "units": units})
        if result.get("success"):
            sent += 1
        else:
            failed += 1

    return {"sent": sent, "failed": failed, "results": results}
