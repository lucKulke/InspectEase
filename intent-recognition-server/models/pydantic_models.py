from typing import List, Dict, Optional
from pydantic import BaseModel, RootModel

class SubSectionLog(BaseModel):
    label: str
    checkboxes: List[str]
    text_input_fields: List[str] 


class IntentLog(BaseModel):
    sentence: str
    sub_section: SubSectionLog
    

class Logs(BaseModel):
    intents: List[IntentLog]
    error: str | None

class Example(BaseModel):
    user: str
    ai: str


class TrainingsDataItem(BaseModel):
    id: str
    prompt: str
    examples: List[Example]


class TextInput(BaseModel):
    id: str
    label: str
    trainingsId: str


class Checkbox(BaseModel):
    id: str
    label: str
    checked: bool


class Task(BaseModel):
    id: str
    description: str
    checkboxes: List[Checkbox]


class CheckboxGroupWithTasks(BaseModel):
    id: str
    label: str
    tasks: List[Task]


class CheckboxGroupWithoutTasks(BaseModel):
    id: str
    label: str
    checkboxes: List[Checkbox]


class SubSection(BaseModel):
    id: str
    label: str
    textInput: List[TextInput]
    checkboxGroupsWithTasks: List[CheckboxGroupWithTasks]
    checkboxGroupsWithoutTasks: List[CheckboxGroupWithoutTasks]


class MainSection(BaseModel):
    id: str
    label: str
    subSections: List[SubSection]


class RootData(BaseModel):
    trainingsData: List[TrainingsDataItem]
    formData: List[MainSection]


class Gpt(BaseModel):
    model: str
    token: str
    temp: int


class UserInput(BaseModel):
    userSentence: str
    llm: Gpt
    form: RootData
