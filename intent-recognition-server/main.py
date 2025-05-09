from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from prompt_templates.templates import (
    multi_intent_classifier_prompt,
    find_sub_category_template,
    determine_if_text_input_field_template,
    modify_checkboxes_template,
)
from typing import Dict, List
import os
from models.pydantic_models import UserInput, Gpt, RootData, SubSection, TrainingsDataItem, Logs
from langchain_core.language_models.base import BaseLanguageModel
from langchain.schema.output_parser import StrOutputParser
import json
import asyncio
from utils.helper import getCheckboxesReady, getModelWrapper, getSubSectionData, getSubSections, getTextInputFieldsReady, getTrainingsDataItem, stringExtractionTemplate, getTextInputFieldLabel
import redis.asyncio as redis
from uuid import uuid4
from datetime import datetime


app = FastAPI()

redis_host = "localhost"
if os.environ.get('REDIS_DB'):
    redis_host = os.environ.get('REDIS_DB')
# "info" | "warning" | "error" | "success";

redis_client = redis.Redis(host=redis_host, port=6379, decode_responses=True)



async def emit(uuid: str, intent: str, message: str, type: str = "info" ):
    now = datetime.now()
    new_log_entry = {"id": str(uuid4()),"intent": intent, "timestamp": str(now), "message": message, "type": type} 
    await redis_client.publish(uuid, json.dumps(new_log_entry))


# Intent endpoint
@app.post("/intent")
async def get_intent(user_input: UserInput, uuid: str):
    await emit(uuid, intent="",  message="START", type="info")
    
    llm = getModelWrapper(user_input)
    user_sentence = user_input.userSentence
   
    response = {"textInputFields": [], "checkboxes": []}
    # Define chains
    multi_intent_chain = multi_intent_classifier_prompt | llm | StrOutputParser()
    sub_section_chain = find_sub_category_template | llm | StrOutputParser()
    find_text_input_field_chain = determine_if_text_input_field_template | llm | StrOutputParser()
    checkbox_chain = modify_checkboxes_template | llm | StrOutputParser()

    try:
        raw = multi_intent_chain.invoke({"sentence": user_sentence})
        intents = json.loads(raw)
        # print(f"intents {intents}")
        # if not isinstance(intents, list):
        #     raise InterruptedError
        # await emit(uuid, message=f"successfully extracted {len(intents)} intent{'s' if len(intents) > 1 else ''}: {intents}", type="success")
    except:
        await emit(uuid, intent="",  message="Error during multi intent recognition", type="error")
        await emit(uuid, intent="",  message="DONE", type="error")
        return response
        
    
    async def process_intent(intent):
        intent_response = {"textInputFields": [], "checkboxes": []}

        subCategory = sub_section_chain.invoke(
            {"sentence": intent, "subcategorys": getSubSections(user_input.form)}
        )
        sub_section = getSubSectionData(
            sub_section_id=subCategory, form=user_input.form
        )
        if not sub_section:
            await emit(uuid, intent="",  message="Could not find sub category", type="error")
            await emit(uuid, intent="",  message="DONE", type="error")
            return intent_response
            
        await emit(uuid, intent=intent, message=f"identifyed sub category '{sub_section.label}'", type="success")

        text_input_fields = getTextInputFieldsReady(sub_section=sub_section)
        checkboxes = getCheckboxesReady(sub_section=sub_section)
        
        await emit(uuid,intent=intent, message=f"checking if text input field ")
        
        text_input_field = find_text_input_field_chain.invoke(
            {"text_input_fields": text_input_fields, "sentence": intent}
        )
        
        if text_input_field != "None":
            text_input_field_label = getTextInputFieldLabel(sub_section=sub_section, text_input_field_id = text_input_field)
            if not text_input_field_label:
                await emit(uuid, intent="", message="Could not find sub text input field", type="error")
                await emit(uuid, intent="",  message="DONE", type="error")
                return intent_response
            
            await emit(uuid,intent=intent, message=f"is text input field with label '{text_input_field_label}'", type="success")
            
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
            await emit(uuid, intent=intent, message=f"extracted string '{extracted_string}'", type="success")
        else:
            await emit(uuid, intent=intent, message=f"is no text input field, must be checkbox")
            raw = checkbox_chain.invoke({
                "checkboxes": checkboxes,
                "sentence": intent
            })
            try:
                checked_checkboxes = json.loads(raw)
                await emit(uuid,intent=intent, message=f"filled out checkboxes '{checked_checkboxes}'", type="success")
            except: 
                await emit(uuid,intent=intent, message=f"Could not find checkbox", type="error")
                await emit(uuid, intent="",  message="DONE", type="error")
                return intent_response
            
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
    await emit(uuid, intent="", message="Intent recognition complete.")
    await emit(uuid, intent="", message="DONE")
    return response



@app.websocket("/intent-logs/ws")
async def intent_logs(websocket: WebSocket):
    await websocket.accept()
    try:
        uuid = await websocket.receive_text()
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(uuid)

        async for message in pubsub.listen():
            if message['type'] != 'message':
                continue
            data = message['data']
            await websocket.send_text(data)
            if data == "DONE":
                break

        await pubsub.unsubscribe(uuid)
        await pubsub.close()

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for UUID: {uuid}")
    except Exception as e:
        await websocket.send_text(f"Error: {str(e)}")
        await websocket.close()
