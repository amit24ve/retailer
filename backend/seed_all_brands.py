"""
Master seed script — RetailCRM Platform
========================================
Creates:
  • 1 Super Admin
  • 5 Brand Owners, each with their own brand, stores and store managers

    Brand 1 : Molecule       (UP cities — as provided)
    Brand 2 : ZenFit         (Sports & Fitness)
    Brand 3 : LuxeThreads    (Luxury Fashion)
    Brand 4 : UrbanGrocer    (Grocery & Daily Needs)
    Brand 5 : TechZone       (Electronics & Gadgets)

Run from the backend folder:
    python seed_all_brands.py
"""

import asyncio
import uuid
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# ── MongoDB connection ────────────────────────────────────────────────────────
MONGODB_URL = "mongodb+srv://neelbert_test:Neelbert%40123.@cluster0.ijzzjo3.mongodb.net/?appName=Cluster0"
DATABASE_NAME = "retailcrm_db"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def uid():
    return str(uuid.uuid4())


def now():
    return datetime.utcnow()


def h(password: str) -> str:
    return pwd_context.hash(password)


def make_brand_id(slug: str) -> str:
    return f"brand-{slug}-{uid()[:8]}"


def make_tenant_id(brand_id: str) -> str:
    return f"tenant-{brand_id}"


# ══════════════════════════════════════════════════════════════════════════════
# SUPER ADMIN
# ══════════════════════════════════════════════════════════════════════════════
SUPER_ADMIN = {
    "email": "superadmin@retailcrm.io",
    "password": "SuperAdmin@2026",
    "full_name": "Platform Super Admin",
    "phone": "+919000000001",
    "role": "Super Admin",
}

# ══════════════════════════════════════════════════════════════════════════════
# BRAND 1 — Molecule
# ══════════════════════════════════════════════════════════════════════════════
MOL_BRAND_ID = make_brand_id("molecule")
MOL_TENANT_ID = make_tenant_id(MOL_BRAND_ID)

MOLECULE = {
    "brand_id": MOL_BRAND_ID,
    "tenant_id": MOL_TENANT_ID,
    "name": "Molecule",
    "slug": "molecule",
    "logo_url": "https://ui-avatars.com/api/?name=MO&background=0d9488&color=fff",
    "owner": {
        "email": "owner@molecule.in",
        "password": "Molecule@2026",
        "full_name": "Molecule Brand Owner",
        "phone": "+919800000001",
    },
    "stores": [
        {
            "store_id": f"mol-{uid()[:8]}",
            "name": "Molecule - Noida Sector 98",
            "store_code": "MOL-NOI-98",
            "city": "Noida",
            "state": "Uttar Pradesh",
            "pincode": "201304",
            "address": "Sector 98, Noida, Uttar Pradesh",
            "manager": {
                "email": "manager.noida@molecule.in",
                "password": "Noida@2026",
                "full_name": "Noida Store Manager",
                "phone": "+919800000002",
            },
        },
        {
            "store_id": f"mol-{uid()[:8]}",
            "name": "Molecule - Meerut",
            "store_code": "MOL-MER-01",
            "city": "Meerut",
            "state": "Uttar Pradesh",
            "pincode": "250001",
            "address": "Central Market, Meerut, Uttar Pradesh",
            "manager": {
                "email": "manager.meerut@molecule.in",
                "password": "Meerut@2026",
                "full_name": "Meerut Store Manager",
                "phone": "+919800000003",
            },
        },
        {
            "store_id": f"mol-{uid()[:8]}",
            "name": "Molecule - Mathura",
            "store_code": "MOL-MTH-01",
            "city": "Mathura",
            "state": "Uttar Pradesh",
            "pincode": "281001",
            "address": "Holi Gate, Mathura, Uttar Pradesh",
            "manager": {
                "email": "manager.mathura@molecule.in",
                "password": "Mathura@2026",
                "full_name": "Mathura Store Manager",
                "phone": "+919800000004",
            },
        },
        {
            "store_id": f"mol-{uid()[:8]}",
            "name": "Molecule - Allahabad",
            "store_code": "MOL-ALD-01",
            "city": "Prayagraj",
            "state": "Uttar Pradesh",
            "pincode": "211001",
            "address": "Civil Lines, Prayagraj (Allahabad), Uttar Pradesh",
            "manager": {
                "email": "manager.allahabad@molecule.in",
                "password": "Allahabad@2026",
                "full_name": "Allahabad Store Manager",
                "phone": "+919800000005",
            },
        },
    ],
}

