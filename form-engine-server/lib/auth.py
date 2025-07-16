from fastapi import Request, HTTPException
from pydantic import BaseModel
from jose import jwt, JWTError
from supabase import create_client, Client
import os


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
class Session(BaseModel):
    user_id: str
    token: str

async def get_current_user(request: Request) -> Session:
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = auth.split(" ")[1]
    
    try:
        # Decode and verify the JWT token
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        return Session(user_id=payload["sub"], token=token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_authenticated_client(user_token: str) -> Client:
    """Create a Supabase client with the user's JWT token for RLS"""
    try:
        # Create client with the anonymous key
        client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Set authentication using multiple met{ db: { schema: 'myschema' }hods for maximum compatibility
        client.auth.set_session(access_token=user_token, refresh_token="")
        client.postgrest.auth(user_token)
        client.postgrest.session.headers.update({
            "Authorization": f"Bearer {user_token}"
        })
        
        return client
    except Exception as e:
        print(f"Error creating/authenticating client: {e}", flush=True)
        raise