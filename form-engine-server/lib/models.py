from pydantic import BaseModel
from datetime import datetime
from typing import List
from uuid import UUID
class CheckboxUpdatePayload(BaseModel):
    form_id: str
    checkbox_id: str
    new_value: bool

# SubCheckbox Model
class SubCheckbox(BaseModel):
    id: UUID
    checked: bool
    form_id: UUID
    task_id: UUID
    team_id: UUID
    user_id: UUID
    created_at: datetime
    main_checkbox_id: UUID
    updated_by: str

class MainCheckbox(BaseModel):
    id: UUID
    label: str
    checked: bool
    form_id: UUID
    team_id: UUID
    user_id: UUID
    group_id: UUID
    created_at: datetime
    prio_number: int
    order_number: int
    sub_checkbox: List[SubCheckbox]
    annotation_id: UUID
    updated_by: str

class Task(BaseModel):
    id: UUID
    team_id: UUID
    user_id: UUID
    group_id: UUID
    created_at: datetime
    description: str
    order_number: int

class CheckboxGroup(BaseModel):
    task: List[Task]
    main_checkbox: List[MainCheckbox]
    checkboxes_selected_together: List[UUID]

class Group(BaseModel):
    checkbox_group: CheckboxGroup

class DBGroupModel(BaseModel):
    group: Group