# ══════════════════════════════════════════════════════════════════════════════
# BRAND 2 — ZenFit (Sports & Fitness)
# ══════════════════════════════════════════════════════════════════════════════
ZEN_BRAND_ID = make_brand_id("zenfit")
ZEN_TENANT_ID = make_tenant_id(ZEN_BRAND_ID)

ZENFIT = {
    "brand_id": ZEN_BRAND_ID,
    "tenant_id": ZEN_TENANT_ID,
    "name": "ZenFit",
    "slug": "zenfit",
    "logo_url": "https://ui-avatars.com/api/?name=ZF&background=f97316&color=fff",
    "owner": {
        "email": "owner@zenfit.in",
        "password": "ZenFit@2026",
        "full_name": "ZenFit Brand Owner",
        "phone": "+919810000001",
    },
    "stores": [
        {
            "store_id": f"zen-{uid()[:8]}",
            "name": "ZenFit - Connaught Place Delhi",
            "store_code": "ZEN-DEL-CP-01",
            "city": "New Delhi",
            "state": "Delhi",
            "pincode": "110001",
            "address": "Connaught Place, New Delhi",
            "manager": {
                "email": "manager.delhi@zenfit.in",
                "password": "Delhi@2026",
                "full_name": "Delhi Store Manager",
                "phone": "+919810000002",
            },
        },
        {
            "store_id": f"zen-{uid()[:8]}",
            "name": "ZenFit - Andheri Mumbai",
            "store_code": "ZEN-MUM-AND-01",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400053",
            "address": "Andheri West, Mumbai, Maharashtra",
            "manager": {
                "email": "manager.mumbai@zenfit.in",
                "password": "Mumbai@2026",
                "full_name": "Mumbai Store Manager",
                "phone": "+919810000003",
            },
        },
        {
            "store_id": f"zen-{uid()[:8]}",
            "name": "ZenFit - Indiranagar Bengaluru",
            "store_code": "ZEN-BLR-IND-01",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560038",
            "address": "100 Feet Road, Indiranagar, Bengaluru",
            "manager": {
                "email": "manager.bangalore@zenfit.in",
                "password": "Bangalore@2026",
                "full_name": "Bangalore Store Manager",
                "phone": "+919810000004",
            },
        },
        {
            "store_id": f"zen-{uid()[:8]}",
            "name": "ZenFit - Baner Pune",
            "store_code": "ZEN-PUN-BAN-01",
            "city": "Pune",
            "state": "Maharashtra",
            "pincode": "411045",
            "address": "Baner Road, Pune, Maharashtra",
            "manager": {
                "email": "manager.pune@zenfit.in",
                "password": "Pune@2026",
                "full_name": "Pune Store Manager",
                "phone": "+919810000005",
            },
        },
    ],
}

# ══════════════════════════════════════════════════════════════════════════════
# BRAND 3 — LuxeThreads (Luxury Fashion)
# ══════════════════════════════════════════════════════════════════════════════
LUX_BRAND_ID = make_brand_id("luxethreads")
LUX_TENANT_ID = make_tenant_id(LUX_BRAND_ID)

