import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from datetime import datetime
import logging
import os
from app.core.config import settings
from app.db.database import get_database

logger = logging.getLogger("email_service")

def send_email_sync(recipient: str, subject: str, html_content: str, attachments: list = None, sender_name: str = None) -> bool:
    """
    Synchronous SMTP sending function executed inside a thread pool.
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        
        # Build dynamic From header using the retailer/brand name if provided
        from_addr = settings.EMAIL_FROM
        if sender_name:
            email_part = settings.EMAIL_FROM.split("<")[-1].replace(">", "").strip() if "<" in settings.EMAIL_FROM else settings.EMAIL_FROM
            from_addr = f"{sender_name} <{email_part}>"
            
        msg["From"] = from_addr
        msg["To"] = recipient

        # Attach HTML content
        msg.attach(MIMEText(html_content, "html"))

        # Attach optional files
        if attachments:
            for filepath in attachments:
                if os.path.exists(filepath):
                    with open(filepath, "rb") as f:
                        part = MIMEApplication(f.read(), Name=os.path.basename(filepath))
                        part['Content-Disposition'] = f'attachment; filename="{os.path.basename(filepath)}"'
                        msg.attach(part)
                else:
                    logger.warning(f"Attachment file not found: {filepath}")

        # Resolve raw envelope sender address
        sender_email = settings.EMAIL_USER
        if "<" in settings.EMAIL_FROM:
            sender_email = settings.EMAIL_FROM.split("<")[-1].replace(">", "").strip()

        # Connect and send
        port = int(settings.EMAIL_PORT)
        if port == 465:
            with smtplib.SMTP_SSL(settings.EMAIL_HOST, port, timeout=10) as server:
                server.login(settings.EMAIL_USER, settings.EMAIL_PASS)
                server.sendmail(sender_email, recipient, msg.as_string())
        else:
            with smtplib.SMTP(settings.EMAIL_HOST, port, timeout=10) as server:
                if port == 587:
                    server.starttls()
                server.login(settings.EMAIL_USER, settings.EMAIL_PASS)
                server.sendmail(sender_email, recipient, msg.as_string())
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {recipient} via SMTP: {str(e)}")
        raise e

async def send_email(event_name: str, recipient: str, subject: str, html_content: str, attachments: list = None, sender_name: str = None) -> bool:
    """
    Sends email asynchronously. Logs status and errors into MongoDB collection `email_logs`.
    Fails gracefully without raising exceptions.
    """
    if not recipient or recipient == "unknown":
        logger.warning(f"Skipping email for event {event_name} due to missing/invalid recipient email.")
        return False

    sent_time = datetime.utcnow()
    status = "failed"
    error_msg = None
    try:
        # Offload synchronous SMTP sending to avoid blocking FastAPI's async main thread
        success = await asyncio.to_thread(send_email_sync, recipient, subject, html_content, attachments, sender_name)
        if success:
            status = "success"
    except Exception as e:
        error_msg = str(e)

    # Save to MongoDB email_logs
    try:
        db = get_database()
        if db is not None:
            await db["email_logs"].insert_one({
                "recipient_email": recipient,
                "event_name": event_name,
                "subject": subject,
                "sent_time": sent_time,
                "status": status,
                "error_message": error_msg
            })
    except Exception as db_err:
        logger.error(f"Failed to save email log to MongoDB: {str(db_err)}")

    return status == "success"

