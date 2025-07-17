import dotenv
dotenv.load_dotenv()
from fastapi import FastAPI
from routers import manual_update_checkbox  # Import your routers

app = FastAPI()

# Include routers
app.include_router(manual_update_checkbox.router)
