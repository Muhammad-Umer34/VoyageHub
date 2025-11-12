import os
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
FORGET_PASSWORD_EXPIRE_MINUTES = int(os.getenv("FORGET_PASSWORD_TOKEN_EXPIRE_MINUTES", "5"))

def create_forget_password_token(data: dict, expires_minutes: int = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=(expires_minutes or FORGET_PASSWORD_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "forget_password"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_forget_password_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "forget_password":
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
