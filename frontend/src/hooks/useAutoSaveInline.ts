import { useCallback, useRef } from 'react';
import { saveGameData } from '../services/gameDataService';
import type { Character } from '../Character';

interface UseAutoSaveInlineOptions {
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSaveInline(options: UseAutoSaveInlineOptions = {}) {
  const { debounceMs = 2000, onSaveStart, onSaveSuccess, onSaveError } = options;
  const saveTimeoutRef = useRef<number>();
  const isSavingRef = useRef(false);

  const saveCharacters = useCallback(async (characters: Character[]) => {
    if (isSavingRef.current) {
      console.log('Save already in progress, skipping auto-save...');
      return;
    }

    try {
      isSavingRef.current = true;
      onSaveStart?.();
      console.log('Auto-saving characters after inline edit...');
      await saveGameData('Characters', characters);
      console.log('Auto-save successful');
      onSaveSuccess?.();
    } catch (error) {
      console.error('Auto-save failed:', error);
      onSaveError?.(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      isSavingRef.current = false;
    }
  }, [onSaveStart, onSaveSuccess, onSaveError]);

  const triggerAutoSave = useCallback((characters: Character[]) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout to save after debounce period
    saveTimeoutRef.current = window.setTimeout(() => {
      saveCharacters(characters);
    }, debounceMs);

    console.log(`Auto-save scheduled in ${debounceMs}ms...`);
  }, [saveCharacters, debounceMs]);

  // Cancel any pending save (useful for cleanup)
  const cancelAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      console.log('Auto-save cancelled');
    }
  }, []);

  return {
    triggerAutoSave,
    cancelAutoSave,
    isSaving: isSavingRef.current
  };
}