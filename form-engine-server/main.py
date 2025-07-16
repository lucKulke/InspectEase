import dotenv
dotenv.load_dotenv()

from fastapi import FastAPI, Request, HTTPException, Depends
from pydantic import BaseModel
import os
from lib.auth import get_authenticated_client, get_current_user, Session
from lib.models import CheckboxUpdatePayload, ResponseItem, SubCheckbox, List, MainCheckbox


app = FastAPI()



def validate_sub_checkbox_selection(selected_id: str,new_value: bool, db_item: ResponseItem) -> List[SubCheckbox]:
    # Extract data
    result: List[SubCheckbox] = []
    
    all_main = db_item["main_checkbox"]["checkbox_group"]["main_checkbox"]
    print()
    print(all_main, flush=True)
    
    main_selectable_together = set(db_item["main_checkbox"]["checkbox_group"]["checkboxes_selected_together"])
    print()
    print(main_selectable_together, flush=True)

    all_sub: List[SubCheckbox] = db_item["group"]["sub_checkbox"]
    print()
    print(all_sub, flush=True)

    has_allready_checked_subcheckbox = any(sub_checkbox.get("checked") for sub_checkbox in all_sub)
    
    if not has_allready_checked_subcheckbox or new_value == False: 
        updateable_checkbox = next((x for x in all_sub if x["id"] == selected_id), None)
        updateable_checkbox["checked"] = new_value
        result.append(updateable_checkbox)
        return result
    



    

    return

    # Find the selected main checkbox
    selected_main = next((m for m in all_main if m.id == selected_id), None)
    if not selected_main:
        raise ValueError("Selected checkbox not found in main group.")
    
    updates = []

    # If user is checking this checkbox
    if not selected_main.checked:
        for m in all_main:
            if m.id == selected_main.id:
                m.checked = True
                updates.append({"id": m.id, "checked": True})
            else:
                if m.id not in together and m.prio_number > selected_main.prio_number:
                    m.checked = False
                    updates.append({"id": m.id, "checked": False})
    else:
        # If user unchecks the selected checkbox
        selected_main.checked = False
        updates.append({"id": selected_main.id, "checked": False})

    return updates
@app.post("/update-sub-checkbox")
async def update_checkbox(payload: CheckboxUpdatePayload, user: Session = Depends(get_current_user)):
    user_id = user.user_id
    form_id = payload.form_id
    checkbox_id = payload.checkbox_id
    new_value = payload.new_value
    
    try:
        # Create client with user's JWT token for RLS authentication
        client = get_authenticated_client(user.token)
        
        # Insert with authenticated client
        db_fetch_response = (
            client.schema("form_filler").table("sub_checkbox")
            .select("group:task(sub_checkbox(*)),main_checkbox(checkbox_group(checkboxes_selected_together, main_checkbox(*)))")
            .eq("id", checkbox_id).eq("form_id", form_id).single()
            .execute()
        )
              
        group: ResponseItem = db_fetch_response.data
        # print(group, flush=True)
        update = validate_sub_checkbox_selection(checkbox_id,new_value, group)
        # print(update, flush=True)
        print()
        print(update, flush=True)
        print()
        db_update_response = client.schema("form_filler").table("sub_checkbox").upsert(update).execute()
        print(db_update_response, flush=True)

        if group:
            return {"status": "success", "updated_checkbox": checkbox_id, "data": group}
        else:
            raise HTTPException(status_code=400, detail="Failed to insert data")
            
    except Exception as e:
        print(f"Database error: {e}", flush=True)
        raise HTTPException(status_code=500, detail=f"Database operation failed: {str(e)}")

    return {"status": "success", "updated_checkbox": checkbox_id}


