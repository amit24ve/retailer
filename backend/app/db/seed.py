"""
Demo seed data for RetailCRM platform.
Creates: 1 tenant, 1 brand, 6 stores, 5 users, 48 customers, 120 orders, loyalty ledger entries, coupons, referrals, campaigns.
"""

import random
import uuid
from datetime import datetime, timedelta

from app.core.security import get_password_hash
from app.db.database import connect_to_mongo, get_database


def uid():
    return str(uuid.uuid4())


def now():
    return datetime.utcnow()


def days_ago(n):
    return datetime.utcnow() - timedelta(days=n)


TENANT_ID = "tenant-fashion-group-001"
BRAND_ID = "brand-fashion-india-001"

STORE_DATA = [
    {
        "store_id": "s1",
        "name": "New Delhi Flagship",
        "store_code": "DEL-FLAGSHIP-01",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "address": "Connaught Place, New Delhi",
    },
    {
        "store_id": "s2",
        "name": "Mumbai Colaba",
        "store_code": "MUM-COLABA-01",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "address": "Colaba Causeway, Mumbai",
    },
    {
        "store_id": "s3",
        "name": "Bengaluru Indiranagar",
        "store_code": "BLR-INDNR-01",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560038",
        "address": "100 Feet Road, Indiranagar",
    },
    {
        "store_id": "s4",
        "name": "Noida Mall Store",
        "store_code": "NOI-MALL-01",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "pincode": "201301",
        "address": "Sector 18, Atta Market",
    },
    {
        "store_id": "s5",
        "name": "Pune Camp",
        "store_code": "PUN-CAMP-01",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411001",
        "address": "MG Road, Camp",
    },
    {
        "store_id": "s6",
        "name": "Chennai T Nagar",
        "store_code": "CHE-TNAGAR-01",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "pincode": "600017",
        "address": "Pondy Bazaar, T Nagar",
    },
]

USER_DATA = [
    {
        "email": "admin@retailcrm.io",
        "password": "admin123",
        "full_name": "Platform Administrator",
        "role": "Super Admin",
        "brand_name": "RetailCRM Platform",
        "store_id": None,
    },
    {
        "email": "brandowner@fashionbrand.io",
        "password": "brand123",
        "full_name": "Rajesh Kumar",
        "role": "Brand Owner",
        "brand_name": "Fashion Brand India",
        "store_id": None,
    },
    {
        "email": "manager@delhistore.io",
        "password": "store123",
        "full_name": "Arjun Patel",
        "role": "Store Manager",
        "brand_name": "Fashion Brand India",
        "store_id": "s1",
    },
    {
        "email": "cashier@fashionbrand.io",
        "password": "cashier123",
        "full_name": "Kavita Rao",
        "role": "Cashier",
        "brand_name": "Fashion Brand India",
        "store_id": "s1",
    },
    {
        "email": "marketing@fashionbrand.io",
        "password": "mktg123",
        "full_name": "Meera Sharma",
        "role": "Marketing Manager",
        "brand_name": "Fashion Brand India",
        "store_id": None,
    },
]

CUSTOMER_NAMES = [
    "Siddharth Sharma",
    "Priya Patel",
    "Rahul Gupta",
    "Anjali Singh",
    "Vikram Mehta",
    "Neha Joshi",
    "Arjun Kumar",
    "Deepa Nair",
    "Rohan Kapoor",
    "Sneha Reddy",
    "Aditya Verma",
    "Pooja Iyer",
    "Karan Malhotra",
    "Divya Krishnamurthy",
    "Amit Shah",
    "Sunita Rao",
    "Ravi Shankar",
    "Preethi Menon",
    "Suresh Babu",
    "Ananya Chatterjee",
    "Manish Agarwal",
    "Rashmi Desai",
    "Santosh Pillai",
    "Lavanya Kumar",
    "Gaurav Tiwari",
    "Swati Sinha",
    "Naveen Reddy",
    "Archana Nair",
    "Varun Khanna",
    "Smita Jain",
    "Harish Gowda",
    "Kaveri Subramanian",
    "Ranjit Singh",
    "Meenakshi Sundaram",
    "Arun Pandey",
    "Shweta Bhatia",
    "Dinesh Choudhary",
    "Nandini Prasad",
    "Rajiv Sharma",
    "Shilpa Kulkarni",
    "Vinay Hegde",
    "Padma Venkatesh",
    "Girish Naik",
    "Savitha Rao",
    "Pavan Kumar",
    "Anita Joshi",
    "Sunil Patil",
    "Mamta Gupta",
]

