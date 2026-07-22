from app import app
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3000,
        ssl_certfile="/www/wwwroot/Reatiler/backend/ssl.crt",
        ssl_keyfile="/www/wwwroot/Reatiler/backend/ssl.key",
    )