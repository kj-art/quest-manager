import type { Character, CharacterSettings } from '../Character';
import { setAbilityUpgradeMax, setStatUpgradeMax, setTotalStatPoints } from '../Character';
import { unflatten, flatten } from 'flat';

export interface GameData
{
  characters: Character[];
  statTotal?: number;
  abilityUpgradeMax?: number;
  statUpgradeMax?: number;
}

export interface FetchGameDataResponse {
  characters: Character[];
  settings: CharacterSettings;
}

export async function fetchGameData() {
  const response = await fetch('/data/characters.json');
  const data = await response.json();

  // Convert tags from string to array before unflattening
  const characters = data.characters.map((flatChar: any) => {
    if (typeof flatChar.tags === 'string') {
      flatChar.tags = flatChar.tags === '' ? [] : flatChar.tags.split('|');
    }
    return unflatten(flatChar);
  });

  return {
    ...data,
    characters,
  };
}