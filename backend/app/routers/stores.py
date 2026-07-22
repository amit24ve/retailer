import random
import string
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user, get_data_scope, get_password_hash
from app.db.database import get_database

router = APIRouter()

BRAND_OWNER_ROLES = {"Brand Owner", "Brand Admin"}


# ─── Helpers ──────────────────────────────────────────────────────────────────


def gen_password(length: int = 10) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))


def clean(doc: dict) -> dict:
    if not doc:
        return doc
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    if "created_at" in doc and hasattr(doc["created_at"], "isoformat"):
        doc["created_at"] = doc["created_at"].isoformat()
    if "updated_at" in doc and hasattr(doc.get("updated_at"), "isoformat"):
        doc["updated_at"] = doc["updated_at"].isoformat()
    return doc


def _fmt_manager(doc: dict | None) -> dict | None:
    """Strip _id and return clean manager dict, or None."""
    if not doc:
        return None
    doc.pop("_id", None)
    return doc


async def _get_manager(db, store_id: str) -> dict | None:
    """
    Return the Store Manager linked to *store_id*, or None.
    Searches all known store-level manager roles so legacy seeds work.
    """
    doc = await db["users"].find_one(
        {
            "store_id": store_id,
            "role": {"$in": ["Store Manager", "store_manager"]},
        },
        {"full_name": 1, "email": 1, "phone": 1, "user_id": 1, "_id": 0},
    )
    return _fmt_manager(doc)


