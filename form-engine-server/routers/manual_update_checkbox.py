
from fastapi import  HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
from lib.auth import get_authenticated_client, get_current_user, Session
from lib.models import CheckboxUpdatePayload, DBGroupModel, SubCheckbox, List, MainCheckbox



from fastapi import APIRouter

router = APIRouter(
    prefix="/manual-update-checkbox",
    tags=["Users"]
)


def find_sub_checkbox(main_checkboxes: List[MainCheckbox], sub_id: str) -> Optional[SubCheckbox]:
    for main_cb in main_checkboxes:
        for sub_cb in main_cb["sub_checkbox"]:
            if str(sub_cb["id"]) == sub_id:  # Compare as string or UUID
                return sub_cb
    return None

def find_all_sub_by_task(main_checkboxes: list[MainCheckbox], task_id) -> list[SubCheckbox]:
    return [
        sub
        for main in main_checkboxes
        for sub in main["sub_checkbox"]
        if sub["task_id"] == task_id
    ]
    
def validate_sub_checkbox_selection(selected_id: str,new_value: bool, db_item: DBGroupModel, user_id: str) -> List[SubCheckbox]:
    # Extract data
    result: List[SubCheckbox] = []
    
    all_main: List[MainCheckbox] = db_item["group"]["checkbox_group"]["main_checkbox"]
    
    selected_sub_checkbox = find_sub_checkbox(all_main, selected_id)
    
    if selected_sub_checkbox is None:
        raise HTTPException(status_code=404, detail="Sub checkbox not found")
        
        
    all_sub: List[SubCheckbox] = find_all_sub_by_task(all_main, selected_sub_checkbox["task_id"])
    
    all_checked_sub_checkboxes = [checkbox for checkbox in all_sub if checkbox["checked"]]
    
    all_checked_sub_checkbox_main_checkbox_ids = [str(checkbox["main_checkbox_id"]) for checkbox in all_checked_sub_checkboxes] + [[checkbox for checkbox in all_sub if checkbox["id"] == selected_id][0]["main_checkbox_id"]]
    
    checkboxes_selectable_together = db_item["group"]["checkbox_group"]["checkboxes_selected_together"]
    all_selected_sub_checkbox_are_selectable_together_with_selected_id = all(item in checkboxes_selectable_together for item in all_checked_sub_checkbox_main_checkbox_ids)
   
    
    if not len(all_checked_sub_checkboxes) > 0 or new_value == False or all_selected_sub_checkbox_are_selectable_together_with_selected_id:
        updateable_checkbox = next((x for x in all_sub if x["id"] == selected_id), None)
        updateable_checkbox["checked"] = new_value
        result.append(updateable_checkbox)
        return result
    
    
    for checkbox in all_sub:
        if checkbox["id"] == selected_id:
            checkbox["checked"] = True
        else:
            checkbox["checked"] = False
        checkbox["updated_by"] = user_id
        result.append(checkbox)
            
    return result



def select_main_checkbox_for_section(
    main_checkboxes: List[dict],
    task_ids: List[str],
    selectable_together: List[str],
    user_id: str
) -> Optional[List[dict]]:
    """
    Determine which main checkboxes to select:
    - All tasks must have at least one checked sub-checkbox
    - Priority decides the main checkbox to select (lower prio_number wins)
    - Others unselect unless allowed in selectable_together
    """
    for main_cb in main_checkboxes:
        main_cb["checked"] = False
    # Check if all tasks are covered
    task_coverage = {tid: False for tid in task_ids}
    for main_cb in main_checkboxes:
        for sub_cb in main_cb["sub_checkbox"]:
            if sub_cb["checked"] and str(sub_cb["task_id"]) in task_coverage:
                task_coverage[str(sub_cb["task_id"])] = True

    if not all(task_coverage.values()):
        for checkbox in main_checkboxes:
            checkbox.pop("sub_checkbox", None)
        return main_checkboxes

    # Find all main checkboxes that have at least one checked sub-checkbox
    candidates = [cb for cb in main_checkboxes if any(sub["checked"] for sub in cb["sub_checkbox"])]

    if not candidates:
        return None

    # Sort candidates by prio_number (ascending)
    candidates.sort(key=lambda cb: cb["prio_number"])
    top_priority = candidates[0]["prio_number"]

    # Select top-priority checkbox(es)
    selected = [cb for cb in candidates if cb["prio_number"] == top_priority]
    for checkbox in selected:
        checkbox["checked"] = True
    # If checkboxes can be selected together, include them
    # For example: if top priority = "not ok", and "fixed" is allowed together, include it if present
    for cb in candidates:
        if cb not in selected and any(sel["id"] in selectable_together for sel in selected):
            if cb["id"] in selectable_together:
                cb["checked"] = True
                selected.append(cb)
    
    # Remove sub_checkbox key
    for checkbox in main_checkboxes:
        checkbox["updated_by"] = user_id
        checkbox.pop("sub_checkbox", None)

    return main_checkboxes


  