LUXETHREADS = {
    "brand_id": LUX_BRAND_ID,
    "tenant_id": LUX_TENANT_ID,
    "name": "LuxeThreads",
    "slug": "luxethreads",
    "logo_url": "https://ui-avatars.com/api/?name=LT&background=7c3aed&color=fff",
    "owner": {
        "email": "owner@luxethreads.in",
        "password": "LuxeThreads@2026",
        "full_name": "LuxeThreads Brand Owner",
        "phone": "+919820000001",
    },
    "stores": [
        {
            "store_id": f"lux-{uid()[:8]}",
            "name": "LuxeThreads - Bandra Mumbai",
            "store_code": "LUX-MUM-BAN-01",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400050",
            "address": "Linking Road, Bandra West, Mumbai",
            "manager": {
                "email": "manager.bandra@luxethreads.in",
                "password": "Bandra@2026",
                "full_name": "Bandra Store Manager",
                "phone": "+919820000002",
            },
        },
        {
            "store_id": f"lux-{uid()[:8]}",
            "name": "LuxeThreads - Khan Market Delhi",
            "store_code": "LUX-DEL-KHN-01",
            "city": "New Delhi",
            "state": "Delhi",
            "pincode": "110003",
            "address": "Khan Market, New Delhi",
            "manager": {
                "email": "manager.khanmarket@luxethreads.in",
                "password": "KhanMarket@2026",
                "full_name": "Khan Market Store Manager",
                "phone": "+919820000003",
            },
        },
        {
            "store_id": f"lux-{uid()[:8]}",
            "name": "LuxeThreads - Jubilee Hills Hyderabad",
            "store_code": "LUX-HYD-JBL-01",
            "city": "Hyderabad",
            "state": "Telangana",
            "pincode": "500033",
            "address": "Road No. 36, Jubilee Hills, Hyderabad",
            "manager": {
                "email": "manager.hyderabad@luxethreads.in",
                "password": "Hyderabad@2026",
                "full_name": "Hyderabad Store Manager",
                "phone": "+919820000004",
            },
        },
        {
            "store_id": f"lux-{uid()[:8]}",
            "name": "LuxeThreads - Koregaon Park Pune",
            "store_code": "LUX-PUN-KP-01",
            "city": "Pune",
            "state": "Maharashtra",
            "pincode": "411001",
            "address": "Koregaon Park, Pune, Maharashtra",
            "manager": {
                "email": "manager.koregaon@luxethreads.in",
                "password": "Koregaon@2026",
                "full_name": "Koregaon Store Manager",
                "phone": "+919820000005",
            },
        },
    ],
}

# ══════════════════════════════════════════════════════════════════════════════
# BRAND 4 — UrbanGrocer (Grocery & Daily Needs)
# ══════════════════════════════════════════════════════════════════════════════
URB_BRAND_ID = make_brand_id("urbangrocer")
URB_TENANT_ID = make_tenant_id(URB_BRAND_ID)

URBANGROCER = {
    "brand_id": URB_BRAND_ID,
    "tenant_id": URB_TENANT_ID,
    "name": "UrbanGrocer",
    "slug": "urbangrocer",
    "logo_url": "https://ui-avatars.com/api/?name=UG&background=16a34a&color=fff",
    "owner": {
        "email": "owner@urbangrocer.in",
        "password": "UrbanGrocer@2026",
        "full_name": "UrbanGrocer Brand Owner",
        "phone": "+919830000001",
    },
    "stores": [
        {
            "store_id": f"urb-{uid()[:8]}",
            "name": "UrbanGrocer - Koramangala Bengaluru",
            "store_code": "URB-BLR-KOR-01",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560034",
            "address": "80 Feet Road, Koramangala, Bengaluru",
            "manager": {
                "email": "manager.koramangala@urbangrocer.in",
                "password": "Koramangala@2026",
                "full_name": "Koramangala Store Manager",
                "phone": "+919830000002",
            },
        },
        {
            "store_id": f"urb-{uid()[:8]}",
            "name": "UrbanGrocer - Aundh Pune",
            "store_code": "URB-PUN-AUN-01",
            "city": "Pune",
            "state": "Maharashtra",
            "pincode": "411007",
            "address": "DP Road, Aundh, Pune, Maharashtra",
            "manager": {
                "email": "manager.aundh@urbangrocer.in",
                "password": "Aundh@2026",
                "full_name": "Aundh Store Manager",
                "phone": "+919830000003",
            },
        },
        {
            "store_id": f"urb-{uid()[:8]}",
            "name": "UrbanGrocer - Anna Nagar Chennai",
            "store_code": "URB-CHE-ANN-01",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "pincode": "600040",
            "address": "2nd Avenue, Anna Nagar, Chennai",
            "manager": {
                "email": "manager.annanagar@urbangrocer.in",
                "password": "AnnaNagar@2026",
                "full_name": "Anna Nagar Store Manager",
                "phone": "+919830000004",
            },
        },
        {
            "store_id": f"urb-{uid()[:8]}",
            "name": "UrbanGrocer - Satellite Ahmedabad",
            "store_code": "URB-AMD-SAT-01",
            "city": "Ahmedabad",
            "state": "Gujarat",
            "pincode": "380015",
            "address": "Satellite Road, Ahmedabad, Gujarat",
            "manager": {
                "email": "manager.ahmedabad@urbangrocer.in",
                "password": "Ahmedabad@2026",
                "full_name": "Ahmedabad Store Manager",
                "phone": "+919830000005",
            },
        },
    ],
}

