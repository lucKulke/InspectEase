from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from prompt_templates.templates import multi_intent_classifier_prompt, find_sub_category_template
from langchain.chains import LLMChain
import os
from models.pydantic_models import UserInput, Gpt, Anthropic, RootData
from langchain_core.language_models.base import BaseLanguageModel
from langchain.schema.output_parser import StrOutputParser
import dotenv
import json


app = FastAPI()




def getModelWrapper(user_input: UserInput) -> BaseLanguageModel: 
    return ChatOpenAI(
        model_name=user_input.llm.model,
        openai_api_key=user_input.llm.token,
        temperature=user_input.llm.temp
    )
   

def getSubSections(form: RootData):
    for main_section in  form.formData:
        for sub_section in main_section.subSections:
            print(sub_section.label, flush=True)


# Intent endpoint
@app.post("/intent")
async def get_intent(user_input: UserInput):
    llm = getModelWrapper(user_input)
    getSubSections(user_input.form)

    #define chains
    multi_intent_chain = multi_intent_classifier_prompt | llm | StrOutputParser()
    sub_category_chain = find_sub_category_template | llm | StrOutputParser()

    response = multi_intent_chain.invoke({"sentence": user_input.user_sentence})

    # for intent in json.loads(response):
    #     subCategory = sub_category_chain.invoke({"sentence": user_input.user_sentence, "subcategorys": user_input.})
    #     print(subCategory)


    print(json.loads(response), flush=True)
    return {"intent": response}