async def _get_all_managers(db, store_ids: list[str]) -> dict[str, dict]:
    """
    Batch-fetch managers for multiple stores in ONE query.
    Returns {store_id: manager_dict}.
    """
    cursor = db["users"].find(
        {
            "store_id": {"$in": store_ids},
            "role": {"$in": ["Store Manager", "store_manager"]},
        },
        {"full_name": 1, "email": 1, "phone": 1, "user_id": 1, "store_id": 1, "_id": 0},
    )
    result: dict[str, dict] = {}
    async for doc in cursor:
        sid = doc.get("store_id")
        if sid:
            doc.pop("_id", None)
            result[sid] = doc
    return result


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.get("")
async def list_stores(
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """List all stores scoped to the caller's brand, with manager info embedded."""
    brand_id, scoped_store_id = get_data_scope(current_user)

    query: dict = {}
    if brand_id:
        query["brand_id"] = brand_id
    if scoped_store_id:
        query["store_id"] = scoped_store_id

    cursor = db["stores"].find(query).sort("name", 1)
    stores = [clean(doc) async for doc in cursor]

    # Batch-fetch all managers in one round-trip instead of N queries
    store_ids = [s["store_id"] for s in stores if s.get("store_id")]
    managers_map = await _get_all_managers(db, store_ids)

    for store in stores:
        store["manager"] = managers_map.get(store.get("store_id"))

    return {"stores": stores}


@router.get("/{store_id}")
async def get_store(
    store_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Fetch a single store with full manager details."""
    brand_id, scoped_store_id = get_data_scope(current_user)

    if scoped_store_id and scoped_store_id != store_id:
        raise HTTPException(status_code=403, detail="Access denied")

    query: dict = {"store_id": store_id}
    if brand_id:
        query["brand_id"] = brand_id

    store = await db["stores"].find_one(query)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    store = clean(store)
    store["manager"] = await _get_manager(db, store_id)
    return store


@router.post("", status_code=201)
async def create_store(
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """
    Create a store and automatically provision a linked Store Manager account.
    Returns the store + plaintext manager credentials for sharing.
    """
    if current_user.get("role") not in BRAND_OWNER_ROLES:
        raise HTTPException(
            status_code=403, detail="Only Brand Owners can create stores"
        )

    brand_id, _ = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "")
    brand_name = current_user.get("brand_name", "")

    required = [
        "name",
        "store_code",
        "address",
        "city",
        "state",
        "pincode",
        "manager_name",
        "manager_email",
    ]
    missing = [f for f in required if not body.get(f)]
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing: {', '.join(missing)}")

    code = body["store_code"].upper()
    manager_email = body["manager_email"].lower().strip()

    if await db["stores"].find_one({"store_code": code}):
        raise HTTPException(status_code=409, detail="Store code already exists")
    if await db["users"].find_one({"email": manager_email}):
        raise HTTPException(status_code=409, detail="Manager email already registered")

    store_id = str(uuid.uuid4())
    manager_id = str(uuid.uuid4())
    plain_password = body.get("manager_password") or gen_password()
    now = datetime.utcnow()

    store_doc = {
        "store_id": store_id,
        "brand_id": brand_id,
        "tenant_id": tenant_id,
        "store_code": code,
        "name": body["name"],
        "address": body["address"],
        "city": body["city"],
        "state": body["state"],
        "pincode": body["pincode"],
        "manager_id": manager_id,
        "status": "active",
        "geo_location": None,
        "created_at": now,
    }

    manager_doc = {
        "user_id": manager_id,
        "tenant_id": tenant_id,
        "brand_id": brand_id,
        "brand_name": brand_name,
        "store_id": store_id,
        "username": manager_email.split("@")[0],
        "email": manager_email,
        "password_hash": get_password_hash(plain_password),
        "full_name": body["manager_name"],
        "phone": body.get("manager_phone", ""),
        "role": "Store Manager",
        "status": "active",
        "last_login": None,
        "created_at": now,
    }

    await db["stores"].insert_one(store_doc)
    await db["users"].insert_one(manager_doc)

    # Trigger Welcome and Store Created Emails
    try:
        from app.core.email import send_email
        from app.core.templates import get_welcome_email, get_store_created_email
        welcome_html = get_welcome_email(body["manager_name"], manager_email, "Store Manager")
        await send_email("welcome_after_account_creation", manager_email, "Welcome to Cuben Retailer", welcome_html)

        store_created_html = get_store_created_email(body["name"], code, manager_email)
        await send_email("store_created", manager_email, f"Store Registered - {body['name']}", store_created_html)
    except Exception:
        pass

    return {
        **clean(store_doc),
        "manager": {
            "full_name": body["manager_name"],
            "email": manager_email,
            "phone": body.get("manager_phone", ""),
            "user_id": manager_id,
        },
        "manager_credentials": {
            "manager_name": body["manager_name"],
            "manager_phone": body.get("manager_phone", ""),
            "email": manager_email,
            "password": plain_password,
            "user_id": manager_id,
        },
    }


@router.put("/{store_id}")
async def update_store(
    store_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Update store details and optionally the manager's name/phone."""
    if current_user.get("role") not in BRAND_OWNER_ROLES:
        raise HTTPException(
            status_code=403, detail="Only Brand Owners can update stores"
        )

    brand_id, _ = get_data_scope(current_user)
    store = await db["stores"].find_one({"store_id": store_id, "brand_id": brand_id})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    store_updates = {
        k: body[k]
        for k in ("name", "address", "city", "state", "pincode", "status")
        if k in body
    }
    if store_updates:
        store_updates["updated_at"] = datetime.utcnow()
        await db["stores"].update_one({"store_id": store_id}, {"$set": store_updates})

    manager_updates: dict = {}
    if "manager_name" in body:
        manager_updates["full_name"] = body["manager_name"]
    if "manager_phone" in body:
        manager_updates["phone"] = body["manager_phone"]
    if manager_updates:
        manager_updates["updated_at"] = datetime.utcnow()
        await db["users"].update_one(
            {"store_id": store_id, "role": {"$in": ["Store Manager", "store_manager"]}},
            {"$set": manager_updates},
        )

    updated = clean(await db["stores"].find_one({"store_id": store_id}))
    updated["manager"] = await _get_manager(db, store_id)
    return updated


@router.patch("/{store_id}/credentials")
async def update_manager_credentials(
    store_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """
    Update (or CREATE) the Store Manager's login credentials.
    - If a manager already exists → update their fields.
    - If NO manager exists → create one (manager_email required in that case).
    Returns the new plaintext password when changed.
    """
    if current_user.get("role") not in BRAND_OWNER_ROLES:
        raise HTTPException(
            status_code=403, detail="Only Brand Owners can update credentials"
        )

    brand_id, _ = get_data_scope(current_user)
    tenant_id = current_user.get("tenant_id", "")
    brand_name = current_user.get("brand_name", "")

    store = await db["stores"].find_one({"store_id": store_id, "brand_id": brand_id})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    existing_manager = await db["users"].find_one(
        {"store_id": store_id, "role": {"$in": ["Store Manager", "store_manager"]}},
    )

    plain_password: str | None = None

    # ── Case 1: Manager exists → update ───────────────────────────────────────
    if existing_manager:
        updates: dict = {}

        if "manager_email" in body:
            new_email = body["manager_email"].lower().strip()
            conflict = await db["users"].find_one(
                {"email": new_email, "store_id": {"$ne": store_id}}
            )
            if conflict:
                raise HTTPException(status_code=409, detail="Email already in use")
            updates["email"] = new_email
            updates["username"] = new_email.split("@")[0]

        if body.get("manager_password"):
            plain_password = body["manager_password"]
        else:
            plain_password = gen_password()
        updates["password_hash"] = get_password_hash(plain_password)

        if "manager_name" in body:
            updates["full_name"] = body["manager_name"]
        if "manager_phone" in body:
            updates["phone"] = body["manager_phone"]

        updates["updated_at"] = datetime.utcnow()
        await db["users"].update_one(
            {"store_id": store_id, "role": {"$in": ["Store Manager", "store_manager"]}},
            {"$set": updates},
        )

    # ── Case 2: No manager exists → create one ───────────────────────────────
    else:
        manager_email = body.get("manager_email", "").lower().strip()
        if not manager_email:
            raise HTTPException(
                status_code=422,
                detail="manager_email is required to create a new manager",
            )
        manager_name = body.get("manager_name", store.get("name", "Store") + " Manager")

        if await db["users"].find_one({"email": manager_email}):
            raise HTTPException(status_code=409, detail="Email already registered")

        plain_password = body.get("manager_password") or gen_password()
        manager_id = str(uuid.uuid4())
        now = datetime.utcnow()

        await db["users"].insert_one(
            {
                "user_id": manager_id,
                "tenant_id": tenant_id,
                "brand_id": brand_id,
                "brand_name": brand_name,
                "store_id": store_id,
                "username": manager_email.split("@")[0],
                "email": manager_email,
                "password_hash": get_password_hash(plain_password),
                "full_name": manager_name,
                "phone": body.get("manager_phone", ""),
                "role": "Store Manager",
                "status": "active",
                "last_login": None,
                "created_at": now,
            }
        )

    manager = await _get_manager(db, store_id)
    return {
        "manager": manager,
        "new_password": plain_password,
    }


@router.delete("/{store_id}")
async def delete_store(
    store_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Delete store and its linked Store Manager account."""
    if current_user.get("role") not in BRAND_OWNER_ROLES:
        raise HTTPException(
            status_code=403, detail="Only Brand Owners can delete stores"
        )

    brand_id, _ = get_data_scope(current_user)
    store = await db["stores"].find_one({"store_id": store_id, "brand_id": brand_id})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    await db["stores"].delete_one({"store_id": store_id})
    await db["users"].delete_many(
        {
            "store_id": store_id,
            "role": {"$in": ["Store Manager", "store_manager"]},
        }
    )

    return {"success": True}


@router.patch("/{store_id}/status")
async def toggle_store_status(
    store_id: str,
    body: dict,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    """Set store status to 'active' or 'inactive'."""
    if current_user.get("role") not in BRAND_OWNER_ROLES:
        raise HTTPException(
            status_code=403, detail="Only Brand Owners can change store status"
        )

    brand_id, _ = get_data_scope(current_user)
    store = await db["stores"].find_one({"store_id": store_id, "brand_id": brand_id})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    new_status = body.get("status")
    if new_status not in ("active", "inactive"):
        raise HTTPException(
            status_code=422, detail="status must be 'active' or 'inactive'"
        )

    await db["stores"].update_one(
        {"store_id": store_id},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}},
    )

    # Find store manager
    manager = await db["users"].find_one({"store_id": store_id, "role": "Store Manager"})
    if manager:
        try:
            from app.core.email import send_email
            from app.core.templates import get_store_approved_email, get_store_suspended_email, get_store_reactivated_email
            if new_status == "inactive":
                suspended_html = get_store_suspended_email(store.get("name", "your store"))
                await send_email("store_suspended", manager["email"], f"Store Deactivated - {store.get('name')}", suspended_html)
            elif new_status == "active":
                if store.get("status") == "inactive":
                    reactivated_html = get_store_reactivated_email(store.get("name", "your store"))
                    await send_email("store_reactivated", manager["email"], f"Store Reactivated - {store.get('name')}", reactivated_html)
                else:
                    approved_html = get_store_approved_email(store.get("name", "your store"))
                    await send_email("store_approved", manager["email"], f"Store Activated - {store.get('name')}", approved_html)
        except Exception:
            pass

    return {"store_id": store_id, "status": new_status}