# ══════════════════════════════════════════════════════════════════════════════
# BRAND 5 — TechZone (Electronics & Gadgets)
# ══════════════════════════════════════════════════════════════════════════════
TEC_BRAND_ID = make_brand_id("techzone")
TEC_TENANT_ID = make_tenant_id(TEC_BRAND_ID)

TECHZONE = {
    "brand_id": TEC_BRAND_ID,
    "tenant_id": TEC_TENANT_ID,
    "name": "TechZone",
    "slug": "techzone",
    "logo_url": "https://ui-avatars.com/api/?name=TZ&background=1d4ed8&color=fff",
    "owner": {
        "email": "owner@techzone.in",
        "password": "TechZone@2026",
        "full_name": "TechZone Brand Owner",
        "phone": "+919840000001",
    },
    "stores": [
        {
            "store_id": f"tec-{uid()[:8]}",
            "name": "TechZone - Nehru Place Delhi",
            "store_code": "TEC-DEL-NP-01",
            "city": "New Delhi",
            "state": "Delhi",
            "pincode": "110019",
            "address": "Nehru Place, New Delhi",
            "manager": {
                "email": "manager.nehruplace@techzone.in",
                "password": "NehruPlace@2026",
                "full_name": "Nehru Place Store Manager",
                "phone": "+919840000002",
            },
        },
        {
            "store_id": f"tec-{uid()[:8]}",
            "name": "TechZone - Lamington Road Mumbai",
            "store_code": "TEC-MUM-LAM-01",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400007",
            "address": "Lamington Road, Grant Road, Mumbai",
            "manager": {
                "email": "manager.lamington@techzone.in",
                "password": "Lamington@2026",
                "full_name": "Lamington Store Manager",
                "phone": "+919840000003",
            },
        },
        {
            "store_id": f"tec-{uid()[:8]}",
            "name": "TechZone - SP Road Bengaluru",
            "store_code": "TEC-BLR-SPR-01",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560002",
            "address": "SP Road, Bengaluru, Karnataka",
            "manager": {
                "email": "manager.sproad@techzone.in",
                "password": "SPRoad@2026",
                "full_name": "SP Road Store Manager",
                "phone": "+919840000004",
            },
        },
        {
            "store_id": f"tec-{uid()[:8]}",
            "name": "TechZone - Park Street Kolkata",
            "store_code": "TEC-KOL-PKS-01",
            "city": "Kolkata",
            "state": "West Bengal",
            "pincode": "700016",
            "address": "Park Street, Kolkata, West Bengal",
            "manager": {
                "email": "manager.parkstreet@techzone.in",
                "password": "ParkStreet@2026",
                "full_name": "Park Street Store Manager",
                "phone": "+919840000005",
            },
        },
    ],
}

# All brands in one list
ALL_BRANDS = [MOLECULE, ZENFIT, LUXETHREADS, URBANGROCER, TECHZONE]


