from pydantic import BaseModel
from datetime import datetime
from typing import List
class CheckboxUpdatePayload(BaseModel):
    form_id: str
    checkbox_id: str
    new_value: bool




# SubCheckbox Model
class SubCheckbox(BaseModel):
    id: str
    checked: bool
    form_id: str
    task_id: str
    team_id: str
    user_id: str
    created_at: datetime
    main_checkbox_id: str


class MainCheckbox(BaseModel):
    id: str
    checked: bool
    form_id: str
    prio_number: int
    user_id: str
    created_at: datetime
    team_id: str
    group_id: str
    order_number: int
    label: str
    annotation_id: str


class CheckboxGroup(BaseModel):
    main_checkbox: List[MainCheckbox]
    checkboxes_selected_together: List[str]


class MainCheckboxWrapper(BaseModel):
    checkbox_group: CheckboxGroup


class Group(BaseModel):
    sub_checkbox: List[SubCheckbox]


class ResponseItem(BaseModel):
    group: Group
    main_checkbox: MainCheckboxWrapper
