import asyncio
import os
import sys
from datetime import datetime

# Adjust Python path to load app packages
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.db.database import connect_to_mongo, get_database, close_mongo_connection
from app.core.email import send_email
from app.core.templates import get_welcome_email, get_payment_successful_email

async def run_tests():
    print("=== Centralized Email Integration Testing ===")
    
    # 1. Connect to Mongo
    await connect_to_mongo()
    db = get_database()
    
    test_recipient = "rajamit22ve@gmail.com"
    print(f"SMTP Configuration: HOST={settings.EMAIL_HOST}, PORT={settings.EMAIL_PORT}, USER={settings.EMAIL_USER}")
    
    # 2. Test rendering & sending welcome email (Success Case)
    print("\nSending Test Welcome Email...")
    welcome_html = get_welcome_email("Amit Kumar", test_recipient, "Brand Owner")
    success = await send_email(
        event_name="welcome_after_account_creation",
        recipient=test_recipient,
        subject="Welcome to Cuben Retailer (Test)",
        html_content=welcome_html
    )
    print(f"Send status: {'SUCCESS' if success else 'FAILED'}")
    
    # 3. Test payment success email
    print("\nSending Test Payment Success Email...")
    pay_html = get_payment_successful_email("INV-TEST-9999", 15450.50)
    success = await send_email(
        event_name="payment_successful",
        recipient=test_recipient,
        subject="Payment Received (Test) - INV-TEST-9999",
        html_content=pay_html
    )
    print(f"Send status: {'SUCCESS' if success else 'FAILED'}")

    # 4. Verify MongoDB Logs
    print("\nVerifying email logs collection in MongoDB...")
    logs_cursor = db["email_logs"].find().sort("sent_time", -1).limit(5)
    logs = await logs_cursor.to_list(5)
    
    if not logs:
        print("[-] No logs found in email_logs collection.")
    else:
        print(f"[+] Found {len(logs)} logs in MongoDB. Latest logs:")
        for log in logs:
            print(f" - [{log.get('sent_time')}] Event: {log.get('event_name')}, Recipient: {log.get('recipient_email')}, Status: {log.get('status')}, Error: {log.get('error_message')}")
            
    # 5. Clean up connection
    await close_mongo_connection()
    print("\n=== Testing Done ===")

if __name__ == "__main__":
    asyncio.run(run_tests())
