{/*import { useState, useEffect } from 'react';
import type { Character } from '../Character';
import { fetchGameData } from '../services/gameDataService';

export function useGameData() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchGameData('Characters', 'CharacterSettings');
        setCharacters(data.Characters);
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
    isLoading,
    error
  };
}
*/}

import { useState, useEffect } from 'react';
import type { Character } from '../Character';
import type { CharacterSettings } from '../contexts/CharacterSettingsContext';
import { fetchGameData } from '../services/gameDataService';

export function useGameData() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [settings, setSettings] = useState<CharacterSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchGameData('Characters', 'CharacterSettings');
        setCharacters(data.Characters);
        setSettings(
          Object.fromEntries(
            Object.entries(data.CharacterSettings?.[0] ?? {}).map(([k, v]) => [k, Number(v) || 0])
          )
        );

        //setSettings(data.CharacterSettings);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching game data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const saveGameData = async () => {
    try {
      await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Characters: characters,
          CharacterSettings: settings
        })
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving game data');
    }
  };

  return {
    characters,
    setCharacters,
    settings,
    setSettings,
    isLoading,
    error,
    saveGameData
  };
}
