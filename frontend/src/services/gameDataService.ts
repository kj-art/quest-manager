import demoCharacters from '../data/demo-characters.json';
import demoCharacterSettings from '../data/demo-character-settings.json';

// Check if we're in demo mode by looking at current user
function isDemoMode(): boolean {
  const demoUser = localStorage.getItem('demo-mode-active');
  return demoUser === 'true';
}

// Get stored auth tokens
function getAuthTokens(): { accessToken?: string; refreshToken?: string } | null {
  const storedAuth = localStorage.getItem('auth_tokens');
  if (!storedAuth) return null;
  
  try {
    const { accessToken, refreshToken } = JSON.parse(storedAuth);
    return { accessToken, refreshToken };
  } catch {
    return null;
  }
}

// Demo mode data functions
function fetchDemoData(sheetNames: string[]): Record<string, any[]> {
  const data: Record<string, any[]> = {};
  
  for (const sheetName of sheetNames) {
    if (sheetName === 'Characters') {
      // Get from localStorage or use defaults from JSON file
      const stored = localStorage.getItem('demo-characters');
      data[sheetName] = stored ? JSON.parse(stored) : demoCharacters;
    } else if (sheetName === 'CharacterSettings') {
      const stored = localStorage.getItem('demo-character-settings');
      data[sheetName] = stored ? JSON.parse(stored) : [demoCharacterSettings];
    }
  }
  
  return data;
}

function saveDemoData(sheetName: string, records: any[]): any {
  if (sheetName === 'Characters') {
    localStorage.setItem('demo-characters', JSON.stringify(records));
  } else if (sheetName === 'CharacterSettings') {
    localStorage.setItem('demo-character-settings', JSON.stringify(records));
  }
  
  return { success: true, message: 'Saved to demo storage' };
}

// Authenticated functions for real Google Sheets
async function fetchAuthenticatedGameData(sheetNames: string[]): Promise<Record<string, any[]>> {
  const tokens = getAuthTokens();
  if (!tokens?.accessToken) {
    throw new Error('No access token available');
  }

  const query = sheetNames.map(name => `sheets=${encodeURIComponent(name)}`).join('&');
  const response = await fetch(`/api/data?${query}`, {
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`
    }
  });

  if (!response.ok) {
    // Try to refresh token if unauthorized
    if (response.status === 401 && tokens.refreshToken) {
      const newTokens = await refreshAccessToken();
      if (newTokens) {
        // Retry with new token
        const retryResponse = await fetch(`/api/data?${query}`, {
          headers: {
            'Authorization': `Bearer ${newTokens.accessToken}`
          }
        });
        
        if (retryResponse.ok) {
          return await retryResponse.json();
        }
      }
    }
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  return await response.json();
}

async function saveAuthenticatedGameData(sheetName: string, records: any[]): Promise<any> {
  const tokens = getAuthTokens();
  if (!tokens?.accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(`/api/data/${encodeURIComponent(sheetName)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.accessToken}`
    },
    body: JSON.stringify(records)
  });

  if (!response.ok) {
    // Try to refresh token if unauthorized
    if (response.status === 401 && tokens.refreshToken) {
      const newTokens = await refreshAccessToken();
      if (newTokens) {
        // Retry with new token
        const retryResponse = await fetch(`/api/data/${encodeURIComponent(sheetName)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newTokens.accessToken}`
          },
          body: JSON.stringify(records)
        });
        
        if (retryResponse.ok) {
          return await retryResponse.json();
        }
      }
    }
    throw new Error(`Failed to save data to sheet '${sheetName}': ${response.statusText}`);
  }

  return await response.json();
}

// Token refresh function
async function refreshAccessToken(): Promise<{ accessToken: string } | null> {
  const tokens = getAuthTokens();
  if (!tokens?.refreshToken) return null;

  try {
    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: tokens.refreshToken })
    });

    if (!response.ok) {
      console.error('Token refresh failed:', response.statusText);
      return null;
    }

    const newTokens = await response.json();
    console.log('Token refreshed successfully');
    
    // Update stored tokens
    const storedAuth = localStorage.getItem('auth_tokens');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      authData.accessToken = newTokens.access_token;
      localStorage.setItem('auth_tokens', JSON.stringify(authData));
      console.log('Updated stored access token');
    }

    return { accessToken: newTokens.access_token };
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

// Public API - routes to demo or authenticated based on mode
export async function fetchGameData(...sheetNames: string[]): Promise<Record<string, any[]>> {
  if (isDemoMode()) {
    console.log('📝 Demo mode: Loading data from localStorage');
    return Promise.resolve(fetchDemoData(sheetNames));
  } else {
    console.log('☁️ Authenticated mode: Loading data from Google Sheets');
    return fetchAuthenticatedGameData(sheetNames);
  }
}

export async function saveGameData(sheetName: string, records: any[]): Promise<any> {
  if (isDemoMode()) {
    console.log('📝 Demo mode: Saving data to localStorage');
    return Promise.resolve(saveDemoData(sheetName, records));
  } else {
    console.log('☁️ Authenticated mode: Saving data to Google Sheets');
    return saveAuthenticatedGameData(sheetName, records);
  }
}

// Helper function to initialize demo mode
export function initializeDemoMode(): void {
  localStorage.setItem('demo-mode-active', 'true');
  
  // Always refresh with latest demo data from JSON files
  localStorage.setItem('demo-characters', JSON.stringify(demoCharacters));
  localStorage.setItem('demo-character-settings', JSON.stringify([demoCharacterSettings]));
}

// Helper function to clear demo mode
export function clearDemoMode(): void {
  localStorage.removeItem('demo-mode-active');
}