from fastapi import FastAPI, Query
from typing import List
from .services.sheets import fetch_game_data, write_game_data

app = FastAPI()

@app.get("/api/data")
def get_data(sheets: List[str] = Query()):
    return fetch_game_data(sheets)

'''@app.post("api/data")
def save_data(data: list[list[str]]):  # adjust schema as needed
    return write_game_data('characters!A1', data)
'''