import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.utils import make_msgid, formatdate
from datetime import datetime
import logging
import os
import re
from app.core.config import settings
from app.db.database import get_database

logger = logging.getLogger("email_service")

def html_to_text(html: str) -> str:
    # Basic regex-based HTML-to-text converter to provide clean plain-text fallback
    text = re.sub(r'<script[^>]*>([\s\S]*?)</script>', '', html)
    text = re.sub(r'<style[^>]*>([\s\S]*?)</style>', '', text)
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)</a>', r'\2 (\1)', text)
    text = re.sub(r'<p[^>]*>', '\n', text)
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\n+', '\n', text)
    return text.strip()

def send_email_sync(recipient: str, subject: str, html_content: str, attachments: list = None, sender_name: str = None) -> bool:
    """
    Synchronous SMTP sending function executed inside a thread pool.
    """
    try:
        if attachments:
            msg = MIMEMultipart("mixed")
        else:
            msg = MIMEMultipart("alternative")

        msg["Subject"] = subject
        
        # Build dynamic From header using the retailer/brand name with authenticated user email
        display_name = sender_name or "Retailer Platform"
        # Always use the authenticated Gmail user as the From email address to pass SPF/DKIM
        from_addr = f"{display_name} <{settings.EMAIL_USER}>"
            
        msg["From"] = from_addr
        msg["To"] = recipient
        msg["Message-ID"] = make_msgid()
        msg["Date"] = formatdate(localtime=True)
        msg["X-Mailer"] = "Python SMTP Mailer"

        # Assemble the alternative parts (text and html)
        msg_alternative = MIMEMultipart("alternative")
        if attachments:
            msg.attach(msg_alternative)
            alt_target = msg_alternative
        else:
            alt_target = msg

        # Plain text fallback
        text_content = html_to_text(html_content)
        part_text = MIMEText(text_content, "plain", "utf-8")
        alt_target.attach(part_text)

        # HTML part
        part_html = MIMEText(html_content, "html", "utf-8")
        alt_target.attach(part_html)

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

        # Envelope sender
        sender_email = settings.EMAIL_USER

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

