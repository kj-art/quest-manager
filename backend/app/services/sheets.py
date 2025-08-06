from google.oauth2 import service_account
from googleapiclient.discovery import build
from ..config import GOOGLE_CREDENTIALS_PATH, SCOPES, SPREADSHEET_ID
from flatdict import FlatterDict
from .auth import get_user_sheets_service

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

def unflatten_dict(flat_dict, delimiter='.'):
    """Convert a flat dict with dot notation keys back to nested dict"""
    result = {}
    for key, value in flat_dict.items():
        keys = key.split(delimiter)
        current = result
        for k in keys[:-1]:
            if k not in current:
                current[k] = {}
            current = current[k]
        current[keys[-1]] = value
    return result

def flatten_dict(nested_dict, delimiter='.'):
    """Convert nested dict to flat dict with dot notation keys"""
    result = {}
    
    def _flatten(obj, parent_key=''):
        if isinstance(obj, dict):
            for key, value in obj.items():
                new_key = f"{parent_key}{delimiter}{key}" if parent_key else key
                _flatten(value, new_key)
        else:
            result[parent_key] = obj
    
    _flatten(nested_dict)
    return result

def _fetch_game_data_impl(sheet_service, sheet_names: list[str]):
    """Implementation that works with any sheets service"""
    response_data = {}

    for s in sheet_names:
        data = sheet_service.spreadsheets().values().get(
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

        # Convert flat data from sheets to nested objects for React
        r_data = [unflatten_dict(d, delimiter='.') for d in r_data]
        response_data[s] = r_data

    return response_data

def _write_game_data_impl(sheet_service, sheet_name: str, records: list[dict]):
    """Implementation that works with any sheets service"""
    # Read header and type rows like fetch_game_data
    meta = sheet_service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{sheet_name}!A1:2"
    ).execute()

    rows = meta.get("values", [])
    if not rows:
        raise Exception(f"No data found in '{sheet_name}'.")

    headers = rows[0]
    types = rows[1] if len(rows) > 1 else [""] * len(headers)
    types += [""] * (len(headers) - len(types))  # pad types row

    # Start new sheet values with headers and types
    values = [headers, types]

    for record in records:
        row = []
        # Convert nested objects to flat dict for compatibility with sheet headers
        flat_record = flatten_dict(record, delimiter='.')

        for i, header in enumerate(headers):
            type_hint = types[i].strip().lower()
            val = flat_record.get(header, "")

            if type_hint == "array" and isinstance(val, list):
                val = '|'.join(str(v) for v in val)
            elif isinstance(val, (int, float)):
                val = str(val)
            elif val is None:
                val = ""
            else:
                val = str(val)

            row.append(val)

        values.append(row)

    # Overwrite the whole sheet starting at A1
    result = sheet_service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{sheet_name}!A1",
        valueInputOption="RAW",
        body={"values": values}
    ).execute()

    return result

# Original functions using service account
def fetch_game_data(sheet_names: list[str]):
    service = get_sheets_service()
    return _fetch_game_data_impl(service, sheet_names)

def write_game_data(sheet_name: str, records: list[dict]):
    service = get_sheets_service()
    return _write_game_data_impl(service, sheet_name, records)

# New functions that accept an authenticated service
def fetch_game_data_with_service(sheet_service, sheet_names: list[str]):
    return _fetch_game_data_impl(sheet_service, sheet_names)

def write_game_data_with_service(sheet_service, sheet_name: str, records: list[dict]):
    return _write_game_data_impl(sheet_service, sheet_name, records)