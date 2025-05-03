from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from prompt_templates.templates import (
    multi_intent_classifier_prompt,
    find_sub_category_template,
    find_task_template,
    modify_checkboxes_template,
)
from langchain.chains import LLMChain
import os
from models.pydantic_models import UserInput, Gpt, RootData, SubSection
from langchain_core.language_models.base import BaseLanguageModel
from langchain.schema.output_parser import StrOutputParser
import json


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
            print(f"{sub_section.id} : {sub_section.label}", flush=True)
            subSections[sub_section.id] = sub_section.label
    return subSections


def getSubSectionData(sub_section_id: str, form: RootData) -> SubSection | None:
    for main_section in form.formData:
        for sub_section in main_section.subSections:
            if sub_section.id == sub_section_id:
                return sub_section
    return None


# Intent endpoint
@app.post("/intent")
async def get_intent(user_input: UserInput):
    llm = getModelWrapper(user_input)
    user_sentence = user_input.userSentence

    # define chains
    multi_intent_chain = multi_intent_classifier_prompt | llm | StrOutputParser()
    sub_section_chain = find_sub_category_template | llm | StrOutputParser()
    task_chain = find_task_template | llm | StrOutputParser()
    checkbox_chain = modify_checkboxes_template | llm | StrOutputParser()

    response = multi_intent_chain.invoke({"sentence": user_sentence})

    for intent in json.loads(response):
        subCategory = sub_section_chain.invoke(
            {"sentence": user_sentence, "subcategorys": getSubSections(user_input.form)}
        )
        sub_section = getSubSectionData(
            sub_section_id=subCategory, form=user_input.form
        )

        temp_tasks = {}
        tasks = {}
        for group in sub_section.checkboxGroupsWithTasks:
            for task in group.tasks:
                tasks[task.description] = []
                for checkbox in task.checkboxes:
                    tasks[task.description].append(
                        {
                            "id": checkbox.id,
                            "label": checkbox.label,
                            "checked": checkbox.checked,
                        }
                    )

        resp = checkbox_chain.invoke({"tasks": tasks, "sentence": user_sentence})

        print(resp, flush=True)

        # temp_checkboxes = {}
        # checkboxes = {}
        # for checkbox in temp_tasks[taskId].checkboxes:
        #     checkboxes[checkbox.id] = {
        #         "label": checkbox.label,
        #         "checked": checkbox.checked,
        #     }
        #     temp_checkboxes[checkbox.id] = checkbox

    # print(json.loads(response), flush=True)
    return {"intent": True}
