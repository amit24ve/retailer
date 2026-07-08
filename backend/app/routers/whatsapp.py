"""
WhatsApp Business API Integration — Bonvoice Partners API (v3)
Phone Number ID : settings.WHATSAPP_PHONE_NUMBER_ID
API Key         : settings.WHATSAPP_API_KEY (sent via the `apikey` header, per Bonvoice docs)

Docs reference: BONVOICE Partners API Documentation v3 — "Send Text Message"
    POST {WHATSAPP_API_BASE}/{phone_number_id}/messages
    Headers: Content-Type: application/json, apikey: YOUR_WABA_API_KEY
"""
import uuid
import logging
from datetime import datetime

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.core.config import settings
from app.core.security import get_current_user
from app.db.database import get_database

logger = logging.getLogger(__name__)
router = APIRouter()

# ── TEST MODE SAFETY CAP ────────────────────────────────────────────────────
# While settings.WHATSAPP_TEST_MODE is True, only the FIRST real send across
# the whole app (any customer, campaign, QR share, or order receipt) is
# actually sent to Bonvoice. Every send after that is short-circuited so no
# further payment is deducted while the integration is being verified.
# Resets when the server restarts, or via POST /whatsapp/test-mode/reset.
_test_mode_state = {"sent": 0}


def _test_mode_slot_available() -> bool:
    if not settings.WHATSAPP_TEST_MODE:
        return True
    return _test_mode_state["sent"] < 1


def _consume_test_mode_slot():
    if settings.WHATSAPP_TEST_MODE:
        _test_mode_state["sent"] += 1


def _clean_phone(to: str) -> str:
    return (to or "").replace("+", "").replace(" ", "").replace("-", "").strip()


def _messages_url() -> str:
    return f"{settings.WHATSAPP_API_BASE.rstrip('/')}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"


def _headers() -> dict:
    # Bonvoice Partners API authenticates via the `apikey` header, NOT Authorization: Bearer
    return {
        "Content-Type": "application/json",
        "apikey": settings.WHATSAPP_API_KEY,
    }


async def send_whatsapp_message(to: str, message: str) -> dict:
    """
    Send a plain-text WhatsApp message via the Bonvoice Partners API (v3).
    Returns {success, message_id, error, wa_link}.
    wa_link is always returned so the frontend can use it as a fallback (wa.me deep link).
    """
    phone = _clean_phone(to)
    if not phone:
        return {"success": False, "message_id": None, "error": "Empty phone number", "wa_link": ""}

    wa_link = f"https://wa.me/{phone}?text={message[:100]}"

    if not _test_mode_slot_available():
        logger.info(f"WA test mode: skipping send to {phone} (1-message test cap already used)")
        return {
            "success": False,
            "message_id": None,
            "error": "TEST_MODE_LIMIT_REACHED: Only 1 real WhatsApp message is allowed while testing (WHATSAPP_TEST_MODE=true). Set WHATSAPP_TEST_MODE=false in .env to send freely.",
            "wa_link": wa_link,
        }

    url = _messages_url()
    payload = {
        "messaging_product": "whatsapp",
        "preview_url": False,
        "recipient_type": "individual",
        "to": phone,
        "type": "text",
        "text": {"body": message},
    }

    # Reserve the test-mode slot before dispatching — the message is sent
    # (and billed) as soon as the request reaches Bonvoice, not when we
    # read the response.
    _consume_test_mode_slot()

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=_headers())
            data = resp.json() if resp.content else {}
            if resp.status_code in (200, 201):
                msg_id = None
                if data.get("messages"):
                    msg_id = data["messages"][0].get("id")
                logger.info(f"WA sent to {phone} | msg_id={msg_id}")
                return {"success": True, "message_id": msg_id, "error": None, "wa_link": wa_link}
            err = (data.get("error") or {}).get("message") or data.get("message") or str(data)[:200]
            last_error = f"[{resp.status_code}] {err}"
            logger.warning(f"WA send failed for {phone}: {last_error}")
            return {"success": False, "message_id": None, "error": last_error, "wa_link": wa_link}
    except httpx.TimeoutException:
        logger.warning(f"WA timeout sending to {phone}")
        return {"success": False, "message_id": None, "error": "Request to Bonvoice API timed out", "wa_link": wa_link}
    except httpx.ConnectError as e:
        logger.warning(f"WA connect error to {phone}: {e}")
        return {"success": False, "message_id": None, "error": f"Cannot connect to WhatsApp API: {str(e)[:120]}", "wa_link": wa_link}
    except Exception as exc:
        logger.error(f"WA error sending to {phone}: {exc}")
        # Network-level failure means the request likely never reached Bonvoice
        # (so nothing was billed) — give the test slot back.
        if settings.WHATSAPP_TEST_MODE:
            _test_mode_state["sent"] = max(0, _test_mode_state["sent"] - 1)
        return {"success": False, "message_id": None, "error": str(exc)[:200], "wa_link": wa_link}


