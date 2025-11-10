import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_FROM = os.getenv("EMAIL_FROM", "your_email@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
SMTP_SERVER = os.getenv("EMAIL_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("EMAIL_PORT", 587))


async def send_verification_email(recipient_email: str, verification_code: str):
    """
    Sends an email containing the 6-digit verification code to the user.
    """

    subject = "Verify your Itinerary Planner account"
    body = f"""
    <html>
        <body>
            <h2>Email Verification</h2>
            <p>Use the following 6-digit code to verify your account:</p>
            <h1 style="color: #2e86de;">{verification_code}</h1>
            <p>This code will expire in 10 minutes.</p>
            <br>
            <p>Thank you for using <b>Itinerary Planner</b>!</p>
        </body>
    </html>
    """
    msg = MIMEMultipart()
    msg["From"] = EMAIL_FROM
    msg["To"] = recipient_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            start_tls=True,
            username=EMAIL_FROM,
            password=EMAIL_PASSWORD,
        )
        print(f"✅ Verification email sent to {recipient_email}")
    except Exception as e:
        print(f"❌ Failed to send email to {recipient_email}: {e}")
