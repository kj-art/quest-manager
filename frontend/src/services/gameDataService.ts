import type { Character, CharacterSettings } from '../Character';
import { setAbilityUpgradeMax, setStatUpgradeMax, setTotalStatPoints } from '../Character';

export interface GameData {
  characters: Character[];
  statTotal?: number;
  abilityUpgradeMax?: number;
  statUpgradeMax?: number;
}

export interface FetchGameDataResponse {
  characters: Character[];
  settings: CharacterSettings;
}

export async function fetchGameData(): Promise<FetchGameDataResponse> {
  try {
    const response = await fetch('/src/characters.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: GameData = await response.json();
    
    const settings: CharacterSettings = {
      statTotal: data.statTotal ?? 4,
      abilityUpgradeMax: data.abilityUpgradeMax ?? 7,
      statUpgradeMax: data.statUpgradeMax ?? 7
    };

    // Update the global settings
    setTotalStatPoints(settings.statTotal);
    setAbilityUpgradeMax(settings.abilityUpgradeMax);
    setStatUpgradeMax(settings.statUpgradeMax);

    return {
      characters: Array.isArray(data.characters) ? data.characters : [],
      settings
    };
  } catch (error) {
    console.error('Failed to load game data:', error);
    return {
      characters: [],
      settings: {
        statTotal: 4,
        abilityUpgradeMax: 7,
        statUpgradeMax: 7
      }
    };
  }
} 