async def send_whatsapp_template(to: str, template_name: str, language_code: str = "en_US", components: list = None) -> dict:
    """Send an approved HSM template message via the Bonvoice Partners API (v3)."""
    phone = _clean_phone(to)
    if not phone:
        return {"success": False, "message_id": None, "error": "Empty phone number"}

    url = _messages_url()
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": language_code},
            "components": components or [],
        },
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=_headers())
            data = resp.json() if resp.content else {}
            if resp.status_code in (200, 201):
                msg_id = None
                if data.get("messages"):
                    msg_id = data["messages"][0].get("id")
                return {"success": True, "message_id": msg_id, "error": None}
            err = (data.get("error") or {}).get("message") or data.get("message") or str(data)[:200]
            return {"success": False, "message_id": None, "error": f"[{resp.status_code}] {err}"}
    except Exception as exc:
        return {"success": False, "message_id": None, "error": str(exc)[:200]}


@router.get("/test-mode/status")
async def test_mode_status(current_user=Depends(get_current_user)):
    """Check whether test mode is on and whether the 1-message test slot is still available."""
    return {
        "test_mode": settings.WHATSAPP_TEST_MODE,
        "messages_sent": _test_mode_state["sent"],
        "slot_available": _test_mode_slot_available(),
    }


@router.post("/test-mode/reset")
async def test_mode_reset(current_user=Depends(get_current_user)):
    """Reset the test-mode counter, allowing one more real message to be sent."""
    _test_mode_state["sent"] = 0
    return {"status": "reset", "test_mode": settings.WHATSAPP_TEST_MODE}


@router.post("/send")
async def send_message_endpoint(
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Send a WhatsApp text message. Body: { to, message, customer_id? }"""
    to = body.get("to", "").strip()
    message = body.get("message", "").strip()
    if not to or not message:
        raise HTTPException(status_code=400, detail="'to' and 'message' are required")

    result = await send_whatsapp_message(to=to, message=message)

    customer_id = body.get("customer_id")
    if customer_id:
        await db["customer_timeline"].insert_one({
            "event_id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "event_type": "whatsapp_sent",
            "summary": f"WhatsApp sent: {message[:80]}{'...' if len(message) > 80 else ''}",
            "payload": {
                "to": to,
                "message": message,
                "message_id": result.get("message_id"),
                "success": result.get("success"),
                "by": current_user.get("full_name", "Agent"),
            },
            "created_at": datetime.utcnow(),
        })

    if result["success"]:
        return {"status": "sent", "message_id": result["message_id"], "to": to}
    else:
        raise HTTPException(status_code=502, detail=f"WhatsApp API error: {result['error']}")


@router.post("/send-template")
async def send_template_endpoint(
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Send a WhatsApp approved template. Body: { to, template_name, language_code?, components?, customer_id? }"""
    to = body.get("to", "").strip()
    template_name = body.get("template_name", "").strip()
    language_code = body.get("language_code", "en_US")
    components = body.get("components", [])

    if not to or not template_name:
        raise HTTPException(status_code=400, detail="'to' and 'template_name' are required")

    result = await send_whatsapp_template(to=to, template_name=template_name, language_code=language_code, components=components)

    customer_id = body.get("customer_id")
    if customer_id and result["success"]:
        await db["customer_timeline"].insert_one({
            "event_id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "event_type": "whatsapp_sent",
            "summary": f"WhatsApp template '{template_name}' sent",
            "payload": {
                "to": to,
                "template": template_name,
                "message_id": result.get("message_id"),
                "by": current_user.get("full_name", "Agent"),
            },
            "created_at": datetime.utcnow(),
        })

    if result["success"]:
        return {"status": "sent", "message_id": result["message_id"], "to": to}
    else:
        raise HTTPException(status_code=502, detail=f"WhatsApp API error: {result['error']}")
