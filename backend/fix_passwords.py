"""
Fix script: Re-hash all user passwords with bcrypt 4.0.1 (passlib compatible).
Needed because old hashes were created with bcrypt 5.0.0 which is incompatible.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "retailcrm_db"

USER_PASSWORDS = {
    "admin@retailcrm.io": "admin123",
    "brandowner@fashionbrand.io": "brand123",
    "manager@delhistore.io": "store123",
    "cashier@fashionbrand.io": "cashier123",
    "marketing@fashionbrand.io": "mktg123",
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def fix_passwords():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    fixed = 0
    for email, password in USER_PASSWORDS.items():
        new_hash = pwd_context.hash(password)
        result = await db["users"].update_one(
            {"email": email},
            {"$set": {"password_hash": new_hash}}
        )
        if result.matched_count > 0:
            print(f"[OK] Fixed password for: {email}")
            fixed += 1
        else:
            print(f"[WARN] User not found: {email}")

    client.close()
    print(f"\n✅ Fixed {fixed} user password hashes.")
    print("\nYou can now login with:")
    for email, pw in USER_PASSWORDS.items():
        print(f"  {email}  /  {pw}")


if __name__ == "__main__":
    asyncio.run(fix_passwords())
