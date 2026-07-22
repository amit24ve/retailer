from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import close_mongo_connection, connect_to_mongo
from app.routers import (
    admin,
    analytics,
    auth,
    auto_campaigns,
    brand_owner,
    campaigns,
    coupons,
    customers,
    faqs,
    feedback,
    loyalty,
    membership,
    orders,
    qrcodes,
    referrals,
    smart_insights,
    sms,
    stores,
    whatsapp,
)


def create_app() -> FastAPI:
    app = FastAPI(
        title="RetailCRM API",
        description="Enterprise Loyalty & CRM Platform REST API",
        version="2.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*", ""],
        allow_headers=["*"],
    )

    # Lifecycle events
    @app.on_event("startup")
    async def startup():
        await connect_to_mongo()
        # Seed demo data on first run
        from app.db.seed import seed_database, seed_molecule

        await seed_database()
        # Always ensure Molecule brand exists (idempotent)
        await seed_molecule()

    @app.on_event("shutdown")
    async def shutdown():
        await close_mongo_connection()

    # Health check
    @app.get("/health", tags=["Health"])
    async def health():
        return {"status": "ok", "version": "2.0.0", "platform": "RetailCRM"}

    # Register routers
    PREFIX = "/api/v1"
    app.include_router(auth.router, prefix=PREFIX + "/auth", tags=["Authentication"])
    app.include_router(
        customers.router, prefix=PREFIX + "/customers", tags=["Customers"]
    )
    app.include_router(orders.router, prefix=PREFIX, tags=["Orders & POS"])
    app.include_router(
        loyalty.router, prefix=PREFIX + "/loyalty", tags=["Loyalty Engine"]
    )
    app.include_router(coupons.router, prefix=PREFIX + "/coupons", tags=["Coupons"])
    app.include_router(faqs.router, prefix=PREFIX + "/faqs", tags=["FAQs"])
    app.include_router(
        campaigns.router, prefix=PREFIX + "/campaigns", tags=["Campaigns"]
    )
    app.include_router(
        referrals.router, prefix=PREFIX + "/referrals", tags=["Referrals"]
    )
    app.include_router(stores.router, prefix=PREFIX + "/stores", tags=["Stores"])
    app.include_router(
        analytics.router, prefix=PREFIX + "/analytics", tags=["Analytics"]
    )
    app.include_router(feedback.router, prefix=PREFIX + "/feedback", tags=["Feedback"])
    app.include_router(qrcodes.router, prefix=PREFIX + "/qr-codes", tags=["QR Codes"])
    app.include_router(
        membership.router, prefix=PREFIX + "/membership", tags=["Membership"]
    )
    app.include_router(
        auto_campaigns.router,
        prefix=PREFIX + "/auto-campaigns",
        tags=["Auto Campaigns"],
    )
    app.include_router(
        smart_insights.router,
        prefix=PREFIX + "/smart-insights",
        tags=["Smart Insights"],
    )
    app.include_router(admin.router, prefix=PREFIX + "/admin", tags=["Super Admin"])
    app.include_router(
        brand_owner.router, prefix=PREFIX + "/brand-owner", tags=["Brand Owner"]
    )
    app.include_router(
        whatsapp.router, prefix=PREFIX + "/whatsapp", tags=["WhatsApp"]
    )
    app.include_router(sms.router, prefix=PREFIX + "/sms", tags=["SMS"])

    return app


app = create_app()
