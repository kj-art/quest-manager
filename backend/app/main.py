import traceback
from fastapi import FastAPI, Query, HTTPException
from typing import List, Dict, Any
from .services.sheets import fetch_game_data, write_game_data

app = FastAPI()

@app.get("/api/data")
def get_data(sheets: List[str] = Query()):
    return fetch_game_data(sheets)

@app.post("/api/data/{sheet_name}")
def save_data(sheet_name: str, data: List[Dict[str, Any]]):
    try:
        print(f"Saving to sheet: {sheet_name}")
        print(f"Data received: {data}")
        result = write_game_data(sheet_name, data)
        return {"success": True, "result": result}
    except Exception as e:
        print(f"Error saving data: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))