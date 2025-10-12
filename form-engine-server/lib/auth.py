from fastapi import Request, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

class Session(BaseModel):
    user_id: str
    token: str

async def get_current_user(request: Request) -> Session:
    
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = auth.split(" ")[1]

    # Build a client and ask Supabase to resolve the user from the token
    supa = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    supa.auth.set_session(access_token=token, refresh_token="")
    # v2 client supports this:
    user_resp = supa.auth.get_user(token)  # raises on invalid/expired
    user = user_resp.user
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return Session(user_id=user.id, token=token)

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