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


async def send_forget_password_email(recipient_email: str, reset_link: str):
    """
    Sends a password reset link to the user's email.
    """

    subject = "Reset your Itinerary Planner password"
    body = f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <a href="{reset_link}" 
               style="display:inline-block; background-color:#2e86de; color:white; padding:10px 20px;
                      text-decoration:none; border-radius:5px;">Reset Password</a>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <br>
            <p>This link will expire in a 5 minutes for your security.</p>
            <br>
            <p>Thank you,<br><b>Itinerary Planner Team</b></p>
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
        print(f"✅ Password reset email sent to {recipient_email}")
    except Exception as e:
        print(f"❌ Failed to send password reset email to {recipient_email}: {e}")
