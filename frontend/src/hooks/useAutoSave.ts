import { useCallback, useEffect, useRef } from 'react';
import { saveGameData } from '../services/gameDataService';
import type { Character } from '../Character';
import type { CharacterSettings } from '../contexts/CharacterSettingsContext';

interface UseAutoSaveOptions {
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const { debounceMs = 1000, onSaveSuccess, onSaveError } = options;
  const saveTimeoutRef = useRef<number>();
  const isSavingRef = useRef(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveCharacters = useCallback(async (characters: Character[]) => {
    if (isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      await saveGameData('Characters', characters);
      onSaveSuccess?.();
    } catch (error) {
      console.error('Failed to save characters:', error);
      onSaveError?.(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      isSavingRef.current = false;
    }
  }, [onSaveSuccess, onSaveError]);

  const saveSettings = useCallback(async (settings: CharacterSettings) => {
    if (isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      // Convert settings object to array format expected by sheets
      const settingsArray = [settings];
      await saveGameData('CharacterSettings', settingsArray);
      onSaveSuccess?.();
    } catch (error) {
      console.error('Failed to save settings:', error);
      onSaveError?.(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      isSavingRef.current = false;
    }
  }, [onSaveSuccess, onSaveError]);

  const debouncedSaveCharacters = useCallback((characters: Character[]) => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveCharacters(characters);
    }, debounceMs);
  }, [saveCharacters, debounceMs]);

  const debouncedSaveSettings = useCallback((settings: CharacterSettings) => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveSettings(settings);
    }, debounceMs);
  }, [saveSettings, debounceMs]);

  return {
    saveCharacters: debouncedSaveCharacters,
    saveSettings: debouncedSaveSettings,
    isSaving: isSavingRef.current
  };
}