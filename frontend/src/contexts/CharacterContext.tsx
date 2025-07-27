import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { Character } from '@src/Character';
import { useAutoSaveInline } from '../hooks/useAutoSaveInline';

interface CharacterState
{
  characters: Character[];
  editingCharacter: Character | null;
  searchTerm: string;
  isSavingInline: boolean;
  saveError: string | null;
}

type CharacterAction =
  | { type: 'SET_CHARACTERS'; payload: Character[] | ((prev: Character[]) => Character[]) }
  | { type: 'ADD_CHARACTER'; payload: Character }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'DELETE_CHARACTER'; payload: string }
  | { type: 'SET_EDITING'; payload: Character | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'UPDATE_CHARACTER_HP'; payload: { id: string; hp: number } }
  | { type: 'UPDATE_CHARACTER_HP_MAX'; payload: { id: string; hp: number } }
  | { type: 'UPDATE_CHARACTER_AP'; payload: { id: string; ap: number } }
  | { type: 'HEAL_CHARACTER'; payload?: string }
  | { type: 'SET_SAVING_INLINE'; payload: boolean }
  | { type: 'SET_SAVE_ERROR'; payload: string | null };

const initialState: CharacterState = {
  characters: [],
  editingCharacter: null,
  searchTerm: '',
  isSavingInline: false,
  saveError: null,
};

function characterReducer(state: CharacterState, action: CharacterAction): CharacterState
{
  console.log('CharacterReducer:', { action, currentState: state });

  switch (action.type)
  {
    case 'SET_CHARACTERS':
      const newCharacters = typeof action.payload === 'function'
        ? action.payload(state.characters)
        : action.payload;
      console.log('Setting characters:', newCharacters);
      return {
        ...state,
        characters: newCharacters,
      };

    case 'ADD_CHARACTER':
      return {
        ...state,
        characters: [...state.characters, action.payload],
      };

    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.payload.id ? action.payload : char
        ),
      };

    case 'DELETE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(char => char.id !== action.payload),
      };

    case 'SET_EDITING':
      return { ...state, editingCharacter: action.payload };

    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };

    case 'UPDATE_CHARACTER_HP':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.payload.id
            ? { ...char, currentHp: Math.max(0, Math.min(action.payload.hp, char.totalHp)) }
            : char
        ),
      };

    case 'UPDATE_CHARACTER_HP_MAX':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.payload.id
            ? { ...char, totalHp: action.payload.hp, currentHp: char.currentHp === char.totalHp ? action.payload.hp : char.currentHp }
            : char
        ),
      };

    case 'UPDATE_CHARACTER_AP':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.payload.id
            ? { ...char, ap: Math.max(0, action.payload.ap) }
            : char
        ),
      };

    case 'HEAL_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(char =>
          action.payload === undefined || char.id === action.payload
            ? { ...char, currentHp: char.totalHp }
            : char
        ),
      };

    case 'SET_SAVING_INLINE':
      return { ...state, isSavingInline: action.payload };

    case 'SET_SAVE_ERROR':
      return { ...state, saveError: action.payload };

    default:
      return state;
  }
}

interface CharacterContextType extends CharacterState
{
  setCharacters: (characters: Character[] | ((prev: Character[]) => Character[])) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  setEditingCharacter: (character: Character | null) => void;
  setSearchTerm: (term: string) => void;
  updateCharacterHp: (id: string, hp: number) => void;
  updateCharacterAp: (id: string, ap: number) => void;
  healCharacter: (id?: string) => void;
}

const CharacterContext = createContext<CharacterContextType | null>(null);

function CharacterProviderComponent({ children }: { children: React.ReactNode })
{
  const [state, dispatch] = useReducer(characterReducer, initialState);

  // Auto-save hook for inline edits only
  const { triggerAutoSave } = useAutoSaveInline({
    debounceMs: 2000, // Wait 2 seconds after last change
    onSaveStart: () => dispatch({ type: 'SET_SAVING_INLINE', payload: true }),
    onSaveSuccess: () =>
    {
      dispatch({ type: 'SET_SAVING_INLINE', payload: false });
      dispatch({ type: 'SET_SAVE_ERROR', payload: null });
    },
    onSaveError: (error) =>
    {
      dispatch({ type: 'SET_SAVING_INLINE', payload: false });
      dispatch({ type: 'SET_SAVE_ERROR', payload: error.message });
    }
  });

  // Track which changes should trigger auto-save
  const lastAutoSaveRef = useRef<string>('');
  const hasInitiallyLoadedRef = useRef(false);

  useEffect(() =>
  {
    const currentCharactersStr = JSON.stringify(state.characters);

    // Mark as initially loaded when we first get data from the server
    if (!hasInitiallyLoadedRef.current && state.characters.length > 0)
    {
      console.log('Initial data load detected, setting baseline for auto-save...');
      hasInitiallyLoadedRef.current = true;
      lastAutoSaveRef.current = currentCharactersStr;
      return;
    }

    // Only auto-save if:
    // 1. We've initially loaded data
    // 2. Characters actually changed 
    // 3. We're not in form editing mode
    // 4. We have characters to save
    const charactersChanged = lastAutoSaveRef.current !== currentCharactersStr;

    if (hasInitiallyLoadedRef.current &&
      charactersChanged &&
      !state.editingCharacter &&
      state.characters.length > 0)
    {
      console.log('Characters changed via inline edit, triggering auto-save...');
      triggerAutoSave(state.characters);
      lastAutoSaveRef.current = currentCharactersStr;
    }
  }, [state.characters, state.editingCharacter, triggerAutoSave]);

  const setCharacters = useCallback((characters: Character[] | ((prev: Character[]) => Character[])) =>
  {
    console.log('Setting characters with:', characters);
    dispatch({ type: 'SET_CHARACTERS', payload: characters });
  }, []);

  const addCharacter = useCallback((character: Character) =>
  {
    dispatch({ type: 'ADD_CHARACTER', payload: character });
  }, []);

  const updateCharacter = useCallback((character: Character) =>
  {
    dispatch({ type: 'UPDATE_CHARACTER', payload: character });
  }, []);

  const deleteCharacter = useCallback((id: string) =>
  {
    dispatch({ type: 'DELETE_CHARACTER', payload: id });
  }, []);

  const setEditingCharacter = useCallback((character: Character | null) =>
  {
    dispatch({ type: 'SET_EDITING', payload: character });
  }, []);

  const setSearchTerm = useCallback((term: string) =>
  {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const updateCharacterHp = useCallback((id: string, hp: number) =>
  {
    dispatch({ type: 'UPDATE_CHARACTER_HP', payload: { id, hp } });
  }, []);

  const updateCharacterAp = useCallback((id: string, ap: number) =>
  {
    dispatch({ type: 'UPDATE_CHARACTER_AP', payload: { id, ap } });
  }, []);

  const healCharacter = useCallback((id?: string) =>
  {
    dispatch({ type: 'HEAL_CHARACTER', payload: id });
  }, []);

  const value = {
    ...state,
    setCharacters,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    setEditingCharacter,
    setSearchTerm,
    updateCharacterHp,
    updateCharacterAp,
    healCharacter,
  };

  console.log('CharacterProvider state:', state);

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacters()
{
  const context = useContext(CharacterContext);
  if (!context)
  {
    throw new Error('useCharacters must be used within a CharacterProvider');
  }
  return context;
}

export const CharacterProvider = CharacterProviderComponent;