def auto_select_main_checkbox_selection(db_item: DBGroupModel, user_id: str) -> List[MainCheckbox]:
    all_main: List[MainCheckbox] = db_item["group"]["checkbox_group"]["main_checkbox"]
    task_ids = [str(task["id"]) for task in db_item["group"]["checkbox_group"]["task"]]
    result = select_main_checkbox_for_section(all_main, task_ids, db_item["group"]["checkbox_group"]["checkboxes_selected_together"], user_id)
    return result


    
    
@router.post("/sub-checkbox")
async def update_sub_checkbox(payload: CheckboxUpdatePayload, user: Session = Depends(get_current_user)):
    user_id = user.user_id
    form_id = payload.form_id
    checkbox_id = payload.checkbox_id
    new_value = payload.new_value
    
    try:
        # Create client with user's JWT token for RLS authentication
        client = get_authenticated_client(user.token)
        
        # fetch sub checkbox with authenticated client
        db_fetch_sub_checkbox_data_response = (
            client.schema("form_filler").table("sub_checkbox")
            .select("group:main_checkbox(checkbox_group(task(*),checkboxes_selected_together, main_checkbox(*, sub_checkbox(*))))")
            .eq("id", checkbox_id).eq("form_id", form_id).single()
            .execute()
        )
        print(db_fetch_sub_checkbox_data_response.data, flush=True  )
              
        data: DBGroupModel = db_fetch_sub_checkbox_data_response.data
        # sub_checkbox_data: SubCheckboxDataResponseItem = db_fetch_sub_checkbox_data_response.data
        updateable_sub_checkboxes = validate_sub_checkbox_selection(checkbox_id,new_value, data, user_id)
        # ✅ Apply updates to db_item before selecting main checkbox
        for updated in updateable_sub_checkboxes:
            for main_cb in data["group"]["checkbox_group"]["main_checkbox"]:
                for sub_cb in main_cb["sub_checkbox"]:
                    if sub_cb["id"] == updated["id"]:
                        sub_cb["checked"] = updated["checked"]
        
        db_update_sub_checkbox_response = client.schema("form_filler").table("sub_checkbox").upsert(updateable_sub_checkboxes).execute()

        updateable_main_checkboxes = auto_select_main_checkbox_selection(data, user_id)
        
        if updateable_main_checkboxes:
            db_update_main_checkbox_response = client.schema("form_filler").table("main_checkbox").upsert(updateable_main_checkboxes).execute()
        
            
    except Exception as e:
        print(f"Database error: {e}", flush=True)
        raise HTTPException(status_code=500, detail=f"Database operation failed: {str(e)}")

    return {"status": "success", "updated_main_checkboxes": db_update_main_checkbox_response.data, "updated_sub_checkboxes": db_update_sub_checkbox_response.data}






@router.post("/main-checkbox")
async def update_main_checkbox(payload: CheckboxUpdatePayload, user: Session = Depends(get_current_user)):
    user_id = user.user_id
    form_id = payload.form_id
    checkbox_id = payload.checkbox_id
    new_value = payload.new_value
    
    try:
        # Create client with user's JWT token for RLS authentication
        client = get_authenticated_client(user.token)
        db_fetch_main_checkbox_data_response = (
            client.schema("form_filler").table("main_checkbox")
            .select("group:checkbox_group(checkboxes_selected_together, main_checkbox(*))")
            .eq("id", checkbox_id).eq("form_id", form_id).single()
            .execute()
        )
        
        print(db_fetch_main_checkbox_data_response.data, flush=True)
        main_checkboxes = db_fetch_main_checkbox_data_response.data["group"]["main_checkbox"]

        # Fetch the clicked checkbox details
        selected_checkbox = next((cb for cb in main_checkboxes if cb["id"] == checkbox_id), None)
        if not selected_checkbox:
            raise HTTPException(status_code=404, detail="Checkbox not found")
        
        allowed_together = set(selected_checkbox.get("checkbox_group", {}).get("checkboxes_selected_together", []))
        
        for main_checkbox in main_checkboxes:
            if main_checkbox["id"] == checkbox_id:
                main_checkbox["checked"] = new_value
            else:
                # Only uncheck if NOT in allowed_together
                if main_checkbox["id"] not in allowed_together:
                    main_checkbox["checked"] = False
            main_checkbox["updated_by"] = user_id
        
            
        db_update_main_checkbox_response = client.schema("form_filler").table("main_checkbox").upsert(main_checkboxes).execute()
        
            
    except Exception as e:
        print(f"Database error: {e}", flush=True)
        raise HTTPException(status_code=500, detail=f"Database operation failed: {str(e)}")

    return {"status": "success", "updated_main_checkboxes": db_update_main_checkbox_response.data}
