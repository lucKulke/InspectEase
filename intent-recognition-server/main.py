from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from prompt_templates.templates import (
    multi_intent_classifier_prompt,
    find_sub_category_template,
    determine_if_text_input_field_template,
    modify_checkboxes_template,
)
from typing import List
import os
from models.pydantic_models import UserInput, Gpt, RootData, SubSection, TrainingsDataItem, Logs
from langchain_core.language_models.base import BaseLanguageModel
from langchain.schema.output_parser import StrOutputParser
import json
import asyncio
from utils.helper import getCheckboxesReady, getModelWrapper, getSubSectionData, getSubSections, getTextInputFieldsReady, getTrainingsDataItem, stringExtractionTemplate


app = FastAPI()




# Intent endpoint
@app.post("/intent")
async def get_intent(user_input: UserInput):
    llm = getModelWrapper(user_input)
    user_sentence = user_input.userSentence
   
    response = {"textInputFields": [], "checkboxes": [], "log": {"error": [], "intent":[]}, "success": False}
    # Define chains
    multi_intent_chain = multi_intent_classifier_prompt | llm | StrOutputParser()
    sub_section_chain = find_sub_category_template | llm | StrOutputParser()
    find_text_input_field_chain = determine_if_text_input_field_template | llm | StrOutputParser()
    checkbox_chain = modify_checkboxes_template | llm | StrOutputParser()

    try:
        raw = multi_intent_chain.invoke({"sentence": user_sentence})
        intents = json.loads(raw)
        response["success"] = True
        print(intents, flush=True)
    except:
        response["log"]["error"].append(f"Error in multi intent classifier: {raw}")
        return response
        

    async def process_intent(intent):
        intent_response = {"textInputFields": [], "checkboxes": []}

        subCategory = sub_section_chain.invoke(
            {"sentence": intent, "subcategorys": getSubSections(user_input.form)}
        )
        sub_section = getSubSectionData(
            sub_section_id=subCategory, form=user_input.form
        )
        text_input_fields = getTextInputFieldsReady(sub_section=sub_section)
        checkboxes = getCheckboxesReady(sub_section=sub_section)

        text_input_field = find_text_input_field_chain.invoke(
            {"text_input_fields": text_input_fields, "sentence": intent}
        )

        if text_input_field != "None":
            string_extraction_training = getTrainingsDataItem(
                trainings=user_input.form.trainingsData,
                sub_section=sub_section,
                text_input_field_id=text_input_field
            )
            string_extraction_template = stringExtractionTemplate(
                training=string_extraction_training, user_sentence=intent
            )
            string_extraction_chain = string_extraction_template | llm | StrOutputParser()
            extracted_string = string_extraction_chain.invoke({})
            intent_response["textInputFields"].append({
                "id": text_input_field,
                "value": extracted_string
            })
        else:
            raw = checkbox_chain.invoke({
                "checkboxes": checkboxes,
                "sentence": intent
            })
            checked_checkboxes = json.loads(raw)
            if isinstance(checked_checkboxes, list):
                intent_response["checkboxes"] += checked_checkboxes
            elif isinstance(checked_checkboxes, dict):
                for key in checked_checkboxes:
                    intent_response["checkboxes"] += checked_checkboxes[key]

        return intent_response

    # Run all intent tasks concurrently
    results = await asyncio.gather(*(process_intent(intent) for intent in intents))

    # Merge the results
    for result in results:
        response["textInputFields"] += result["textInputFields"]
        response["checkboxes"] += result["checkboxes"]

    print(response, flush=True)
    return response