TIERS = ["Silver", "Gold", "Platinum", "Diamond"]
TIER_WEIGHTS = [0.55, 0.30, 0.12, 0.03]


async def seed_database():
    db = get_database()

    # Check if already seeded
    if await db["tenants"].find_one({"tenant_id": TENANT_ID}):
        print("[INFO] Seed data already exists, skipping...")
        return

    print("[INFO] Seeding demo database...")

    # 1. Tenant
    await db["tenants"].insert_one(
        {
            "tenant_id": TENANT_ID,
            "name": "Fashion Group India Pvt Ltd",
            "subdomain": "fashiongroup",
            "status": "active",
            "billing_plan": "enterprise",
            "created_at": days_ago(400),
            "updated_at": now(),
        }
    )

    # 2. Brand
    await db["brands"].insert_one(
        {
            "brand_id": BRAND_ID,
            "tenant_id": TENANT_ID,
            "name": "Fashion Brand India",
            "logo_url": "https://ui-avatars.com/api/?name=FBI&background=7c3aed&color=fff",
            "currency": "INR",
            "settings": {
                "points_per_100": 10,
                "point_to_inr": 0.10,
                "calculation_window_days": 365,
                "min_redemption_points": 500,
                "max_redemption_pct": 0.50,
            },
            "created_at": days_ago(400),
            "updated_at": now(),
        }
    )

    # 3. Stores
    stores_docs = []
    for s in STORE_DATA:
        stores_docs.append(
            {
                **s,
                "brand_id": BRAND_ID,
                "tenant_id": TENANT_ID,
                "status": "active" if s["store_id"] != "s6" else "inactive",
                "geo_location": None,
                "created_at": days_ago(380),
            }
        )
    await db["stores"].insert_many(stores_docs)

    # 4. Users
    user_docs = []
    for u in USER_DATA:
        user_docs.append(
            {
                "user_id": uid(),
                "tenant_id": TENANT_ID,
                "brand_id": BRAND_ID,
                "store_id": u.get("store_id"),
                "username": u["email"].split("@")[0],
                "email": u["email"],
                "password_hash": get_password_hash(u["password"]),
                "full_name": u["full_name"],
                "role": u["role"],
                "brand_name": u["brand_name"],
                "phone": f"+91990000000{len(user_docs)}",
                "status": "active",
                "last_login": days_ago(random.randint(0, 5)),
                "created_at": days_ago(350),
            }
        )
    await db["users"].insert_many(user_docs)

    # 5. Customers
    customer_ids = []
    customer_docs = []
    for i, name in enumerate(CUSTOMER_NAMES):
        cid = uid()
        customer_ids.append(cid)
        tier = random.choices(TIERS, weights=TIER_WEIGHTS)[0]
        ltv = {
            "Silver": random.randint(500, 9999),
            "Gold": random.randint(10000, 49999),
            "Platinum": random.randint(50000, 99999),
            "Diamond": random.randint(100000, 300000),
        }[tier]
        churn_prob = random.uniform(0.02, 0.95)
        dob_year = random.randint(1980, 2000)
        customer_docs.append(
            {
                "customer_id": cid,
                "brand_id": BRAND_ID,
                "tenant_id": TENANT_ID,
                "custom_id": f"CUS{str(10000 + i).zfill(6)}",
                "name": name,
                "mobile": f"+9198765{str(43210 + i).zfill(5)}",
                "email": f"{name.lower().replace(' ', '.')}@email.com",
                "gender": random.choice(["Male", "Female"]),
                "dob": datetime(dob_year, random.randint(1, 12), random.randint(1, 28)),
                "anniversary": datetime(
                    random.randint(2010, 2020),
                    random.randint(1, 12),
                    random.randint(1, 28),
                )
                if i % 3 == 0
                else None,
                "address": f"Flat {random.randint(1, 500)}, Block {random.choice('ABCDEFGH')}",
                "city": random.choice(
                    ["New Delhi", "Mumbai", "Bengaluru", "Pune", "Noida", "Chennai"]
                ),
                "state": random.choice(
                    ["Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh", "Tamil Nadu"]
                ),
                "pincode": str(random.randint(100000, 799999)),
                "loyalty_tier": tier,
                "lifetime_value": float(ltv),
                "total_purchases": random.randint(1, 80),
                "last_purchase_date": days_ago(random.randint(1, 120)),
                "current_points_balance": random.randint(0, 8000),
                "lifetime_points_earned": random.randint(100, 50000),
                "cashback_wallet_balance": float(random.randint(0, 25000)),
                "referral_count": random.randint(0, 15),
                "referral_code": f"REF{name[:3].upper()}{str(1000 + i)}",
                "feedback_score": round(random.uniform(4.0, 10.0), 2),
                "churn_probability": round(churn_prob, 4),
                "status": "churned"
                if churn_prob > 0.88
                else ("inactive" if churn_prob > 0.72 else "active"),
                "created_at": days_ago(random.randint(30, 400)),
                "updated_at": now(),
            }
        )
    await db["customers"].insert_many(customer_docs)

    # 6. Orders
    order_docs = []
    store_ids = [s["store_id"] for s in STORE_DATA[:5]]
    for i in range(120):
        cid = random.choice(customer_ids)
        gross = float(random.randint(500, 20000))
        tax = round(gross * 0.18, 2)
        discount = float(random.randint(0, 1000)) if random.random() > 0.7 else 0
        net = round(gross + tax - discount, 2)
        points_earned = int(gross / 10)
        order_docs.append(
            {
                "order_id": uid(),
                "brand_id": BRAND_ID,
                "tenant_id": TENANT_ID,
                "store_id": random.choice(store_ids),
                "store_name": random.choice([s["name"] for s in STORE_DATA[:5]]),
                "customer_id": cid,
                "customer_name": random.choice(CUSTOMER_NAMES),
                "invoice_number": f"INV-2026-{9000 + i}",
                "gross_amount": gross,
                "tax_amount": tax,
                "discount_amount": discount,
                "net_amount": net,
                "points_earned": points_earned,
                "points_redeemed": random.randint(0, 500)
                if random.random() > 0.8
                else 0,
                "cashback_wallet_applied": 0.0,
                "payment_status": random.choices(
                    ["completed", "completed", "completed", "pending", "refunded"],
                    weights=[70, 10, 10, 5, 5],
                )[0],
                "items": [],
                "created_at": days_ago(random.randint(0, 90)),
            }
        )
    await db["orders"].insert_many(order_docs)

    # 7. Loyalty rules
    await db["loyalty_rules"].insert_many(
        [
            {
                "rule_id": uid(),
                "brand_id": BRAND_ID,
                "name": "Base Points Earning — 10 pts per ₹100",
                "rule_type": "points_earning",
                "conditions": {"min_cart_value": 100, "categories": "all"},
                "actions": {"points_per_100": 10},
                "is_active": True,
                "start_date": days_ago(365),
                "end_date": None,
                "created_at": days_ago(365),
            },
            {
                "rule_id": uid(),
                "brand_id": BRAND_ID,
                "name": "Electronics Category — 1.5x Multiplier",
                "rule_type": "points_earning",
                "conditions": {"category": "Electronics"},
                "actions": {"multiplier": 1.5},
                "is_active": True,
                "start_date": days_ago(180),
                "end_date": None,
                "created_at": days_ago(180),
            },
            {
                "rule_id": uid(),
                "brand_id": BRAND_ID,
                "name": "Gold Tier Cashback — 4%",
                "rule_type": "cashback",
                "conditions": {"loyalty_tier": "Gold"},
                "actions": {"cashback_pct": 4},
                "is_active": True,
                "start_date": days_ago(365),
                "end_date": None,
                "created_at": days_ago(365),
            },
            {
                "rule_id": uid(),
                "brand_id": BRAND_ID,
                "name": "5th Visit Milestone — ₹200 Flat Coupon",
                "rule_type": "visits",
                "conditions": {"visit_milestone": 5, "min_spend_per_visit": 500},
                "actions": {"reward_type": "flat_coupon", "value": 200},
                "is_active": True,
                "start_date": days_ago(200),
                "end_date": None,
                "created_at": days_ago(200),
            },
            {
                "rule_id": uid(),
                "brand_id": BRAND_ID,
                "name": "Birthday Double Points — 24hr Window",
                "rule_type": "points_earning",
                "conditions": {"trigger": "birthday_date"},
                "actions": {"multiplier": 2.0, "duration_hours": 24},
                "is_active": True,
                "start_date": days_ago(365),
                "end_date": None,
                "created_at": days_ago(365),
            },
        ]
    )

    # 8. Coupons
    await db["coupons"].insert_many(
        [
            {
                "coupon_id": uid(),
                "brand_id": BRAND_ID,
                "code": "FESTIVE500",
                "discount_type": "flat",
                "discount_value": 500,
                "max_discount_cap": None,
                "min_cart_value": 3000,
                "usage_limit_global": 500,
                "usage_limit_per_customer": 1,
                "current_use_count": 142,
                "is_active": True,
                "expiry_date": datetime(2026, 12, 31, 23, 59),
                "created_at": days_ago(60),
            },
            {
                "coupon_id": uid(),
                "brand_id": BRAND_ID,
                "code": "GOLD15",
                "discount_type": "percentage",
                "discount_value": 15,
                "max_discount_cap": 1000,
                "min_cart_value": 1000,
                "usage_limit_global": 0,
                "usage_limit_per_customer": 2,
                "current_use_count": 89,
                "is_active": True,
                "expiry_date": datetime(2026, 8, 31, 23, 59),
                "created_at": days_ago(90),
            },
            {
                "coupon_id": uid(),
                "brand_id": BRAND_ID,
                "code": "CASHBACK10",
                "discount_type": "cashback",
                "discount_value": 10,
                "max_discount_cap": None,
                "min_cart_value": 2000,
                "usage_limit_global": 0,
                "usage_limit_per_customer": 1,
                "current_use_count": 218,
                "is_active": True,
                "expiry_date": datetime(2026, 9, 30, 23, 59),
                "created_at": days_ago(45),
            },
            {
                "coupon_id": uid(),
                "brand_id": BRAND_ID,
                "code": "HOLIDAY50",
                "discount_type": "percentage",
                "discount_value": 50,
                "max_discount_cap": 500,
                "min_cart_value": 3000,
                "usage_limit_global": 200,
                "usage_limit_per_customer": 1,
                "current_use_count": 50,
                "is_active": True,
                "expiry_date": datetime(2026, 12, 31, 23, 59),
                "created_at": days_ago(30),
            },
            {
                "coupon_id": uid(),
                "brand_id": BRAND_ID,
                "code": "WINBACK250",
                "discount_type": "flat",
                "discount_value": 250,
                "max_discount_cap": None,
                "min_cart_value": 0,
                "usage_limit_global": 0,
                "usage_limit_per_customer": 1,
                "current_use_count": 67,
                "is_active": False,
                "expiry_date": datetime(2026, 5, 1, 23, 59),
                "created_at": days_ago(120),
            },
        ]
    )

    # 9. Referrals
    ref_docs = []
    statuses = ["pending", "signed_up", "purchased", "rewarded", "expired"]
    for i in range(20):
        ref_docs.append(
            {
                "referral_id": uid(),
                "brand_id": BRAND_ID,
                "referrer_id": customer_ids[i % len(customer_ids)],
                "referrer_name": CUSTOMER_NAMES[i % len(CUSTOMER_NAMES)],
                "referred_mobile": f"+9199000{str(10000 + i).zfill(5)}",
                "status": random.choice(statuses),
                "referrer_reward_credited": random.random() > 0.6,
                "referred_reward_credited": random.random() > 0.6,
                "created_at": days_ago(random.randint(1, 90)),
                "rewarded_at": days_ago(random.randint(0, 30))
                if random.random() > 0.6
                else None,
            }
        )
    await db["referrals"].insert_many(ref_docs)

    # 10. WhatsApp campaigns
    await db["campaigns"].insert_many(
        [
            {
                "campaign_id": uid(),
                "brand_id": BRAND_ID,
                "name": "Churn Win-Back Flow",
                "status": "active",
                "trigger": "Customer inactive 60 days",
                "workflow_nodes": [],
                "sent": 4820,
                "opened": 3241,
                "converted": 782,
                "created_at": days_ago(30),
            },
            {
                "campaign_id": uid(),
                "brand_id": BRAND_ID,
                "name": "Birthday Celebration",
                "status": "active",
                "trigger": "Birthday date match",
                "workflow_nodes": [],
                "sent": 1240,
                "opened": 1180,
                "converted": 420,
                "created_at": days_ago(90),
            },
            {
                "campaign_id": uid(),
                "brand_id": BRAND_ID,
                "name": "Post-Purchase NPS",
                "status": "active",
                "trigger": "1hr after order complete",
                "workflow_nodes": [],
                "sent": 8440,
                "opened": 6200,
                "converted": 2100,
                "created_at": days_ago(120),
            },
            {
                "campaign_id": uid(),
                "brand_id": BRAND_ID,
                "name": "Tier Upgrade Congrats",
                "status": "paused",
                "trigger": "Loyalty tier upgrade event",
                "workflow_nodes": [],
                "sent": 321,
                "opened": 298,
                "converted": 180,
                "created_at": days_ago(60),
            },
            {
                "campaign_id": uid(),
                "brand_id": BRAND_ID,
                "name": "Points Expiry Alert",
                "status": "active",
                "trigger": "Points expiring in 7 days",
                "workflow_nodes": [],
                "sent": 2180,
                "opened": 1820,
                "converted": 890,
                "created_at": days_ago(45),
            },
        ]
    )

    print("[OK] Seed data inserted successfully!")
    print(
        "   Users: admin@retailcrm.io / brandowner@fashionbrand.io / manager@delhistore.io"
    )
    print("   Stores: 6 stores across India")
    print("   Customers: 48 with realistic loyalty data")
    print("   Orders: 120 transactions")


