import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

GOOGLE_CREDENTIALS_PATH = os.getenv('GOOGLE_CREDENTIALS_PATH')
SPREADSHEET_ID = os.getenv('SPREADSHEET_ID')
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']