from fastapi import FastAPI, Request, HTTPException, Depends
from pydantic import BaseModel
from jose import jwt, JWTError
from supabase import create_client, Client
import os

# Environment variables (use dotenv or actual env vars in prod)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
app = FastAPI()

# Request body schema
class CheckboxUpdatePayload(BaseModel):
    form_id: str
    checkbox_id: str
    new_value: bool

# Authentication
async def get_current_user(request: Request):
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return payload  # user data
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Endpoint
@app.post("/update-main-checkbox")
async def update_checkbox(payload: CheckboxUpdatePayload, user=Depends(get_current_user)):
    user_id = user["sub"]
    form_id = payload.form_id
    checkbox_id = payload.checkbox_id
    new_value = payload.new_value

    # Fetch the main_checkbox
    res = supabase.table("main_checkbox").select("id, checkbox_group_id, form_id").eq("id", checkbox_id).single().execute()
    if res.error or not res.data:
        raise HTTPException(status_code=404, detail="Checkbox not found")
    checkbox = res.data
    if checkbox["form_id"] != form_id:
        raise HTTPException(status_code=403, detail="Form mismatch")

    group_id = checkbox["checkbox_group_id"]

    # Fetch all checkboxes in the same group
    group_res = supabase.table("main_checkbox").select("id").eq("checkbox_group_id", group_id).execute()
    if group_res.error:
        raise HTTPException(status_code=500, detail="Failed to load group")

    checkboxes = group_res.data

    # Apply "only one selected" rule
    for cb in checkboxes:
        checked = cb["id"] == checkbox_id and new_value
        update_res = supabase.table("main_checkbox").update({
            "value": checked,
            "updated_by": user_id
        }).eq("id", cb["id"]).execute()
        if update_res.error:
            raise HTTPException(status_code=500, detail=f"Update failed for checkbox {cb['id']}")

    return {"status": "success", "updated_checkbox": checkbox_id}
