import demoCharacters from '../data/demo-characters.json';
import demoCharacterSettings from '../data/demo-character-settings.json';

// Check if we're in demo mode by looking at current user
function isDemoMode(): boolean {
  const demoUser = localStorage.getItem('demo-mode-active');
  return demoUser === 'true';
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

// Original functions for real Google Sheets
async function fetchRealGameData(sheetNames: string[]): Promise<Record<string, any[]>> {
  const query = sheetNames.map(name => `sheets=${encodeURIComponent(name)}`).join('&');
  const response = await fetch(`/api/data?${query}`);
  return await response.json();
}

async function saveRealGameData(sheetName: string, records: any[]): Promise<any> {
  const response = await fetch(`/api/data/${encodeURIComponent(sheetName)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(records)
  });

  if (!response.ok) {
    throw new Error(`Failed to save data to sheet '${sheetName}': ${response.statusText}`);
  }

  return await response.json();
}

// Public API - routes to demo or real based on mode
export async function fetchGameData(...sheetNames: string[]): Promise<Record<string, any[]>> {
  if (isDemoMode()) {
    console.log('📝 Demo mode: Loading data from localStorage');
    return Promise.resolve(fetchDemoData(sheetNames));
  } else {
    console.log('☁️ Real mode: Loading data from Google Sheets');
    return fetchRealGameData(sheetNames);
  }
}

export async function saveGameData(sheetName: string, records: any[]): Promise<any> {
  if (isDemoMode()) {
    console.log('📝 Demo mode: Saving data to localStorage');
    return Promise.resolve(saveDemoData(sheetName, records));
  } else {
    console.log('☁️ Real mode: Saving data to Google Sheets');
    return saveRealGameData(sheetName, records);
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
  // Optionally clear demo data too
  // localStorage.removeItem('demo-characters');
  // localStorage.removeItem('demo-character-settings');
}