# ── Helper: create or upsert a brand + its owner + stores + managers ──────────
async def seed_brand(db, brand: dict):
    brand_id = brand["brand_id"]
    tenant_id = brand["tenant_id"]
    brand_name = brand["name"]

    print(f"\n  ── Brand: {brand_name} ──")

    # Brand document
    existing = await db["brands"].find_one({"name": brand_name})
    if existing:
        print(f"    [SKIP] Brand already exists — using existing IDs")
        brand_id = existing["brand_id"]
        tenant_id = existing["tenant_id"]
    else:
        await db["brands"].insert_one(
            {
                "brand_id": brand_id,
                "tenant_id": tenant_id,
                "name": brand_name,
                "logo_url": brand["logo_url"],
                "currency": "INR",
                "credits": {
                    "sms": 1000,
                    "email": 1000,
                    "wa_utility": 1000,
                    "wa_marketing": 1000,
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
        print(f"    [OK] Brand created: {brand_name}  (ID: {brand_id})")

    # Brand Owner
    owner = brand["owner"]
    o_exists = await db["users"].find_one({"email": owner["email"]})
    if o_exists:
        print(f"    [SKIP] Owner already exists: {owner['email']}")
    else:
        await db["users"].insert_one(
            {
                "user_id": uid(),
                "tenant_id": tenant_id,
                "brand_id": brand_id,
                "store_id": None,
                "username": owner["email"].split("@")[0],
                "email": owner["email"],
                "password_hash": h(owner["password"]),
                "full_name": owner["full_name"],
                "role": "Brand Owner",
                "brand_name": brand_name,
                "phone": owner["phone"],
                "status": "active",
                "last_login": None,
                "created_at": now(),
            }
        )
        print(f"    [OK] Brand Owner: {owner['email']}")

    # Stores + Store Managers
    for store in brand["stores"]:
        manager = store.pop("manager")  # extract manager before inserting store doc

        s_exists = await db["stores"].find_one({"store_code": store["store_code"]})
        if s_exists:
            store_id = s_exists["store_id"]
            print(f"    [SKIP] Store already exists: {store['name']}")
        else:
            store_doc = {
                **store,
                "brand_id": brand_id,
                "tenant_id": tenant_id,
                "status": "active",
                "geo_location": None,
                "created_at": now(),
            }
            await db["stores"].insert_one(store_doc)
            store_id = store["store_id"]
            print(f"    [OK] Store: {store['name']}")

        m_exists = await db["users"].find_one({"email": manager["email"]})
        if m_exists:
            print(f"    [SKIP] Manager already exists: {manager['email']}")
        else:
            await db["users"].insert_one(
                {
                    "user_id": uid(),
                    "tenant_id": tenant_id,
                    "brand_id": brand_id,
                    "store_id": store_id,
                    "username": manager["email"].split("@")[0],
                    "email": manager["email"],
                    "password_hash": h(manager["password"]),
                    "full_name": manager["full_name"],
                    "role": "Store Manager",
                    "brand_name": brand_name,
                    "store_name": store["name"],
                    "phone": manager["phone"],
                    "status": "active",
                    "last_login": None,
                    "created_at": now(),
                }
            )
            print(f"    [OK] Store Manager: {manager['email']}  →  {store['name']}")


# ── Main ──────────────────────────────────────────────────────────────────────
async def main():
    print("\n" + "=" * 65)
    print("  RetailCRM — Master Seed Script")
    print("=" * 65)
    print("\nConnecting to MongoDB Atlas...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # ── SUPER ADMIN ──────────────────────────────────────────────────────────
    print("\n[STEP 1] Creating Super Admin...")
    sa_exists = await db["users"].find_one({"email": SUPER_ADMIN["email"]})
    if sa_exists:
        print(f"  [SKIP] Super Admin already exists: {SUPER_ADMIN['email']}")
        # Refresh the password anyway so we always know it works
        await db["users"].update_one(
            {"email": SUPER_ADMIN["email"]},
            {"$set": {"password_hash": h(SUPER_ADMIN["password"])}},
        )
        print(f"  [OK]   Password refreshed")
    else:
        await db["users"].insert_one(
            {
                "user_id": uid(),
                "tenant_id": None,
                "brand_id": None,
                "store_id": None,
                "username": "superadmin",
                "email": SUPER_ADMIN["email"],
                "password_hash": h(SUPER_ADMIN["password"]),
                "full_name": SUPER_ADMIN["full_name"],
                "role": "Super Admin",
                "brand_name": "RetailCRM Platform",
                "phone": SUPER_ADMIN["phone"],
                "status": "active",
                "last_login": None,
                "created_at": now(),
            }
        )
        print(f"  [OK] Super Admin created: {SUPER_ADMIN['email']}")

    # ── BRANDS ───────────────────────────────────────────────────────────────
    print("\n[STEP 2] Creating brands, brand owners, stores and store managers...")
    for brand in ALL_BRANDS:
        await seed_brand(db, brand)

    client.close()

    # ── CREDENTIALS SUMMARY ──────────────────────────────────────────────────
    print("\n\n" + "=" * 70)
    print("  COMPLETE CREDENTIALS SUMMARY")
    print("=" * 70)

    print("\n  ┌─ SUPER ADMIN ────────────────────────────────────────────────┐")
    print(f"  │  Email    : {SUPER_ADMIN['email']}")
    print(f"  │  Password : {SUPER_ADMIN['password']}")
    print(f"  │  Role     : {SUPER_ADMIN['role']}")
    print("  └──────────────────────────────────────────────────────────────┘")

    brand_icons = ["🟦", "🟧", "🟪", "🟩", "🟥"]
    for idx, brand in enumerate(ALL_BRANDS):
        icon = brand_icons[idx % len(brand_icons)]
        print(f"\n  {icon} BRAND {idx + 1}: {brand['name'].upper()}")
        print(f"     Brand Owner Email    : {brand['owner']['email']}")
        print(f"     Brand Owner Password : {brand['owner']['password']}")
        print(f"     Role                : Brand Owner")
        print(f"     Store Managers:")
        for store in brand["stores"]:
            mgr = store.get("manager") or {}
            print(f"       • {store['name']}")
            # manager was already popped from store dict — use brand['stores'] original
        # Re-fetch from the original brand data for display
        # (stores had manager popped, so we reconstruct from the module-level data)

    # ── Cleaner display using raw source data ────────────────────────────────
    SOURCE = [
        (
            "Molecule",
            "owner@molecule.in",
            "Molecule@2026",
            [
                ("Noida Sector 98", "manager.noida@molecule.in", "Noida@2026"),
                ("Meerut", "manager.meerut@molecule.in", "Meerut@2026"),
                ("Mathura", "manager.mathura@molecule.in", "Mathura@2026"),
                ("Allahabad", "manager.allahabad@molecule.in", "Allahabad@2026"),
            ],
        ),
        (
            "ZenFit",
            "owner@zenfit.in",
            "ZenFit@2026",
            [
                ("Delhi CP", "manager.delhi@zenfit.in", "Delhi@2026"),
                ("Mumbai Andheri", "manager.mumbai@zenfit.in", "Mumbai@2026"),
                (
                    "Bengaluru Indiranagar",
                    "manager.bangalore@zenfit.in",
                    "Bangalore@2026",
                ),
                ("Pune Baner", "manager.pune@zenfit.in", "Pune@2026"),
            ],
        ),
        (
            "LuxeThreads",
            "owner@luxethreads.in",
            "LuxeThreads@2026",
            [
                ("Mumbai Bandra", "manager.bandra@luxethreads.in", "Bandra@2026"),
                (
                    "Delhi Khan Market",
                    "manager.khanmarket@luxethreads.in",
                    "KhanMarket@2026",
                ),
                (
                    "Hyderabad Jubilee Hills",
                    "manager.hyderabad@luxethreads.in",
                    "Hyderabad@2026",
                ),
                ("Pune Koregaon", "manager.koregaon@luxethreads.in", "Koregaon@2026"),
            ],
        ),
        (
            "UrbanGrocer",
            "owner@urbangrocer.in",
            "UrbanGrocer@2026",
            [
                (
                    "Bengaluru Koramangala",
                    "manager.koramangala@urbangrocer.in",
                    "Koramangala@2026",
                ),
                ("Pune Aundh", "manager.aundh@urbangrocer.in", "Aundh@2026"),
                (
                    "Chennai Anna Nagar",
                    "manager.annanagar@urbangrocer.in",
                    "AnnaNagar@2026",
                ),
                (
                    "Ahmedabad Satellite",
                    "manager.ahmedabad@urbangrocer.in",
                    "Ahmedabad@2026",
                ),
            ],
        ),
        (
            "TechZone",
            "owner@techzone.in",
            "TechZone@2026",
            [
                (
                    "Delhi Nehru Place",
                    "manager.nehruplace@techzone.in",
                    "NehruPlace@2026",
                ),
                (
                    "Mumbai Lamington Rd",
                    "manager.lamington@techzone.in",
                    "Lamington@2026",
                ),
                ("Bengaluru SP Road", "manager.sproad@techzone.in", "SPRoad@2026"),
                (
                    "Kolkata Park Street",
                    "manager.parkstreet@techzone.in",
                    "ParkStreet@2026",
                ),
            ],
        ),
    ]

    icons = ["🟦", "🟧", "🟪", "🟩", "🟥"]
    print("\n\n" + "=" * 70)
    print("  COMPLETE CREDENTIALS SUMMARY")
    print("=" * 70)

    print("\n  ┌─ SUPER ADMIN ────────────────────────────────────────────────┐")
    print(f"  │  Email    : {SUPER_ADMIN['email']}")
    print(f"  │  Password : {SUPER_ADMIN['password']}")
    print("  └──────────────────────────────────────────────────────────────┘")

    for i, (brand_name, owner_email, owner_pass, stores) in enumerate(SOURCE):
        print(f"\n  {icons[i]} {brand_name}")
        print(f"     {'Role':<12} : Brand Owner")
        print(f"     {'Email':<12} : {owner_email}")
        print(f"     {'Password':<12} : {owner_pass}")
        print(f"     {'Store Managers':<12}:")
        for store_name, mgr_email, mgr_pass in stores:
            print(f"       {store_name:<30}  {mgr_email:<42}  {mgr_pass}")

    print("\n" + "=" * 70)
    print(f"  Login URL : https://retailer.avopay.pro/login")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
