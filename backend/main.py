from fastapi import FastAPI
import os
import psycopg2

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Itinerary Planner Backend Connected!"}
