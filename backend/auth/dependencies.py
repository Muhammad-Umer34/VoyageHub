from fastapi import Depends, HTTPException, status, Cookie, Response
from sqlalchemy.orm import Session
from database import get_db
from crud import get_user_by_email
from auth.jwt_handler import verify_token, create_access_token

def get_current_user(
    response: Response,
    access_token: str = Cookie(None),
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db)
):

    user_email = None
    token_refreshed = False

    if access_token:
        try:
            payload = verify_token(access_token)
            if payload and "sub" in payload:
                user_email = payload.get("sub")
        except Exception as e:
            print(f"Access token verification failed: {e}")
            pass

    if not user_email and refresh_token:
        try:
            refresh_payload = verify_token(refresh_token)
            if refresh_payload and "sub" in refresh_payload:
                user_email = refresh_payload.get("sub")
                
                new_access_token = create_access_token({"sub": user_email})
                response.set_cookie(
                    key="access_token",
                    value=new_access_token,
                    httponly=True,
                    max_age=60*60*24, 
                    samesite="lax",
                    secure=False,  
                    path="/"
                )
                token_refreshed = True
                print(f"Access token refreshed for user: {user_email}")
        except Exception as e:
            print(f"Refresh token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication expired. Please login again."
            )

    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please login."
        )

    user = get_user_by_email(db, email=user_email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )

    return user