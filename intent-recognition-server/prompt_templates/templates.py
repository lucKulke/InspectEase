from langchain_core.prompts import ChatPromptTemplate


multi_intent_classifier_template = """
You are a classifier that detects multiple intents within a sentence. 
Your task is to determine if the sentence contains more than one intent. 
If there are multiple intents, split the sentence accordingly and return each individual intent.

Sentence: "Set an alarm for 7 AM and play relaxing music."
Response: ["Set an alarm for 7 AM", "Play relaxing music"]

Sentence: "What's the weather like in New York?"
Response: ["What's the weather like in New York?"]


Sentence: "Turn off the lights and lock the front door."
Response: ["Turn off the lights", "Lock the front door"]

Sentence: "I have checked the front wheel airpressure and its ok plus i checked the valves of the engine and they are not ok"
Response: ["checked the front wheel airpressure and its ok", "checked the valves of the engine and they are not ok"]

Now, classify the following sentence:

Sentence: {sentence}
Response:
"""

multi_intent_classifier_prompt = ChatPromptTemplate.from_template(
    multi_intent_classifier_template
)


find_sub_category_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a classifier that selects the most appropriate subcategory based on the user input. You must use the following subcategories and only return the corresponding id. Return only a single id, no explanations. Subcategorys: {subcategorys}",
        ),
        ("human", "{sentence}"),
    ]
)


find_task_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a classifier that selects the most appropriate task based on the user input. You must use the following tasks and only return the corresponding id. Return only a single id, no explanations. tasks: {tasks}",
        ),
        ("human", "{sentence}"),
    ]
)


test_template = """
You are an intelligent assistant that updates checkbox fields in a form based on a user's description. 
Use the following form structure, and return only the updated list for the relevant section. 

Instructions:
- Identify which section the user is referring to.
- Check the appropriate boxes by setting `"checked": "True"` or `"checked": "False"` for any matching labels.
- Output only the updated list for that section in valid JSON format.
- Do not add explanations or extra text.

Form structure:
{{ "Ladezustand der Batterie prüfen": [{{"id": "38101f84-dd01-40b0-9ca7-326ce5883137", "label": "in ordnung", "checked": "False"}}, {{"id": "77c90251-98e7-4f9b-8cc2-7754ff170282", "label": "nicht in ordnung", "checked": "False"}}, {{"id": "f7c7f1aa-0f52-4968-8f4f-9f1739183c47", "label": "behoben", "checked": "False"}}], "Kontrollzelle der Batterie prüfen" : [{{"id": "f4649bba-3ec5-4e53-9568-fef0b73f1f01", "label": "in ordnung", "checked": "False"}}, {{"id": "75fa9cde-77b1-4d91-9631-302478cac86f", "label": "nicht in ordnung", "checked": "False"}}, {{"id": "1ef83f77-473c-40e7-af82-d2307e99059b", "label": "behoben", "checked": "False"}}] }}

Examples:

User sentence:
"Ich habe die Kontrollzelle geprüft und sie ist in ordnung."
Output:
[
  {{"id": "f4649bba-3ec5-4e53-9568-fef0b73f1f01", "label": "in ordnung", "checked": "True"}},
  {{"id": "75fa9cde-77b1-4d91-9631-302478cac86f", "label": "nicht in ordnung", "checked": "False"}},
  {{"id": "1ef83f77-473c-40e7-af82-d2307e99059b", "label": "behoben", "checked": "False"}}
]

User sentence:
"Die Kontroll zell war defekt, doch ich habe sie repariert und nun ist sie in ordnung."
Output:
[
  {{"id": "f4649bba-3ec5-4e53-9568-fef0b73f1f01", "label": "in ordnung", "checked": "True"}},
  {{"id": "75fa9cde-77b1-4d91-9631-302478cac86f", "label": "nicht in ordnung", "checked": "False"}},
  {{"id": "1ef83f77-473c-40e7-af82-d2307e99059b", "label": "behoben", "checked": "True"}}
]

User sentence:
"Die Batterie war in Ordnung."
Output:
[
  {{"id": "38101f84-dd01-40b0-9ca7-326ce5883137", "label": "in ordnung", "checked": "True"}},
  {{"id": "77c90251-98e7-4f9b-8cc2-7754ff170282", "label": "nicht in ordnung", "checked": "False"}},
  {{"id": "f7c7f1aa-0f52-4968-8f4f-9f1739183c47", "label": "behoben", "checked": "False"}}
]
"""


modify_checkboxes_template = ChatPromptTemplate.from_messages(
    [
        ("system", test_template),
        ("human", "form: {tasks}, input: {sentence}"),
    ]
)


'{"Electrik": [{"id": 23, "name": "Battery"}, {"id": 54, "name": "Rearlight"}], "Wheels":[{"id": 24, "name": "Airpressure"}]}'
