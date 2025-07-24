from fastapi import APIRouter, HTTPException, Depends
from lib.auth import get_authenticated_client, get_current_user, Session
from lib.models import VoiceCommand

router = APIRouter(
    prefix="/ai-update-form",
    tags=["AI Update Form"]
)


@router.post("/voice-command")
async def update_sub_checkbox(payload: VoiceCommand, user: Session = Depends(get_current_user)):
    user_id = user.user_id
    form_id = payload.form_id
    pass