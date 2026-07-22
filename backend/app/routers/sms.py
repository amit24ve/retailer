from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.core.sms import SMS_TEMPLATES, get_mtalkz_template_id, get_sms_balance, send_sms_message, sms_units
from app.db.database import get_database

router = APIRouter()


@router.get("/templates")
async def list_sms_templates(current_user=Depends(get_current_user)):
    return {"templates": SMS_TEMPLATES}


@router.get("/settings")
async def get_sms_settings(
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    brand = await db["brands"].find_one({"brand_id": brand_id}, {"settings.messaging": 1})
    messaging = (((brand or {}).get("settings") or {}).get("messaging") or {})
    return {
        "sms_header_mode": messaging.get("sms_header_mode", "default"),
        "custom_sender_id": messaging.get("custom_sender_id", ""),
        "otp_channel": messaging.get("otp_channel", "sms"),
    }


@router.post("/settings")
async def save_sms_settings(
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    brand_id = current_user.get("brand_id", "")
    sms_header_mode = body.get("sms_header_mode", "default")
    if sms_header_mode not in ("default", "custom"):
        raise HTTPException(status_code=400, detail="Invalid sms_header_mode")
    custom_sender_id = (body.get("custom_sender_id") or "").strip().upper()
    otp_channel = body.get("otp_channel", "sms")
    if otp_channel not in ("sms", "whatsapp", "both"):
        raise HTTPException(status_code=400, detail="Invalid otp_channel")

    await db["brands"].update_one(
        {"brand_id": brand_id},
        {
            "$set": {
                "settings.messaging.sms_header_mode": sms_header_mode,
                "settings.messaging.custom_sender_id": custom_sender_id,
                "settings.messaging.otp_channel": otp_channel,
            }
        },
    )
    return {"status": "saved"}


@router.get("/balance")
async def sms_balance(current_user=Depends(get_current_user)):
    return await get_sms_balance()


@router.post("/send")
async def send_sms_endpoint(
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    to = body.get("to", "").strip()
    message = body.get("message", "").strip()
    if not to or not message:
        raise HTTPException(status_code=400, detail="'to' and 'message' are required")

    template_id = body.get("template_id") or get_mtalkz_template_id(body.get("template_key"))
    result = await send_sms_message(to=to, message=message, template_id=template_id)
    if result["success"]:
        return {
            "status": "sent",
            "message_id": result["message_id"],
            "to": to,
            "units": sms_units(message),
        }
    raise HTTPException(status_code=502, detail=f"SMS API error: {result['error']}")