# ─── Multi-brand seed (idempotent — safe to call on every startup) ─────────────
BRANDS_DATA = [
    {
        "name": "Molecule",
        "slug": "molecule",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "stores": [
            {
                "name": "Molecule - Noida Sector 98",
                "code": "MOL-NOI-98",
                "city": "Noida",
                "state": "UP",
                "pincode": "201304",
            },
            {
                "name": "Molecule - Meerut",
                "code": "MOL-MER-01",
                "city": "Meerut",
                "state": "UP",
                "pincode": "250001",
            },
            {
                "name": "Molecule - Mathura",
                "code": "MOL-MTH-01",
                "city": "Mathura",
                "state": "UP",
                "pincode": "281001",
            },
            {
                "name": "Molecule - Allahabad",
                "code": "MOL-ALD-01",
                "city": "Prayagraj",
                "state": "UP",
                "pincode": "211001",
            },
        ],
    },
    {
        "name": "Zudio",
        "slug": "zudio",
        "city": "Lucknow",
        "state": "Uttar Pradesh",
        "stores": [
            {
                "name": "Zudio - Lucknow Hazratganj",
                "code": "ZUD-LKO-01",
                "city": "Lucknow",
                "state": "UP",
                "pincode": "226001",
            },
            {
                "name": "Zudio - Kanpur",
                "code": "ZUD-KNP-01",
                "city": "Kanpur",
                "state": "UP",
                "pincode": "208001",
            },
            {
                "name": "Zudio - Varanasi",
                "code": "ZUD-VNS-01",
                "city": "Varanasi",
                "state": "UP",
                "pincode": "221001",
            },
            {
                "name": "Zudio - Gorakhpur",
                "code": "ZUD-GKP-01",
                "city": "Gorakhpur",
                "state": "UP",
                "pincode": "273001",
            },
        ],
    },
    {
        "name": "Trends",
        "slug": "trends",
        "city": "Delhi",
        "state": "Delhi",
        "stores": [
            {
                "name": "Trends - Delhi CP",
                "code": "TRD-DEL-CP",
                "city": "New Delhi",
                "state": "Delhi",
                "pincode": "110001",
            },
            {
                "name": "Trends - Noida",
                "code": "TRD-NOI-01",
                "city": "Noida",
                "state": "UP",
                "pincode": "201301",
            },
            {
                "name": "Trends - Gurugram",
                "code": "TRD-GGN-01",
                "city": "Gurugram",
                "state": "HR",
                "pincode": "122001",
            },
            {
                "name": "Trends - Faridabad",
                "code": "TRD-FBD-01",
                "city": "Faridabad",
                "state": "HR",
                "pincode": "121001",
            },
        ],
    },
    {
        "name": "Manyavar",
        "slug": "manyavar",
        "city": "Jaipur",
        "state": "Rajasthan",
        "stores": [
            {
                "name": "Manyavar - Jaipur",
                "code": "MNV-JAI-01",
                "city": "Jaipur",
                "state": "RJ",
                "pincode": "302001",
            },
            {
                "name": "Manyavar - Kota",
                "code": "MNV-KOT-01",
                "city": "Kota",
                "state": "RJ",
                "pincode": "324001",
            },
            {
                "name": "Manyavar - Udaipur",
                "code": "MNV-UDR-01",
                "city": "Udaipur",
                "state": "RJ",
                "pincode": "313001",
            },
            {
                "name": "Manyavar - Ajmer",
                "code": "MNV-AJM-01",
                "city": "Ajmer",
                "state": "RJ",
                "pincode": "305001",
            },
        ],
    },
    {
        "name": "Biba",
        "slug": "biba",
        "city": "Mumbai",
        "state": "Maharashtra",
        "stores": [
            {
                "name": "Biba - Mumbai Andheri",
                "code": "BBA-MUM-AND",
                "city": "Mumbai",
                "state": "MH",
                "pincode": "400053",
            },
            {
                "name": "Biba - Navi Mumbai",
                "code": "BBA-NMB-01",
                "city": "Navi Mumbai",
                "state": "MH",
                "pincode": "400614",
            },
            {
                "name": "Biba - Pune",
                "code": "BBA-PUN-01",
                "city": "Pune",
                "state": "MH",
                "pincode": "411001",
            },
            {
                "name": "Biba - Nashik",
                "code": "BBA-NSK-01",
                "city": "Nashik",
                "state": "MH",
                "pincode": "422001",
            },
        ],
    },
    {
        "name": "Max Fashion",
        "slug": "maxfashion",
        "city": "Hyderabad",
        "state": "Telangana",
        "stores": [
            {
                "name": "Max Fashion - Hyderabad",
                "code": "MAX-HYD-01",
                "city": "Hyderabad",
                "state": "TS",
                "pincode": "500001",
            },
            {
                "name": "Max Fashion - Secunderabad",
                "code": "MAX-SCB-01",
                "city": "Secunderabad",
                "state": "TS",
                "pincode": "500003",
            },
            {
                "name": "Max Fashion - Vijayawada",
                "code": "MAX-VJW-01",
                "city": "Vijayawada",
                "state": "AP",
                "pincode": "520001",
            },
            {
                "name": "Max Fashion - Visakhapatnam",
                "code": "MAX-VZG-01",
                "city": "Visakhapatnam",
                "state": "AP",
                "pincode": "530001",
            },
        ],
    },
    {
        "name": "Pantaloons",
        "slug": "pantaloons",
        "city": "Kolkata",
        "state": "West Bengal",
        "stores": [
            {
                "name": "Pantaloons - Kolkata",
                "code": "PNT-KOL-01",
                "city": "Kolkata",
                "state": "WB",
                "pincode": "700001",
            },
            {
                "name": "Pantaloons - Howrah",
                "code": "PNT-HWH-01",
                "city": "Howrah",
                "state": "WB",
                "pincode": "711101",
            },
            {
                "name": "Pantaloons - Siliguri",
                "code": "PNT-SLG-01",
                "city": "Siliguri",
                "state": "WB",
                "pincode": "734001",
            },
            {
                "name": "Pantaloons - Durgapur",
                "code": "PNT-DGP-01",
                "city": "Durgapur",
                "state": "WB",
                "pincode": "713201",
            },
        ],
    },
    {
        "name": "Westside",
        "slug": "westside",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "stores": [
            {
                "name": "Westside - Chennai",
                "code": "WST-CHE-01",
                "city": "Chennai",
                "state": "TN",
                "pincode": "600001",
            },
            {
                "name": "Westside - Coimbatore",
                "code": "WST-CBE-01",
                "city": "Coimbatore",
                "state": "TN",
                "pincode": "641001",
            },
            {
                "name": "Westside - Madurai",
                "code": "WST-MDU-01",
                "city": "Madurai",
                "state": "TN",
                "pincode": "625001",
            },
            {
                "name": "Westside - Salem",
                "code": "WST-SLM-01",
                "city": "Salem",
                "state": "TN",
                "pincode": "636001",
            },
        ],
    },
    {
        "name": "Shoppers Stop",
        "slug": "shoppersstop",
        "city": "Bengaluru",
        "state": "Karnataka",
        "stores": [
            {
                "name": "Shoppers Stop - MG Road",
                "code": "SPS-BLR-MG",
                "city": "Bengaluru",
                "state": "KA",
                "pincode": "560001",
            },
            {
                "name": "Shoppers Stop - Whitefield",
                "code": "SPS-BLR-WF",
                "city": "Bengaluru",
                "state": "KA",
                "pincode": "560066",
            },
            {
                "name": "Shoppers Stop - Mysuru",
                "code": "SPS-MYS-01",
                "city": "Mysuru",
                "state": "KA",
                "pincode": "570001",
            },
            {
                "name": "Shoppers Stop - Hubli",
                "code": "SPS-HBL-01",
                "city": "Hubli",
                "state": "KA",
                "pincode": "580020",
            },
        ],
    },
    {
        "name": "Lifestyle",
        "slug": "lifestyle",
        "city": "Kochi",
        "state": "Kerala",
        "stores": [
            {
                "name": "Lifestyle - Kochi",
                "code": "LFS-KOC-01",
                "city": "Kochi",
                "state": "KL",
                "pincode": "682001",
            },
            {
                "name": "Lifestyle - Trivandrum",
                "code": "LFS-TVM-01",
                "city": "Trivandrum",
                "state": "KL",
                "pincode": "695001",
            },
            {
                "name": "Lifestyle - Kozhikode",
                "code": "LFS-KZD-01",
                "city": "Kozhikode",
                "state": "KL",
                "pincode": "673001",
            },
            {
                "name": "Lifestyle - Thrissur",
                "code": "LFS-TCR-01",
                "city": "Thrissur",
                "state": "KL",
                "pincode": "680001",
            },
        ],
    },
]


