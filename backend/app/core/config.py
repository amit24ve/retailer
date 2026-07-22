from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb+srv://neelbert_test:Neelbert%40123.@cluster0.ijzzjo3.mongodb.net/?appName=Cluster0"
    DATABASE_NAME: str = "retailcrm_db"
    SECRET_KEY: str = "super-secret-jwt-key-change-in-production-minimum-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:5174"

    # WhatsApp Business API (Bonvoice Partners API v3)
    WHATSAPP_PHONE_NUMBER_ID: str = "1203814542811065"
    WHATSAPP_API_KEY: str = "1a84848d-6f82-11f1-894a-02c8a5e042bd"
    WHATSAPP_API_BASE: str = "https://api.msg.bonvoice.com/v3"
    # Testing mode: when true, bulk-send endpoints (campaigns) are capped to 1 message
    # so real payment/credits are not consumed while verifying the integration.
    WHATSAPP_TEST_MODE: bool = True

    # SMS API (mTalkz)
    MTALKZ_PE_ID: str = ""
    MTALKZ_API_URL: str = "https://msgn.mtalkz.com/api"
    MTALKZ_SENDER_ID: str = "AVOPAY"
    MTALKZ_API_KEY: str = ""
    MTALKZ_DLT_TEMPLATE_ID: str = ""
    MTALKZ_TEMPLATE_IDS: str = ""
    SMS_TEST_MODE: bool = False

    # Email SMTP configuration
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 465
    EMAIL_USER: str = "rajamit22ve@gmail.com"
    EMAIL_PASS: str = "aqbz iiyb frnk mluz"
    EMAIL_FROM: str = "Retailer Platform <rajamit22ve@gmail.com>"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()
