from typing import List, Dict, Optional
from pydantic import BaseModel, RootModel




class Checkbox(BaseModel):
    label: str
    id: int

class Task(BaseModel):
    description: str
    id: int

class SelectionGroup(BaseModel):
    checkboxes: List[Checkbox]
    tasks: List[Task]

class TextInputField(BaseModel):
    label: str
    trainingsId: int

class SubSection(BaseModel):
    selectionGroups: List[SelectionGroup]
    textInputFields: Optional[List[TextInputField]] = None

# SectionGroup is a dict: subsection name -> SubSection
SectionGroup = Dict[str, SubSection]

# The full form structure is a dict: main section name -> list of SectionGroups
class FormStructure(RootModel):
    root: Dict[str, List[SectionGroup]]



class Gpt(BaseModel):
    model: str
    token: str
    temp: int

class Anthropic(BaseModel):
    model: str
    token: str

class UserInput(BaseModel):
    user_sentence: str
    llm: Gpt | Anthropic
    form: FormStructure