from langchain_core.prompts import ChatPromptTemplate



multi_intent_classifier_template="""
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

multi_intent_classifier_prompt=ChatPromptTemplate.from_template(multi_intent_classifier_template)






find_sub_category_template = ChatPromptTemplate.from_messages([
    ("system", "You are a classifier that selects the most appropriate subcategory based on the user input. You must use the following subcategories and only return the corresponding id. Return only a single id, no explanations. Subcategorys: {subcategorys}"),
    ("human", "The air pressure of the front wheels is ok"),
    ("ai", "24"),
    ("human", "{sentence}")
])




'{"Electrik": [{"id": 23, "name": "Battery"}, {"id": 54, "name": "Rearlight"}], "Wheels":[{"id": 24, "name": "Airpressure"}]}'