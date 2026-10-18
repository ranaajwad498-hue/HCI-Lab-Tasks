# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

app = FastAPI()

# Restrict this to the domain where your HTML/JS is hosted
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

class TrackEvent(BaseModel):
    session_id: str
    event_type: str
    timestamp: str
    url: str
    data: Optional[Dict[str, Any]] = None

@app.post("/api/track")
async def receive_tracking_data(event: TrackEvent, request: Request):
    # In a real application, you would save this to a PostgreSQL database
    # For now, we will just log it to the console
    print(f"[{event.timestamp}] {event.event_type} from Session {event.session_id}")
    print(f"URL: {event.url}")
    print(f"Details: {event.data}")
    print("-" * 40)
    
    return {"status": "success"}

# Run using: uvicorn main:app --reload