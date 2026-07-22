from datetime import datetime

def get_base_template(
    subject: str,
    greeting: str,
    body_html: str,
    badge_text: str = None,
    badge_type: str = "info",
    action_text: str = None,
    action_url: str = None
) -> str:
    """
    Unified base HTML email template with Cuben Retailer's premium responsive layout.
    Features: CSS rounded corners, subtle shadows, modern typography, custom badges,
    clear hierarchy, footers, support links, and high accessibility.
    """
    # Color palette map based on badge/alert type
    color_map = {
        "success": {
            "header_gradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            "badge_bg": "#dcfce7",
            "badge_color": "#15803d",
            "accent": "#059669"
        },
        "danger": {
            "header_gradient": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            "badge_bg": "#fee2e2",
            "badge_color": "#b91c1c",
            "accent": "#dc2626"
        },
        "warning": {
            "header_gradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            "badge_bg": "#fef9c3",
            "badge_color": "#a16207",
            "accent": "#d97706"
        },
        "info": {
            "header_gradient": "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            "badge_bg": "#e0f2fe",
            "badge_color": "#0369a1",
            "accent": "#4f46e5"
        }
    }

    style_cfg = color_map.get(badge_type, color_map["info"])
    badge_html = f'<span class="badge" style="background-color: {style_cfg["badge_bg"]}; color: {style_cfg["badge_color"]};">{badge_text}</span>' if badge_text else ""
    
    # Golden primary button
    action_html = f"""
    <div class="btn-container">
        <a href="{action_url}" class="btn" target="_blank">{action_text}</a>
    </div>
    """ if action_text and action_url else ""
    
    current_year = datetime.now().year

    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
    <style>
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }}
        .wrapper {{
            width: 100%;
            background-color: #f3f4f6;
            padding: 40px 0;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }}
        .header {{
            background: {style_cfg["header_gradient"]};
            padding: 36px 32px;
            text-align: center;
        }}
        .logo {{
            color: #ffffff;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.05em;
            margin: 0;
        }}
        .logo-symbol {{
            color: #fbbf24;
            margin-right: 8px;
            font-weight: 900;
        }}
        .content {{
            padding: 40px 32px;
            line-height: 1.625;
        }}
        h1 {{
            font-size: 22px;
            font-weight: 700;
            color: #111827;
            margin-top: 16px;
            margin-bottom: 18px;
            letter-spacing: -0.02em;
        }}
        p {{
            font-size: 15px;
            color: #4b5563;
            margin-top: 0;
            margin-bottom: 20px;
        }}
        .btn-container {{
            text-align: center;
            margin: 32px 0;
        }}
        .btn {{
            display: inline-block;
            background-color: #f59e0b;
            color: #111827 !important;
            font-weight: 700;
            font-size: 15px;
            padding: 14px 36px;
            text-decoration: none;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
            text-align: center;
        }}
        .btn:hover {{
            background-color: #d97706;
        }}
        .footer {{
            background-color: #f9fafb;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #f3f4f6;
        }}
        .footer p {{
            font-size: 13px;
            color: #9ca3af;
            margin: 0 0 10px 0;
        }}
        .footer a {{
            color: #4f46e5;
            text-decoration: none;
            font-weight: 600;
        }}
        .badge {{
            display: inline-block;
            padding: 6px 14px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        .detail-box {{
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
        }}
        .detail-title {{
            font-size: 13px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.075em;
            margin-bottom: 12px;
            border-bottom: 1px dashed #e5e7eb;
            padding-bottom: 6px;
        }}
        .detail-row {{
            margin-bottom: 10px;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
        }}
        .detail-row:last-child {{ margin-bottom: 0; }}
        .detail-label {{ color: #6b7280; font-weight: 500; }}
        .detail-value {{ color: #111827; font-weight: 600; text-align: right; }}
        .step-box {{
            margin-top: 24px;
            border-left: 3px solid #6366f1;
            padding-left: 16px;
            margin-bottom: 24px;
        }}
        .step-item {{
            margin-bottom: 12px;
            font-size: 14px;
        }}
        .step-item:last-child {{ margin-bottom: 0; }}
        .step-num {{
            font-weight: 700;
            color: #4f46e5;
            margin-right: 4px;
        }}
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="logo"><span class="logo-symbol">✦</span>Cuben Retailer</div>
            </div>
            <div class="content">
                {badge_html}
                <h1>{greeting}</h1>
                {body_html}
                {action_html}
            </div>
            <div class="footer">
                <p>Need help? Contact our support team at <a href="mailto:support@cubenretailer.io">support@cubenretailer.io</a></p>
                <p>&copy; {current_year} Cuben Retailer Platform. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
"""

# ==========================================
# 1. Authentication Email Templates
# ==========================================

def get_welcome_email(full_name: str, email: str, role: str) -> str:
    subject = "Welcome to Cuben Retailer - Account Activated"
    greeting = f"Hello {full_name},"
    body = f"""
    <p>Welcome to Cuben Retailer, the enterprise-grade B2B retailer program. We are thrilled to partner with you in driving customer retention and engagement.</p>
    <p>Your user profile has been successfully provisioned. Here are your account initialization credentials:</p>
    <div class="detail-box">
        <div class="detail-title">Profile Credentials</div>
        <div class="detail-row"><span class="detail-label">Login Username:</span> <span class="detail-value">{email}</span></div>
        <div class="detail-row"><span class="detail-label">Assigned Role:</span> <span class="detail-value">{role}</span></div>
        <div class="detail-row"><span class="detail-label">Status:</span> <span class="detail-value" style="color: #10b981;">Active</span></div>
    </div>
    <p>To configure your brand profile, loyalty rules, and counter integrations, please follow these initial onboarding steps:</p>
    <div class="step-box">
        <div class="step-item"><span class="step-num">1.</span> Access the workspace using the link below and set up your brand settings.</div>
        <div class="step-item"><span class="step-num">2.</span> Add your physical stores and invite managers.</div>
        <div class="step-item"><span class="step-num">3.</span> Create your first loyalty rules and launch rewarding campaign points.</div>
    </div>
    <p>For security, please modify your password upon first login and enable two-factor authentication (2FA) if available.</p>
    """
    return get_base_template(subject, greeting, body, "Welcome", "success", "Launch Workspace", "https://retailer.avopay.pro/login")

def get_email_verification_email(email: str, code: str) -> str:
    subject = "Verify Your Email Address - Security Verification"
    greeting = "Security Verification Request,"
    body = f"""
    <p>Thank you for registering on Cuben Retailer. To complete your security registration, verify your ownership of this email address.</p>
    <p>Please enter the following 6-digit verification code on the registration page:</p>
    <div class="detail-box" style="text-align: center; padding: 32px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; background-color: #f3f4f6; padding: 12px 28px; border-radius: 12px; border: 1px solid #e5e7eb;">
            {code}
        </span>
    </div>
    <p><strong>Notice:</strong> This security code will expire in exactly 24 hours. For security reasons, never share this code with anyone, including Cuben Retailer staff.</p>
    <p>If you did not request this verification, please contact our security team immediately at <a href="mailto:security@cubenretailer.io">security@cubenretailer.io</a>.</p>
    """
    return get_base_template(subject, greeting, body, "Verification Code", "warning")

def get_forgot_password_email(email: str, reset_url: str) -> str:
    subject = "Reset Your Password - Security Recovery"
    greeting = "Hello User,"
    body = """
    <p>We received a request to reset the password associated with your account on the Cuben Retailer platform. If you initiated this request, please click the verification button below to set a new password:</p>
    <p>This password recovery action will expire in 60 minutes. If the button does not load, copy and paste the following link in your browser URL field:</p>
    <p style="font-size: 13px; word-break: break-all; color: #6b7280; font-family: monospace;">{reset_url}</p>
    <p><strong>Did not request this?</strong> If you did not make this request, your password remains secure. We recommend reviewing your security settings to ensure no unauthorized access attempts are being made.</p>
    """
    return get_base_template(subject, greeting, body, "Password Reset Requested", "warning", "Reset Password", reset_url)

def get_password_reset_success_email(email: str) -> str:
    subject = "Password Reset Confirmed - Security Notification"
    greeting = "Security Confirmation Notice,"
    body = f"""
    <p>This is to confirm that the password for your Cuben Retailer account <strong>{email}</strong> has been successfully updated.</p>
    <p>If you made this change, no further action is required. Your account is secure.</p>
    <div class="detail-box" style="border-left: 4px solid #ef4444; background-color: #fff5f5;">
        <p style="font-size: 14px; font-weight: 700; color: #b91c1c; margin-bottom: 8px;">Unauthorized Change Alert</p>
        <p style="font-size: 13px; color: #7f1d1d; margin-bottom: 0;">If you did not authorize this change, your account may be compromised. Please lock your account immediately and contact our urgent response team at <a href="mailto:incident@cubenretailer.io">incident@cubenretailer.io</a>.</p>
    </div>
    """
    return get_base_template(subject, greeting, body, "Security Changed", "success")

def get_change_email_confirmation_email(new_email: str, confirm_url: str) -> str:
    subject = "Confirm Your New Email Address - Security Verification"
    greeting = "Confirm Account Update,"
    body = f"""
    <p>We received a request to update the primary contact email for your Cuben Retailer account to <strong>{new_email}</strong>.</p>
    <p>To authorize this change and verify your new email inbox, please click the confirmation button below:</p>
    <p>Once confirmed, your old email address will no longer be valid for logging in. All transactional invoices, credit notices, and alert logs will be routed to your new address.</p>
    <p>This confirmation request is valid for 2 hours. If you did not request this update, no action is needed.</p>
    """
    return get_base_template(subject, greeting, body, "Email Update Request", "warning", "Confirm New Email", confirm_url)

# ==========================================
# 2. Retailer Email Templates
# ==========================================

def get_retailer_registration_submitted_email(brand_name: str) -> str:
    subject = "Retailer Registration Received - KYC Processing"
    greeting = f"Welcome {brand_name},"
    body = """
    <p>Thank you for submitting your registration details to join the Cuben Retailer B2B network. Your application is under review.</p>
    <p>Our verification coordinators are auditing your business registration documents. We verify the following details to ensure network security and compliance:</p>
    <div class="step-box">
        <div class="step-item"><span class="step-num">✓</span> Business PAN & Goods and Services Tax (GST) registrations.</div>
        <div class="step-item"><span class="step-num">✓</span> Bank account settlements setup validation.</div>
        <div class="step-item"><span class="step-num">✓</span> Authorized signatory identity credentials.</div>
    </div>
    <p>Auditing takes 24-48 business hours. You will receive an automated approval notification once your account transitions to active status.</p>
    """
    return get_base_template(subject, greeting, body, "Under Review", "info")

def get_retailer_approved_email(brand_name: str) -> str:
    subject = "Retailer Workspace Activated - Approved! 🎉"
    greeting = f"Dear {brand_name} Administrators,"
    body = """
    <p>Your B2B retailer profile has been officially approved. Your enterprise workspace is initialized and ready for deployment.</p>
    <p>As an active partner, you can now configure custom engagement options, integrate cashiers, and automate WhatsApp receipts:</p>
    <div class="detail-box">
        <div class="detail-title">Activated Integration Features</div>
        <div class="detail-row"><span class="detail-label">SMS Comms:</span> <span class="detail-value">Enabled</span></div>
        <div class="detail-row"><span class="detail-label">WhatsApp Templates:</span> <span class="detail-value">Enabled</span></div>
        <div class="detail-row"><span class="detail-label">NPS Analytics Feed:</span> <span class="detail-value">Enabled</span></div>
    </div>
    <p>To begin, check out our quick start instructions or go directly to your brand portal.</p>
    """
    return get_base_template(subject, greeting, body, "Verified Partner", "success", "Configure Workspace", "https://retailer.avopay.pro/login")

def get_retailer_rejected_email(brand_name: str, reason: str) -> str:
    subject = "Retailer Registration Status - Rejected"
    greeting = f"Hello {brand_name} Team,"
    body = f"""
    <p>Thank you for your interest in joining the Cuben Retailer network. Our compliance team has finished reviewing your application documents.</p>
    <p>We regret to inform you that your registration could not be approved at this time due to verification details not matching compliance checklists:</p>
    <div class="detail-box" style="border-left: 4px solid #ef4444; background-color: #fff5f5;">
        <div class="detail-title" style="color: #b91c1c;">Rejection Audit Details</div>
        <p style="font-size: 14px; margin-bottom: 0; color: #7f1d1d;">{reason}</p>
    </div>
    <p><strong>Next Steps:</strong> You can submit a new application with the correct documents by logging into your profile. For specific queries, reach out to our verification desk.</p>
    """
    return get_base_template(subject, greeting, body, "Declined", "danger")

def get_retailer_suspended_email(brand_name: str) -> str:
    subject = "Retailer Account Alert - Temporary Suspension"
    greeting = f"Attention: {brand_name} Security Signatory,"
    body = """
    <p>This is an official administrative notice. Your brand workspace under Cuben Retailer has been temporarily suspended.</p>
    <p><strong>Operational Impact:</strong></p>
    <div class="step-box" style="border-left-color: #ef4444;">
        <div class="step-item"><span class="step-num">!</span> Active POS counter terminals cannot issue loyalty points.</div>
        <div class="step-item"><span class="step-num">!</span> WhatsApp campaigns and automated communications are paused.</div>
        <div class="step-item"><span class="step-num">!</span> Partner commission payouts and wallet releases are frozen.</div>
    </div>
    <p>To resolve this restriction, review outstanding alerts in your master portal or contact support.</p>
    """
    return get_base_template(subject, greeting, body, "Suspended", "danger")

def get_retailer_reactivated_email(brand_name: str) -> str:
    subject = "Retailer Workspace Restored - Active status"
    greeting = f"Dear {brand_name},"
    body = """
    <p>Your B2B retailer account suspension has been lifted. The workspace is active and restored to full system permissions.</p>
    <p>All store counters can immediately resume checkouts, points accrual, and cashback redemptions. Campaigns will resume from their queued status.</p>
    """
    return get_base_template(subject, greeting, body, "Active Status", "success", "Launch Dashboard", "https://retailer.avopay.pro/login")

# ==========================================
# 3. Store Email Templates
# ==========================================

def get_store_created_email(store_name: str, store_code: str, email: str) -> str:
    subject = f"New Store Initialized - {store_name}"
    greeting = "Store Initialization Alert,"
    body = f"""
    <p>A new physical retail outlet has been registered and initialized under your brand profile.</p>
    <div class="detail-box">
        <div class="detail-title">Store Specifications</div>
        <div class="detail-row"><span class="detail-label">Store Name:</span> <span class="detail-value">{store_name}</span></div>
        <div class="detail-row"><span class="detail-label">Store Code:</span> <span class="detail-value">{store_code}</span></div>
        <div class="detail-row"><span class="detail-label">Manager Assigned:</span> <span class="detail-value">{email}</span></div>
        <div class="detail-row"><span class="detail-label">Creation Date:</span> <span class="detail-value">{datetime.now().strftime('%d %b %Y')}</span></div>
    </div>
    <p>Please share the login credentials with the store manager so they can set up the POS integration.</p>
    """
    return get_base_template(subject, greeting, body, "Store Created", "success")

def get_store_approved_email(store_name: str) -> str:
    subject = f"Store Integration Active - {store_name}"
    greeting = "Store Status Notification,"
    body = f"""
    <p>The retail outlet <strong>{store_name}</strong> is now active. The store manager can now authorize checkouts and award loyalty rewards.</p>
    """
    return get_base_template(subject, greeting, body, "Activated", "success")

def get_store_suspended_email(store_name: str) -> str:
    subject = f"Store Suspended - {store_name}"
    greeting = "Store Status Notification,"
    body = f"""
    <p>Please note that the store <strong>{store_name}</strong> has been suspended. Store counters cannot register transactions or verify loyalty tiers until reactivation.</p>
    """
    return get_base_template(subject, greeting, body, "Suspended", "danger")

def get_store_reactivated_email(store_name: str) -> str:
    subject = f"Store Restored - {store_name}"
    greeting = "Store Status Notification,"
    body = f"""
    <p>The retail outlet <strong>{store_name}</strong> has been successfully reactivated. Full checkout and marketing integrations are restored.</p>
    """
    return get_base_template(subject, greeting, body, "Reactivated", "success")

# ==========================================
# 4. Orders Email Templates
# ==========================================

def get_new_purchase_order_email(invoice_number: str, net_amount: float, customer_name: str, store_name: str) -> str:
    subject = f"Receipt & Order Confirmation - {invoice_number}"
    greeting = f"Hello {customer_name},"
    body = f"""
    <p>Thank you for shopping at <strong>{store_name}</strong>. Your purchase has been recorded. Here are the details:</p>
    <div class="detail-box">
        <div class="detail-title">Transaction Summary</div>
        <div class="detail-row"><span class="detail-label">Invoice Number:</span> <span class="detail-value">{invoice_number}</span></div>
        <div class="detail-row"><span class="detail-label">Store Location:</span> <span class="detail-value">{store_name}</span></div>
        <div class="detail-row"><span class="detail-label">Amount Paid:</span> <span class="detail-value" style="color: #10b981; font-weight: 700;">₹{net_amount:,.2f}</span></div>
        <div class="detail-row"><span class="detail-label">Payment Status:</span> <span class="detail-value">Completed</span></div>
    </div>
    <p>If you have any questions about this purchase, please contact the store location directly or write to our customer support desk.</p>
    """
    return get_base_template(subject, greeting, body, "Order Logged", "success")

def get_order_accepted_email(invoice_number: str) -> str:
    subject = f"Order Confirmed - {invoice_number}"
    greeting = "Hello Customer,"
    body = f"""
    <p>Your order <strong>{invoice_number}</strong> has been accepted by the fulfillment counter and is being prepared.</p>
    <p>You will receive a notification as soon as the order is ready for dispatch.</p>
    """
    return get_base_template(subject, greeting, body, "Confirmed", "success")

def get_order_rejected_email(invoice_number: str, reason: str) -> str:
    subject = f"Order Cancelled Notification - {invoice_number}"
    greeting = "Hello Customer,"
    body = f"""
    <p>We regret to inform you that your order <strong>{invoice_number}</strong> has been declined by the store.</p>
    <div class="detail-box" style="border-left: 4px solid #ef4444; background-color: #fff5f5;">
        <div class="detail-title" style="color: #b91c1c;">Cancellation Reason</div>
        <p style="font-size: 14px; margin-bottom: 0; color: #7f1d1d;">{reason}</p>
    </div>
    <p>Any payments made will be refunded to your account within 3-5 business days. We apologize for any inconvenience caused.</p>
    """
    return get_base_template(subject, greeting, body, "Cancelled", "danger")

def get_order_cancelled_email(invoice_number: str) -> str:
    subject = f"Cancellation Receipt - {invoice_number}"
    greeting = "Hello Customer,"
    body = f"""
    <p>Your order <strong>{invoice_number}</strong> has been cancelled successfully as requested.</p>
    <p>We have initiated a refund of the transaction amount. The refund will be credited to the original payment method in 3-5 business days.</p>
    """
    return get_base_template(subject, greeting, body, "Cancelled", "danger")

def get_order_dispatched_email(invoice_number: str) -> str:
    subject = f"Order Dispatched 🚚 - {invoice_number}"
    greeting = "Hello Customer,"
    body = f"""
    <p>Your order <strong>{invoice_number}</strong> has been handed over to our delivery partner. It is on its way to you.</p>
    <p>You can track delivery details on the portal. Delivery is expected within the standard timeline.</p>
    """
    return get_base_template(subject, greeting, body, "Dispatched", "info")

def get_order_delivered_email(invoice_number: str) -> str:
    subject = f"Delivery Confirmation 🎉 - {invoice_number}"
    greeting = "Hello Customer,"
    body = f"""
    <p>Your package for order <strong>{invoice_number}</strong> has been successfully delivered.</p>
    <p>We hope you are satisfied with your purchase. Feel free to submit feedback or raise support requests in the portal.</p>
    """
    return get_base_template(subject, greeting, body, "Delivered", "success")

def get_order_returned_email(invoice_number: str, return_amount: float) -> str:
    subject = f"Return Approved - {invoice_number}"
    greeting = "Hello Customer,"
    body = f"""
    <p>We have received and approved the return request for order <strong>{invoice_number}</strong>.</p>
    <div class="detail-box">
        <div class="detail-title">Return Specifications</div>
        <div class="detail-row"><span class="detail-label">Invoice Number:</span> <span class="detail-value">{invoice_number}</span></div>
        <div class="detail-row"><span class="detail-label">Refund Amount:</span> <span class="detail-value">₹{return_amount:,.2f}</span></div>
        <div class="detail-row"><span class="detail-label">Status:</span> <span class="detail-value" style="color: #059669;">Approved</span></div>
    </div>
    <p>The refund is being processed and will show in your account in 3-5 business days.</p>
    """
    return get_base_template(subject, greeting, body, "Return Received", "warning")

# ==========================================
# 5. Payments Email Templates
# ==========================================

def get_payment_successful_email(invoice_number: str, amount: float) -> str:
    subject = f"Payment Successful - Receipt {invoice_number}"
    greeting = "Payment Confirmed,"
    body = f"""
    <p>We have successfully processed your payment for invoice <strong>{invoice_number}</strong>.</p>
    <div class="detail-box">
        <div class="detail-title">Payment Summary</div>
        <div class="detail-row"><span class="detail-label">Invoice Reference:</span> <span class="detail-value">{invoice_number}</span></div>
        <div class="detail-row"><span class="detail-label">Net Amount:</span> <span class="detail-value">₹{amount:,.2f}</span></div>
        <div class="detail-row"><span class="detail-label">Status:</span> <span class="detail-value" style="color: #059669; font-weight: bold;">Paid</span></div>
    </div>
    """
    return get_base_template(subject, greeting, body, "Payment Success", "success")

def get_payment_failed_email(invoice_number: str, amount: float, error_msg: str) -> str:
    subject = "Payment Failed - Action Required"
    greeting = "Payment Alert,"
    body = f"""
    <p>An attempt to process your payment of <strong>₹{amount:,.2f}</strong> for invoice <strong>{invoice_number}</strong> was declined by your bank.</p>
    <div class="detail-box" style="border-left: 4px solid #ef4444; background-color: #fff5f5;">
        <div class="detail-title" style="color: #b91c1c;">Decline Details</div>
        <div class="detail-row"><span class="detail-label" style="color: #7f1d1d;">Invoice ID:</span> <span class="detail-value" style="color: #7f1d1d;">{invoice_number}</span></div>
        <div class="detail-row"><span class="detail-label" style="color: #7f1d1d;">Reason:</span> <span class="detail-value" style="color: #7f1d1d;">{error_msg}</span></div>
    </div>
    <p>Please update your billing method or contact your card issuer to clear the transaction.</p>
    """
    return get_base_template(subject, greeting, body, "Payment Failed", "danger")

def get_invoice_generated_email(invoice_number: str, amount: float) -> str:
    subject = f"Invoice Generated - {invoice_number}"
    greeting = "Invoice Ready,"
    body = f"""
    <p>An invoice has been generated for your transaction <strong>{invoice_number}</strong>.</p>
    <div class="detail-box">
        <div class="detail-title">Invoice Specs</div>
        <div class="detail-row"><span class="detail-label">Invoice Number:</span> <span class="detail-value">{invoice_number}</span></div>
        <div class="detail-row"><span class="detail-label">Total Amount:</span> <span class="detail-value">₹{amount:,.2f}</span></div>
    </div>
    """
    return get_base_template(subject, greeting, body, "Invoice", "info")

def get_refund_processed_email(invoice_number: str, refund_amount: float) -> str:
    subject = f"Refund Settlement Confirmed - {invoice_number}"
    greeting = "Refund Confirmed,"
    body = f"""
    <p>A refund has been processed against invoice <strong>{invoice_number}</strong>. Here is the confirmation:</p>
    <div class="detail-box">
        <div class="detail-title">Refund Settlement</div>
        <div class="detail-row"><span class="detail-label">Invoice Reference:</span> <span class="detail-value">{invoice_number}</span></div>
        <div class="detail-row"><span class="detail-label">Settled Amount:</span> <span class="detail-value">₹{refund_amount:,.2f}</span></div>
        <div class="detail-row"><span class="detail-label">Processing Channel:</span> <span class="detail-value">Original Mode</span></div>
    </div>
    """
    return get_base_template(subject, greeting, body, "Refund Processed", "success")

# ==========================================
# 6. KYC Email Templates
# ==========================================

def get_kyc_submitted_email(brand_name: str) -> str:
    subject = "KYC Details Received - Cuben Retailer Compliance"
    greeting = f"Hello {brand_name},"
    body = """
    <p>We have successfully received your KYC compliance uploads. Your documents are in verification pipeline.</p>
    <p>Verification is expected to finish in 1-2 business days. We will notify you immediately once completed.</p>
    """
    return get_base_template(subject, greeting, body, "KYC Submitted", "info")

def get_kyc_approved_email(brand_name: str) -> str:
    subject = "KYC Verification Successful ✅"
    greeting = f"Dear {brand_name},"
    body = """
    <p>We are pleased to inform you that your KYC verification is complete. Your identity records are verified.</p>
    <p>Your B2B account permissions are updated. You can now configure settlements and payout routing rules in the billing dashboard.</p>
    """
    return get_base_template(subject, greeting, body, "KYC Approved", "success")

def get_kyc_rejected_email(brand_name: str, reason: str) -> str:
    subject = "KYC Audit Discrepancy Alert"
    greeting = f"Dear {brand_name},"
    body = f"""
    <p>Your KYC upload was declined due to verification mismatch audits:</p>
    <div class="detail-box" style="border-left: 4px solid #ef4444; background-color: #fff5f5;">
        <div class="detail-title" style="color: #b91c1c;">Compliance Audit Notes</div>
        <p style="font-size: 14px; margin-bottom: 0; color: #7f1d1d;">{reason}</p>
    </div>
    <p>Please resolve this by updating your verification uploads in the profile dashboard.</p>
    """
    return get_base_template(subject, greeting, body, "KYC Rejected", "danger")

# ==========================================
# 7. Commission Email Templates
# ==========================================

def get_commission_credited_email(amount: float, period: str) -> str:
    subject = f"Commission Settlement Credited - {period}"
    greeting = "Partner Settlement Alert,"
    body = f"""
    <p>Your commission payout has been successfully settled and credited to your wallet balance.</p>
    <div class="detail-box">
        <div class="detail-title">Settlement Summary</div>
        <div class="detail-row"><span class="detail-label">Period:</span> <span class="detail-value">{period}</span></div>
        <div class="detail-row"><span class="detail-label">Settled Payout:</span> <span class="detail-value" style="color: #059669; font-weight: bold;">₹{amount:,.2f}</span></div>
    </div>
    """
    return get_base_template(subject, greeting, body, "Credited", "success")

def get_payout_processed_email(amount: float, bank_details: str) -> str:
    subject = "Bank Payout Dispatched - Cuben Retailer Settlements"
    greeting = "Settlement Dispatched Notice,"
    body = f"""
    <p>Your wallet payout has been processed and routed to your bank destination.</p>
    <div class="detail-box">
        <div class="detail-title">Transfer Specs</div>
        <div class="detail-row"><span class="detail-label">Amount:</span> <span class="detail-value">₹{amount:,.2f}</span></div>
        <div class="detail-row"><span class="detail-label">Bank Details:</span> <span class="detail-value">{bank_details}</span></div>
    </div>
    <p>Funds will clear in your bank account in 24-48 business hours.</p>
    """
    return get_base_template(subject, greeting, body, "Payout Processed", "success")

# ==========================================
# 8. Support Email Templates
# ==========================================

def get_ticket_created_email(ticket_id: str, subject_text: str, category: str) -> str:
    subject = f"Support Request Ticket - #{ticket_id}"
    greeting = "Support Ticket Acknowledgment,"
    body = f"""
    <p>A new support ticket has been logged regarding your request.</p>
    <div class="detail-box">
        <div class="detail-title">Ticket details</div>
        <div class="detail-row"><span class="detail-label">Ticket ID:</span> <span class="detail-value">#{ticket_id}</span></div>
        <div class="detail-row"><span class="detail-label">Category:</span> <span class="detail-value">{category}</span></div>
        <div class="detail-row"><span class="detail-label">Issue Details:</span> <span class="detail-value">{subject_text}</span></div>
    </div>
    <p>Our response center will address this request. Standard response SLA is under 12 hours.</p>
    """
    return get_base_template(subject, greeting, body, "Ticket Open", "info")

def get_ticket_resolved_email(ticket_id: str, solution: str) -> str:
    subject = f"Support Case Resolved - #{ticket_id}"
    greeting = "Support Case Resolved Notice,"
    body = f"""
    <p>Your support ticket <strong>#{ticket_id}</strong> is marked as resolved by our customer desk.</p>
    <div class="detail-box">
        <div class="detail-title">Resolution notes</div>
        <div class="detail-row"><span class="detail-label">Ticket ID:</span> <span class="detail-value">#{ticket_id}</span></div>
        <div class="detail-row"><span class="detail-label">Outcome:</span> <span class="detail-value">{solution}</span></div>
    </div>
    <p>If your issue persists, respond to this thread to automatically reopen the ticket.</p>
    """
    return get_base_template(subject, greeting, body, "Resolved", "success")

# ==========================================
# 9. Security Email Templates
# ==========================================

def get_login_new_device_email(device_info: str, ip_address: str, time: str) -> str:
    subject = "Security Alert - Access from New Device"
    greeting = "Security Notice,"
    body = f"""
    <p>We detected an access event on your account from a new browser session or device.</p>
    <div class="detail-box" style="border-left: 4px solid #f59e0b; background-color: #fffbeb;">
        <div class="detail-title" style="color: #d97706;">Session Details</div>
        <div class="detail-row"><span class="detail-label">Device Type:</span> <span class="detail-value">{device_info}</span></div>
        <div class="detail-row"><span class="detail-label">IP Address:</span> <span class="detail-value">{ip_address}</span></div>
        <div class="detail-row"><span class="detail-label">Time (UTC):</span> <span class="detail-value">{time}</span></div>
    </div>
    <p>If this was you, no action is needed. If you do not recognize this login, please secure your account immediately by changing your password.</p>
    """
    return get_base_template(subject, greeting, body, "Security Event", "warning", "Secure Profile", "https://retailer.avopay.pro/settings")

def get_account_blocked_email(reason: str) -> str:
    subject = "Security Notice - Account Suspended"
    greeting = "Urgent Account Alert,"
    body = f"""
    <p>Your account access has been blocked due to security reasons or compliance flags.</p>
    <div class="detail-box" style="border-left: 4px solid #ef4444; background-color: #fff5f5;">
        <div class="detail-title" style="color: #b91c1c;">Administrative Action Details</div>
        <p style="font-size: 14px; margin-bottom: 0; color: #7f1d1d;">{reason}</p>
    </div>
    <p>Please contact our helpdesk to complete identity verification and restore account access.</p>
    """
    return get_base_template(subject, greeting, body, "Account Locked", "danger")

def get_account_unblocked_email() -> str:
    subject = "Security Alert - Account Restored"
    greeting = "Hello User,"
    body = """
    <p>Your account access has been successfully restored. You can now log back in using your credentials.</p>
    """
    return get_base_template(subject, greeting, body, "Unblocked", "success", "Log In", "https://retailer.avopay.pro/login")
