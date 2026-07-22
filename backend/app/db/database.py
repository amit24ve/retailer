from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client: AsyncIOMotorClient = None


async def connect_to_mongo():
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"[OK] Connected to MongoDB: {settings.MONGODB_URL}")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("[OK] Disconnected from MongoDB")


def get_database():
    return client[settings.DATABASE_NAME]