async def seed_all_brands():
    """Idempotent — seeds all 10 brands with complete user hierarchy. Safe on every startup."""
    db = get_database()

    # Fix existing seed passwords on every startup
    SEED_FIXES = {
        "admin@retailcrm.io": "admin123",
        "brandowner@fashionbrand.io": "brand123",
        "manager@delhistore.io": "store123",
        "cashier@fashionbrand.io": "cashier123",
        "marketing@fashionbrand.io": "mktg123",
    }
    for email, pw in SEED_FIXES.items():
        await db["users"].update_one(
            {"email": email}, {"$set": {"password_hash": get_password_hash(pw)}}
        )

    for brand_data in BRANDS_DATA:
        name = brand_data["name"]
        slug = brand_data["slug"]
        name_no_space = name.replace(" ", "")

        # Skip if brand already exists
        if await db["brands"].find_one({"name": name}):
            print(f"[INFO] Brand '{name}' already exists, skipping.")
            continue

        print(f"[INFO] Seeding brand '{name}'...")

        brand_id = f"brand-{slug}-{uid()[:8]}"
        tenant_id = f"tenant-{brand_id}"

        # ── Brand document ────────────────────────────────────────────────────
        await db["brands"].insert_one(
            {
                "brand_id": brand_id,
                "tenant_id": tenant_id,
                "name": name,
                "slug": slug,
                "logo_url": f"https://ui-avatars.com/api/?name={name_no_space[:2].upper()}&background=0d9488&color=fff",
                "city": brand_data["city"],
                "state": brand_data["state"],
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

        # ── Brand Owner ───────────────────────────────────────────────────────
        await db["users"].insert_one(
            {
                "user_id": uid(),
                "tenant_id": tenant_id,
                "brand_id": brand_id,
                "store_id": None,
                "username": f"owner.{slug}",
                "email": f"owner@{slug}.in",
                "password_hash": get_password_hash(f"{name_no_space}@Owner2026"),
                "full_name": f"{name} Owner",
                "role": "Brand Owner",
                "brand_name": name,
                "store_name": None,
                "phone": "",
                "status": "active",
                "last_login": None,
                "created_at": now(),
            }
        )

        # ── Brand Admin ───────────────────────────────────────────────────────
        await db["users"].insert_one(
            {
                "user_id": uid(),
                "tenant_id": tenant_id,
                "brand_id": brand_id,
                "store_id": None,
                "username": f"admin.{slug}",
                "email": f"admin@{slug}.in",
                "password_hash": get_password_hash(f"{name_no_space}@Admin2026"),
                "full_name": f"{name} Admin",
                "role": "Brand Admin",
                "brand_name": name,
                "store_name": None,
                "phone": "",
                "status": "active",
                "last_login": None,
                "created_at": now(),
            }
        )

        # ── Stores + per-store staff ──────────────────────────────────────────
        for store_info in brand_data["stores"]:
            store_id = uid()
            code = store_info["code"]
            code_lower = code.lower().replace("-", ".")
            store_name = store_info["name"]

            await db["stores"].insert_one(
                {
                    "store_id": store_id,
                    "brand_id": brand_id,
                    "tenant_id": tenant_id,
                    "store_code": code,
                    "name": store_name,
                    "city": store_info["city"],
                    "state": store_info["state"],
                    "pincode": store_info["pincode"],
                    "address": f"{store_name}, {store_info['city']}, {store_info['state']}",
                    "status": "active",
                    "geo_location": None,
                    "created_at": now(),
                }
            )

            store_users = [
                {
                    "role": "Store Manager",
                    "email": f"sm.{code_lower}@{slug}.in",
                    "username": f"sm.{code_lower}",
                    "full_name": f"{store_name} Manager",
                    "password": "StoreManager@2026",
                },
                {
                    "role": "Cashier",
                    "email": f"cashier.{code_lower}@{slug}.in",
                    "username": f"cashier.{code_lower}",
                    "full_name": f"{store_name} Cashier",
                    "password": "Cashier@2026",
                },
                {
                    "role": "Sales Executive",
                    "email": f"sales.{code_lower}@{slug}.in",
                    "username": f"sales.{code_lower}",
                    "full_name": f"{store_name} Sales Executive",
                    "password": "Sales@2026",
                },
            ]

            for su in store_users:
                if not await db["users"].find_one({"email": su["email"]}):
                    await db["users"].insert_one(
                        {
                            "user_id": uid(),
                            "tenant_id": tenant_id,
                            "brand_id": brand_id,
                            "store_id": store_id,
                            "username": su["username"],
                            "email": su["email"],
                            "password_hash": get_password_hash(su["password"]),
                            "full_name": su["full_name"],
                            "role": su["role"],
                            "brand_name": name,
                            "store_name": store_name,
                            "phone": "",
                            "status": "active",
                            "last_login": None,
                            "created_at": now(),
                        }
                    )

        print(
            f"[OK] Brand '{name}' seeded — owner@{slug}.in / admin@{slug}.in + {len(brand_data['stores'])} stores."
        )

    print("[OK] All brands seeded.")


async def seed_molecule():
    """Backward compat — delegates to seed_all_brands."""
    await seed_all_brands()
