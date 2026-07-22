"""
Seed script for Molecule brand.

Creates:
  - 1 Brand: Molecule
  - 1 Brand Owner user with login credentials
  - 4 Stores: Noida Sector 98, Meerut, Mathura, Allahabad
  - 4 Store Managers (one per store)

Run with:
    python seed_molecule.py

Credentials will be printed at the end.
"""

import asyncio
import os

# ── bootstrap path so app imports work ──────────────────────────────────────
import sys
import uuid
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from app.core.security import get_password_hash
from app.db.database import connect_to_mongo, get_database


# ── IDs & constants ──────────────────────────────────────────────────────────
def uid():
    return str(uuid.uuid4())


def now():
    return datetime.utcnow()


BRAND_NAME = "Molecule"
BRAND_ID = f"brand-molecule-{uid()[:8]}"
TENANT_ID = f"tenant-{BRAND_ID}"

# ── Brand Owner ───────────────────────────────────────────────────────────────
BRAND_OWNER = {
    "email": "owner@molecule.in",
    "password": "Molecule@2026",
    "full_name": "Molecule Owner",
    "phone": "+919800000001",
}

# ── Stores ────────────────────────────────────────────────────────────────────
STORES = [
    {
        "store_id": f"mol-store-{uid()[:8]}",
        "name": "Molecule - Noida Sector 98",
        "store_code": "MOL-NOI-98",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "pincode": "201304",
        "address": "Sector 98, Noida, Uttar Pradesh",
    },
    {
        "store_id": f"mol-store-{uid()[:8]}",
        "name": "Molecule - Meerut",
        "store_code": "MOL-MER-01",
        "city": "Meerut",
        "state": "Uttar Pradesh",
        "pincode": "250001",
        "address": "Central Market, Meerut, Uttar Pradesh",
    },
    {
        "store_id": f"mol-store-{uid()[:8]}",
        "name": "Molecule - Mathura",
        "store_code": "MOL-MTH-01",
        "city": "Mathura",
        "state": "Uttar Pradesh",
        "pincode": "281001",
        "address": "Holi Gate, Mathura, Uttar Pradesh",
    },
    {
        "store_id": f"mol-store-{uid()[:8]}",
        "name": "Molecule - Allahabad",
        "store_code": "MOL-ALD-01",
        "city": "Prayagraj",
        "state": "Uttar Pradesh",
        "pincode": "211001",
        "address": "Civil Lines, Prayagraj (Allahabad), Uttar Pradesh",
    },
]

# ── Store Managers (one per store) ────────────────────────────────────────────
STORE_MANAGERS = [
    {
        "full_name": "Noida Store Manager",
        "email": "manager.noida@molecule.in",
        "password": "Noida@2026",
        "phone": "+919800000002",
    },
    {
        "full_name": "Meerut Store Manager",
        "email": "manager.meerut@molecule.in",
        "password": "Meerut@2026",
        "phone": "+919800000003",
    },
    {
        "full_name": "Mathura Store Manager",
        "email": "manager.mathura@molecule.in",
        "password": "Mathura@2026",
        "phone": "+919800000004",
    },
    {
        "full_name": "Allahabad Store Manager",
        "email": "manager.allahabad@molecule.in",
        "password": "Allahabad@2026",
        "phone": "+919800000005",
    },
]


async def seed():
    await connect_to_mongo()
    db = get_database()

    # ── Guard: don't duplicate ────────────────────────────────────────────────
    if await db["brands"].find_one({"name": BRAND_NAME}):
        print(f"[SKIP] Brand '{BRAND_NAME}' already exists in the database.")
        return

    print(f"\n[START] Seeding Molecule brand (brand_id={BRAND_ID}) ...\n")

    # ── 1. Brand ──────────────────────────────────────────────────────────────
    await db["brands"].insert_one(
        {
            "brand_id": BRAND_ID,
            "tenant_id": TENANT_ID,
            "name": BRAND_NAME,
            "logo_url": f"https://ui-avatars.com/api/?name=MO&background=0d9488&color=fff",
            "currency": "INR",
            "credits": {
                "sms": 500,
                "email": 500,
                "wa_utility": 500,
                "wa_marketing": 500,
            },
            "settings": {
                "points_per_100": 10,
                "point_to_inr": 0.10,
                "calculation_window_days": 365,
                "min_redemption_points": 500,
                "max_redemption_pct": 0.50,
            },
            "status": "active",
            "created_at": now(),
            "updated_at": now(),
        }
    )
    print(f"  [OK] Brand created: {BRAND_NAME} (ID: {BRAND_ID})")

    # ── 2. Brand Owner user ───────────────────────────────────────────────────
    owner_id = uid()
    await db["users"].insert_one(
        {
            "user_id": owner_id,
            "tenant_id": TENANT_ID,
            "brand_id": BRAND_ID,
            "store_id": None,
            "username": BRAND_OWNER["email"].split("@")[0],
            "email": BRAND_OWNER["email"],
            "password_hash": get_password_hash(BRAND_OWNER["password"]),
            "full_name": BRAND_OWNER["full_name"],
            "role": "Brand Owner",
            "brand_name": BRAND_NAME,
            "phone": BRAND_OWNER["phone"],
            "status": "active",
            "last_login": None,
            "created_at": now(),
        }
    )
    print(
        f"  [OK] Brand Owner created: {BRAND_OWNER['full_name']} ({BRAND_OWNER['email']})"
    )

    # ── 3. Stores + Store Managers ────────────────────────────────────────────
    for store, manager in zip(STORES, STORE_MANAGERS):
        # Insert store
        await db["stores"].insert_one(
            {
                **store,
                "brand_id": BRAND_ID,
                "tenant_id": TENANT_ID,
                "status": "active",
                "geo_location": None,
                "created_at": now(),
            }
        )
        print(f"  [OK] Store created: {store['name']} (ID: {store['store_id']})")

        # Insert store manager
        manager_id = uid()
        await db["users"].insert_one(
            {
                "user_id": manager_id,
                "tenant_id": TENANT_ID,
                "brand_id": BRAND_ID,
                "store_id": store["store_id"],
                "username": manager["email"].split("@")[0],
                "email": manager["email"],
                "password_hash": get_password_hash(manager["password"]),
                "full_name": manager["full_name"],
                "role": "Store Manager",
                "brand_name": BRAND_NAME,
                "store_name": store["name"],
                "phone": manager["phone"],
                "status": "active",
                "last_login": None,
                "created_at": now(),
            }
        )
        print(
            f"  [OK] Store Manager created: {manager['full_name']} ({manager['email']}) → {store['name']}"
        )

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  MOLECULE BRAND — LOGIN CREDENTIALS")
    print("=" * 65)
    print(f"\n  Brand ID   : {BRAND_ID}")
    print(f"  Tenant ID  : {TENANT_ID}")
    print(f"\n  🏢 BRAND OWNER")
    print(f"     Email    : {BRAND_OWNER['email']}")
    print(f"     Password : {BRAND_OWNER['password']}")
    print(f"     Role     : Brand Owner")

    print(f"\n  🏪 STORE MANAGERS")
    for store, manager in zip(STORES, STORE_MANAGERS):
        print(f"\n  Store  : {store['name']}")
        print(f"     Email    : {manager['email']}")
        print(f"     Password : {manager['password']}")
        print(f"     Role     : Store Manager")

    print("\n" + "=" * 65)
    print("  Login URL: /login")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(seed())
