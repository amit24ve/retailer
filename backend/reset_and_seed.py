
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from app.db.seed import seed_database
from app.db.database import connect_to_mongo
from app.core.config import settings

# Allow overriding via environment variable for one-off runs
MONGODB_URL = os.environ.get("MONGODB_URL", settings.MONGODB_URL)
DATABASE_NAME = os.environ.get("DATABASE_NAME", settings.DATABASE_NAME)


async def reset_db():
    client = AsyncIOMotorClient(MONGODB_URL)
    await client.drop_database(DATABASE_NAME)
    print(f"[OK] Dropped database {DATABASE_NAME}")
    client.close()


async def main():
    await reset_db()
    await connect_to_mongo()
    await seed_database()


if __name__ == "__main__":
    asyncio.run(main())
