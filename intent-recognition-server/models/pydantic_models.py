from typing import List, Dict, Optional
from pydantic import BaseModel, RootModel





class Example(BaseModel):
    user: str
    ai: str


class TrainingsDataItem(BaseModel):
    id: int
    prompt: str
    examples: List[Example]


class TextInput(BaseModel):
    id: int
    label: str
    trainingsId: int


class Checkbox(BaseModel):
    id: int
    label: str
    checked: bool


class Task(BaseModel):
    id: int
    description: str
    checkboxes: List[Checkbox]


class CheckboxGroupWithTasks(BaseModel):
    id: int
    label: str
    tasks: List[Task]


class CheckboxGroupWithoutTasks(BaseModel):
    id: int
    label: str
    checkboxes: List[Checkbox]


class SubSection(BaseModel):
    id: int
    label: str
    textInput: List[TextInput]
    checkboxGroupsWithTasks: List[CheckboxGroupWithTasks]
    checkboxGroupsWithoutTasks: List[CheckboxGroupWithoutTasks]


class MainSection(BaseModel):
    id: int
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
