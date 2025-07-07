import { useState, useEffect } from 'react';
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
