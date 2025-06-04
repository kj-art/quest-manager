import { useState, useEffect } from 'react';
import type { Character, CharacterSettings } from '../Character';
import { fetchGameData } from '../services/gameDataService';

export function useGameData() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [settings, setSettings] = useState<CharacterSettings>({
    statTotal: 4,
    abilityUpgradeMax: 7,
    statUpgradeMax: 7,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchGameData();
        setCharacters(data.characters);
        setSettings(data.settings);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching game data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    characters,
    setCharacters,
    settings,
    setSettings,
    isLoading,
    error
  };
} 