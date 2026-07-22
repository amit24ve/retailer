import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.db.database import get_database

router = APIRouter()


def clean(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


@router.get("")
async def list_faqs(db=Depends(get_database), current_user=Depends(get_current_user)):
    brand_id = current_user.get("brand_id", "")
    cursor = db["faqs"].find({"brand_id": brand_id}).sort("created_at", -1)
    return {"faqs": [clean(doc) async for doc in cursor]}


@router.post("", status_code=201)
async def create_faq(body: dict, db=Depends(get_database), current_user=Depends(get_current_user)):
    question = (body.get("question") or "").strip()
    answer = (body.get("answer") or "").strip()
    if not question or not answer:
        raise HTTPException(status_code=400, detail="Question and answer are required")

    faq = {
        "faq_id": str(uuid.uuid4()),
        "brand_id": current_user.get("brand_id", ""),
        "question": question,
        "answer": answer,
        "category": (body.get("category") or "General").strip() or "General",
        "is_active": bool(body.get("is_active", True)),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    await db["faqs"].insert_one(faq)
    return clean(faq)


@router.put("/{faq_id}")
async def update_faq(faq_id: str, body: dict, db=Depends(get_database), current_user=Depends(get_current_user)):
    brand_id = current_user.get("brand_id", "")
    existing = await db["faqs"].find_one({"faq_id": faq_id, "brand_id": brand_id})
    if not existing:
        raise HTTPException(status_code=404, detail="FAQ not found")

    update = {}
    for field in ("question", "answer", "category"):
        if field in body:
            update[field] = (body.get(field) or "").strip()
    if "is_active" in body:
        update["is_active"] = bool(body.get("is_active"))
    if not update.get("question", existing.get("question")) or not update.get("answer", existing.get("answer")):
        raise HTTPException(status_code=400, detail="Question and answer are required")

    update["updated_at"] = datetime.utcnow()
    await db["faqs"].update_one({"faq_id": faq_id, "brand_id": brand_id}, {"$set": update})
    return clean(await db["faqs"].find_one({"faq_id": faq_id, "brand_id": brand_id}))


@router.delete("/{faq_id}")
async def delete_faq(faq_id: str, db=Depends(get_database), current_user=Depends(get_current_user)):
    brand_id = current_user.get("brand_id", "")
    result = await db["faqs"].delete_one({"faq_id": faq_id, "brand_id": brand_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"status": "deleted"}
