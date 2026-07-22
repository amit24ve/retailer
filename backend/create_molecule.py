"""
Standalone script — no FastAPI app dependency needed.

What this does:
  1. Re-hashes passwords for ALL existing seed users (fixes bcrypt issues)
  2. Creates the Molecule brand with 4 stores + 4 store managers

Run from the backend folder:
    python create_molecule.py
"""

import asyncio
import uuid
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# ── MongoDB connection (Atlas) ───────────────────────────────────────────────
MONGODB_URL = "mongodb+srv://neelbert_test:Neelbert%40123.@cluster0.ijzzjo3.mongodb.net/?appName=Cluster0"
DATABASE_NAME = "retailcrm_db"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def uid():
    return str(uuid.uuid4())


def now():
    return datetime.utcnow()


def h(password: str) -> str:
    return pwd_context.hash(password)


# ── Existing seed-user passwords to fix ─────────────────────────────────────
SEED_USERS = {
    "admin@retailcrm.io": "admin123",
    "brandowner@fashionbrand.io": "brand123",
    "manager@delhistore.io": "store123",
    "cashier@fashionbrand.io": "cashier123",
    "marketing@fashionbrand.io": "mktg123",
}

# ── Molecule brand details ───────────────────────────────────────────────────
BRAND_NAME = "Molecule"
BRAND_ID = f"brand-molecule-{uid()[:8]}"
TENANT_ID = f"tenant-{BRAND_ID}"

BRAND_OWNER = {
    "email": "owner@molecule.in",
    "password": "Molecule@2026",
    "full_name": "Molecule Owner",
    "phone": "+919800000001",
}

STORES = [
    {
        "store_id": f"mol-{uid()[:8]}",
        "name": "Molecule - Noida Sector 98",
        "store_code": "MOL-NOI-98",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "pincode": "201304",
        "address": "Sector 98, Noida, Uttar Pradesh",
    },
    {
        "store_id": f"mol-{uid()[:8]}",
        "name": "Molecule - Meerut",
        "store_code": "MOL-MER-01",
        "city": "Meerut",
        "state": "Uttar Pradesh",
        "pincode": "250001",
        "address": "Central Market, Meerut, Uttar Pradesh",
    },
    {
        "store_id": f"mol-{uid()[:8]}",
        "name": "Molecule - Mathura",
        "store_code": "MOL-MTH-01",
        "city": "Mathura",
        "state": "Uttar Pradesh",
        "pincode": "281001",
        "address": "Holi Gate, Mathura, Uttar Pradesh",
    },
    {
        "store_id": f"mol-{uid()[:8]}",
        "name": "Molecule - Allahabad",
        "store_code": "MOL-ALD-01",
        "city": "Prayagraj",
        "state": "Uttar Pradesh",
        "pincode": "211001",
        "address": "Civil Lines, Prayagraj (Allahabad), Uttar Pradesh",
    },
]

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


async def main():
    print("\nConnecting to MongoDB Atlas...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # ── Step 1: Fix all existing seed user passwords ──────────────────────────
    print("\n[STEP 1] Re-hashing existing seed user passwords...")
    for email, password in SEED_USERS.items():
        new_hash = h(password)
        result = await db["users"].update_one(
            {"email": email}, {"$set": {"password_hash": new_hash}}
        )
        if result.matched_count:
            print(f"  [OK] Password fixed: {email}")
        else:
            print(f"  [--] User not found (skip): {email}")

    # ── Step 2: Create Molecule brand ─────────────────────────────────────────
    print(f"\n[STEP 2] Creating Molecule brand...")

    existing_brand = await db["brands"].find_one({"name": BRAND_NAME})
    if existing_brand:
        print(f"  [SKIP] Brand '{BRAND_NAME}' already exists.")
    else:
        await db["brands"].insert_one(
            {
                "brand_id": BRAND_ID,
                "tenant_id": TENANT_ID,
                "name": BRAND_NAME,
                "logo_url": "https://ui-avatars.com/api/?name=MO&background=0d9488&color=fff",
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

        # Brand Owner
        existing_owner = await db["users"].find_one({"email": BRAND_OWNER["email"]})
        if existing_owner:
            print(f"  [SKIP] Brand owner already exists: {BRAND_OWNER['email']}")
        else:
            await db["users"].insert_one(
                {
                    "user_id": uid(),
                    "tenant_id": TENANT_ID,
                    "brand_id": BRAND_ID,
                    "store_id": None,
                    "username": BRAND_OWNER["email"].split("@")[0],
                    "email": BRAND_OWNER["email"],
                    "password_hash": h(BRAND_OWNER["password"]),
                    "full_name": BRAND_OWNER["full_name"],
                    "role": "Brand Owner",
                    "brand_name": BRAND_NAME,
                    "phone": BRAND_OWNER["phone"],
                    "status": "active",
                    "last_login": None,
                    "created_at": now(),
                }
            )
            print(f"  [OK] Brand Owner: {BRAND_OWNER['email']}")

        # Stores + Store Managers
        for store, manager in zip(STORES, STORE_MANAGERS):
            s_exists = await db["stores"].find_one({"store_code": store["store_code"]})
            if s_exists:
                print(f"  [SKIP] Store already exists: {store['name']}")
            else:
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
                print(f"  [OK] Store: {store['name']}")

            m_exists = await db["users"].find_one({"email": manager["email"]})
            if m_exists:
                print(f"  [SKIP] Manager already exists: {manager['email']}")
            else:
                await db["users"].insert_one(
                    {
                        "user_id": uid(),
                        "tenant_id": TENANT_ID,
                        "brand_id": BRAND_ID,
                        "store_id": store["store_id"],
                        "username": manager["email"].split("@")[0],
                        "email": manager["email"],
                        "password_hash": h(manager["password"]),
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
                print(f"  [OK] Store Manager: {manager['email']} → {store['name']}")

    client.close()

    # ── Final credentials summary ─────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  ALL CREDENTIALS")
    print("=" * 65)

    print("\n  ── EXISTING PLATFORM USERS (passwords fixed) ──")
    for email, pw in SEED_USERS.items():
        print(f"  {email:<40} / {pw}")

    print("\n  ── MOLECULE BRAND ──")
    print(f"\n  🏢 Brand Owner")
    print(f"     Email    : {BRAND_OWNER['email']}")
    print(f"     Password : {BRAND_OWNER['password']}")

    print(f"\n  🏪 Store Managers")
    for store, manager in zip(STORES, STORE_MANAGERS):
        print(f"\n  Store    : {store['name']}")
        print(f"  Email    : {manager['email']}")
        print(f"  Password : {manager['password']}")

    print("\n" + "=" * 65)
    print("  Login URL: https://retailer.avopay.pro/login")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
