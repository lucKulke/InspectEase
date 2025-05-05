from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from prompt_templates.templates import (
    multi_intent_classifier_prompt,
    find_sub_category_template,
    determine_if_text_input_field_template,
    modify_checkboxes_template,
    find_field_group_template
)
from langchain.chains import LLMChain
from typing import List
import os
from models.pydantic_models import UserInput, Gpt, RootData, SubSection, TrainingsDataItem
from langchain_core.language_models.base import BaseLanguageModel
from langchain.schema.output_parser import StrOutputParser
import json
from langchain_core.prompts import ChatPromptTemplate


app = FastAPI()


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


# Intent endpoint
@app.post("/intent")
async def get_intent(user_input: UserInput):
    llm = getModelWrapper(user_input)
    user_sentence = user_input.userSentence
    response = {"textInputFields": [], "checkboxes": []}

    # define chains
    multi_intent_chain = multi_intent_classifier_prompt | llm | StrOutputParser()
    sub_section_chain = find_sub_category_template | llm | StrOutputParser()
    find_text_input_field_chain = determine_if_text_input_field_template | llm | StrOutputParser()
    find_field_group_chain = find_field_group_template | llm | StrOutputParser()
    checkbox_chain = modify_checkboxes_template | llm | StrOutputParser()

    intents = multi_intent_chain.invoke({"sentence": user_sentence})
    print(intents, flush=True)

    for intent in json.loads(intents):
        subCategory = sub_section_chain.invoke(
            {"sentence": intent, "subcategorys": getSubSections(user_input.form)}
        )
        sub_section = getSubSectionData(
            sub_section_id=subCategory, form=user_input.form
        )
        text_input_fields = getTextInputFieldsReady(sub_section=sub_section)
        checkboxes = getCheckboxesReady(sub_section=sub_section)

        text_input_field = find_text_input_field_chain.invoke({"text_input_fields": text_input_fields, "sentence": intent})
        
        # resp = find_field_group_chain.invoke({"sections": getFieldGroups(sub_section=sub_section), "sentence": intent})
        # print(getFieldGroups(sub_section=sub_section))
        # print(resp)
        if(text_input_field != "None"):
            print(text_input_field)
            string_extraction_training = getTrainingsDataItem(trainings=user_input.form.trainingsData,sub_section=sub_section, text_input_field_id=text_input_field)
            string_extraction_template = stringExtractionTemplate(training=string_extraction_training, user_sentence=intent)
            string_extraction_chain = string_extraction_template | llm | StrOutputParser()
            extracted_string = string_extraction_chain.invoke({})
            response["textInputFields"].append({"id": text_input_field ,"value": extracted_string})
        else: 
            print()
            print(checkboxes, flush=True)
            print()
           
            raw = checkbox_chain.invoke({"checkboxes": checkboxes, "sentence": intent})
            print("raw " + raw, flush=True)
            checked_checkboxes = json.loads(raw)
            print()
            if isinstance(checked_checkboxes, list):
                response["checkboxes"] = response["checkboxes"] + checked_checkboxes
            elif isinstance(checked_checkboxes, dict):
                for key in checked_checkboxes:
                    response["checkboxes"] = response["checkboxes"] + checked_checkboxes[key]
                
            print()
            print("intent:" + intent + " checkboxes: "+ str(checked_checkboxes), flush=True)
            #response["checkboxes"] = response["checkboxes"] + checked_checkboxes
            
            print()
           
            

        
    print(response, flush=True)
    return response
