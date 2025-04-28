from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from prompt_templates.templates import multi_intent_classifier_prompt, find_sub_category_template
from langchain.chains import LLMChain
import os
from models.pydantic_models import UserInput, Gpt, Anthropic
from langchain_core.language_models.base import BaseLanguageModel
from langchain.schema.output_parser import StrOutputParser
import dotenv
import json

dotenv.load_dotenv()

app = FastAPI()





def getModelWrapper(user_input: UserInput) -> BaseLanguageModel: 
    return ChatOpenAI(
        model_name=user_input.llm.model,
        openai_api_key=user_input.llm.token,
        temperature=user_input.llm.temp
    )
   
def getSubcategorys(user_input: UserInput) -> dict:
    pass
    # response = {}
    # for maincategory, subcategorys in user_input.form.items():
    #     print(f"maincategory: {maincategory}")
        

    #     for subcategory in subcategorys: 
            
             # list inside each section
            # for system, system_data in subcategory.items():  # system like Battery, Rearlightsystem
            #     print(f"  System: {system}")

            #     # Handle 'selectionGroups' if present
            #     selection_groups = system_data.get('selectionGroups', [])
            #     for group in selection_groups:
            #         # Checkboxes
            #         for checkbox in group.get('checkboxes', []):
            #             print(f"    Checkbox: {checkbox['label']} (id: {checkbox['id']})")

            #         # Tasks
            #         for task in group.get('tasks', []):
            #             print(f"    Task: {task['description']} (id: {task['id']})")

            #     # Handle 'textInputFields' if present
            #     text_inputs = system_data.get('textInputFields', [])
            #     for field in text_inputs:
            #         print(f"    Text Input Field: {field['label']} (trainingsId: {field['trainingsId']})")



# Intent endpoint
@app.post("/intent")
async def get_intent(user_input: UserInput):
    llm = getModelWrapper(user_input)

    #define chains
    multi_intent_chain = multi_intent_classifier_prompt | llm | StrOutputParser()
    sub_category_chain = find_sub_category_template | llm | StrOutputParser()

    response = multi_intent_chain.invoke({"sentence": user_input.user_sentence})

    # for intent in json.loads(response):
    #     subCategory = sub_category_chain.invoke({"sentence": user_input.user_sentence, "subcategorys": user_input.})
    #     print(subCategory)


    print(json.loads(response)[0], flush=True)
    return {"intent": response}
