import traceback
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from .services.sheets import fetch_game_data, write_game_data
from .services.oauth import GoogleOAuthService

app = FastAPI()

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OAuth service
AUTH_CALLBACK = "/auth/callback"
oauth_service = GoogleOAuthService(AUTH_CALLBACK)

@app.get("/api/data")
def get_data(request: Request, sheets: List[str] = Query()):
    # Check for Authorization header
    auth_header = request.headers.get('Authorization')
    
    if auth_header and auth_header.startswith('Bearer '):
        # Authenticated request - use OAuth token
        access_token = auth_header.split(' ')[1]
        try:
            # Get user info to validate token first
            user_info = oauth_service.get_user_info(access_token)
            print(f"Authenticated request from user: {user_info.get('email')}")
            
            # Use OAuth service to get authenticated sheets service
            sheets_service = oauth_service.get_sheets_service(access_token)
            # Use authenticated service to fetch data
            from .services.sheets import fetch_game_data_with_service
            return fetch_game_data_with_service(sheets_service, sheets)
        except Exception as e:
            print(f"Authentication error: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
    else:
        # Fall back to service account (original behavior)
        return fetch_game_data(sheets)

@app.post("/api/data/{sheet_name}")
def save_data(request: Request, sheet_name: str, data: List[Dict[str, Any]]):
    try:
        print(f"Saving to sheet: {sheet_name}")
        print(f"Data received: {data}")
        
        # Check for Authorization header
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            # Authenticated request - use OAuth token
            access_token = auth_header.split(' ')[1]
            try:
                # Get user info to validate token first
                user_info = oauth_service.get_user_info(access_token)
                print(f"Authenticated save request from user: {user_info.get('email')}")
                
                # Use OAuth service to get authenticated sheets service
                sheets_service = oauth_service.get_sheets_service(access_token)
                # Use authenticated service to save data
                from .services.sheets import write_game_data_with_service
                result = write_game_data_with_service(sheets_service, sheet_name, data)
            except Exception as e:
                print(f"Authentication error: {e}")
                print(f"Traceback: {traceback.format_exc()}")
                raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
        else:
            # Fall back to service account (original behavior)
            result = write_game_data(sheet_name, data)
            
        return {"success": True, "result": result}
    except Exception as e:
        print(f"Error saving data: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

# OAuth endpoints
@app.get("/auth/login")
def initiate_google_login():
    """Start the Google OAuth flow"""
    try:
        auth_url = oauth_service.get_authorization_url()
        return {"auth_url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate auth URL: {str(e)}")

@app.get(AUTH_CALLBACK)
def google_callback(request: Request, code: str = None, error: str = None, state: str = None):
    """Handle Google OAuth callback"""
    
    if error:
        # Redirect to frontend with error
        return RedirectResponse(
            url=f"http://localhost:5173?auth_error={error}",
            status_code=302
        )
    
    if not code:
        return RedirectResponse(
            url="http://localhost:5173?auth_error=no_code",
            status_code=302
        )
    
    try:
        # Exchange code for tokens
        tokens = oauth_service.exchange_code_for_tokens(code)
        
        # Get user info
        user_info = oauth_service.get_user_info(tokens['access_token'])
        
        # Store tokens securely in production (session/database)
        # Currently using URL params for development only
        
        redirect_params = {
            'auth_success': 'true',
            'access_token': tokens['access_token'],
            'refresh_token': tokens.get('refresh_token', ''),
            'user_id': user_info['id'],
            'user_name': user_info['name'],
            'user_email': user_info['email']
        }
        
        # Create query string
        from urllib.parse import urlencode
        query_string = urlencode(redirect_params)
        
        return RedirectResponse(
            url=f"http://localhost:5173?{query_string}",
            status_code=302
        )
        
    except Exception as e:
        print(f"OAuth callback error: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return RedirectResponse(
            url=f"http://localhost:5173?auth_error=callback_failed",
            status_code=302
        )

@app.post("/auth/refresh")
def refresh_token(request_data: Dict[str, str]):
    """Refresh access token using refresh token"""
    refresh_token = request_data.get('refresh_token')
    
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token required")
    
    try:
        new_tokens = oauth_service.refresh_access_token(refresh_token)
        return {
            "access_token": new_tokens['access_token'],
            "expires_in": new_tokens.get('expires_in', 3600)
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token refresh failed: {str(e)}")

@app.get("/auth/user")
def get_current_user(request: Request):
    """Get current user info (requires Authorization header with access token)"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="No valid authorization header")
    
    access_token = auth_header.split(' ')[1]
    
    try:
        user_info = oauth_service.get_user_info(access_token)
        return user_info
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid access token: {str(e)}")