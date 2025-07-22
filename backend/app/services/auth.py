from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

def get_user_sheets_service(access_token: str):
    credentials = Credentials(token=access_token)
    return build("sheets", "v4", credentials=credentials)
