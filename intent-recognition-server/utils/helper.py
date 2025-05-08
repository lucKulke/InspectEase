from langchain_openai import ChatOpenAI
from models.pydantic_models import UserInput, Gpt, RootData, SubSection, TrainingsDataItem, Logs
from langchain_core.language_models.base import BaseLanguageModel
from langchain_core.prompts import ChatPromptTemplate
from typing import List

def getModelWrapper(user_input: UserInput) -> BaseLanguageModel:
    return ChatOpenAI(
        model_name=user_input.llm.model,
        openai_api_key=user_input.llm.token,
        temperature=user_input.llm.temp,
    )


def getSubSections(form: RootData):
    subSections = {}
    for main_section in form.formData:
        for sub_section in main_section.subSections:

            subSections[sub_section.id] = sub_section.label
    return subSections


def getSubSectionData(sub_section_id: str, form: RootData) -> SubSection | None:
    for main_section in form.formData:
        for sub_section in main_section.subSections:
            if sub_section.id == sub_section_id:
                return sub_section
    return None


def getTextInputFieldsReady(sub_section: SubSection):
    text_input_fields = {}
    for textInput in sub_section.textInput:
        text_input_fields[textInput.id] = textInput.label

    return text_input_fields

def getFieldGroups(sub_section: SubSection):
    fieldGroups = {}
    for group in sub_section.checkboxGroupsWithTasks:
        for task in group.tasks:
            fieldGroups[task.id] = task.description
            
              
    for group in sub_section.checkboxGroupsWithoutTasks:
        fieldGroups[group.id]=group.label
    
    for text_input in sub_section.textInput:
        fieldGroups[text_input.id] = text_input.label
            
    return fieldGroups

def getCheckboxesReady(sub_section: SubSection):
    checkboxes = {}
    for group in sub_section.checkboxGroupsWithTasks:
        for task in group.tasks:
            checkboxes[task.description] = []
            for checkbox in task.checkboxes:
                checkboxes[task.description].append(
                    {
                        "id": checkbox.id,
                        "label": checkbox.label,
                        "checked": "True" if checkbox.checked else "False",
                    }
                )
    for group in sub_section.checkboxGroupsWithoutTasks:
        checkboxes[group.label]=[]
        for checkbox in group.checkboxes:
            checkboxes[group.label].append({
                        "id": checkbox.id,
                        "label": checkbox.label,
                        "checked": "True" if checkbox.checked else "False",
                    })
            
    return checkboxes

def stringExtractionTemplate(training: TrainingsDataItem, user_sentence: str):
    string_extraction_prompt = f"You are an intelligent extraction assistant.\n\nYour task is to extract the most relevant string or phrase from the user's sentence.\nReturn only the extracted string, without additional text or formatting.\n\ntask: {training.prompt}"

    messages = [("system", string_extraction_prompt)]

    for example in training.examples:
        messages.append(("human", example.user))
        messages.append(("ai", example.ai))
    
    messages.append(("human", user_sentence))
    
    

    string_extraction_template = ChatPromptTemplate.from_messages(
       messages
    )

    return string_extraction_template


def getTrainingsDataItem(trainings: List[TrainingsDataItem], sub_section: SubSection , text_input_field_id: str) -> TrainingsDataItem:
    trainings_id = None
    for text_input_field in sub_section.textInput:
        if text_input_field.id == text_input_field_id:
            trainings_id = text_input_field.trainingsId
            break
    for training in trainings:
        if training.id == trainings_id:
            return training

def getTextInputFieldLabel(sub_section: SubSection, text_input_field_id: str) -> str | None:
    for text_input_field in sub_section.textInput:
        if text_input_field.id == text_input_field_id:
           return text_input_field.label
    return None