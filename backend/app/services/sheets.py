from google.oauth2 import service_account
from googleapiclient.discovery import build
from ..config import GOOGLE_CREDENTIALS_PATH, SCOPES, SPREADSHEET_ID
from flatdict import FlatterDict

def get_sheets_service():
    credentials = service_account.Credentials.from_service_account_file(
        GOOGLE_CREDENTIALS_PATH,
        scopes=SCOPES
    )
    return build('sheets', 'v4', credentials=credentials)

def _parse_value(val):
    try:
        return int(val)
    except ValueError:
        try:
            return float(val)
        except ValueError:
            return val

def fetch_game_data(sheet_names: list[str]):
    service = get_sheets_service()
    sheet = service.spreadsheets()

    response_data = {}

    for s in sheet_names:
        data = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=s
        ).execute()
        vals = data.get('values', [])
        if not vals:
            raise Exception(f"No '{s}' data found.")

        headers = vals[0]
        types = vals[1] if len(vals) > 1 else []
        rows = vals[2:] if len(vals) > 2 else []

        # Pad types row so its length matches headers
        types += [""] * (len(headers) - len(types))

        r_data = [
            dict(zip(headers, row + [""] * (len(headers) - len(row))))
            for row in rows
        ]

        for d in r_data:
            for k, v in d.items():
                # Find type for this key, default to ""
                idx = headers.index(k)
                type_hint = types[idx].strip().lower() if idx < len(types) else ""

                if type_hint == "array":
                    d[k] = v.split('|') if isinstance(v, str) and v.strip() else []
                else:
                    # Leave as is (usually string)
                    d[k] = v

        # Flatten each dict
        r_data = [FlatterDict(d, delimiter='.').as_dict() for d in r_data]
        response_data[s] = r_data

    return response_data


def write_game_data(range_name, data):
    service = get_sheets_service()
    body = {
        'values': data  # should be a list of lists
    }
    result = service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=range_name,
        valueInputOption='RAW',
        body=body
    ).execute()
    return result