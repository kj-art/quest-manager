/*


I don't think total hp is getting updated, since it uses the same function as updating current hp.
Fix this, and then make the linked logic in FractionField work with it.





*/









import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Dispatch } from 'react';
import type { Character } from '../types/Character';
import { v4 as uuidv4 } from 'uuid';

interface CharacterState
{
  characters: Character[];
  editingCharacter: Character | null;
  searchTerm: string;
}

type CharacterAction =
  | { type: 'SET_CHARACTERS'; payload: Character[] | ((prev: Character[]) => Character[]) }
  | { type: 'ADD_CHARACTER'; payload: Omit<Character, 'id'> }
  | { type: 'UPDATE_CHARACTER'; payload: Character }
  | { type: 'DELETE_CHARACTER'; payload: string }
  | { type: 'SET_EDITING'; payload: Character | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'UPDATE_CHARACTER_HP'; payload: { id: string; hp: number } }
  | { type: 'UPDATE_CHARACTER_HP_MAX'; payload: { id: string; hp: number } }
  | { type: 'UPDATE_CHARACTER_AP'; payload: { id: string; ap: number } }
  | { type: 'HEAL_CHARACTER'; payload?: string }; // undefined means heal all

const initialState: CharacterState = {
  characters: [],
  editingCharacter: null,
  searchTerm: '',
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
        characters: [...state.characters, { ...action.payload, id: uuidv4() }],
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

    default:
      return state;
  }
}

interface CharacterContextType extends CharacterState
{
  setCharacters: (characters: Character[] | ((prev: Character[]) => Character[])) => void;
  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (character: Character) => void;
  deleteCharacter: (id: string) => void;
  setEditingCharacter: (character: Character | null) => void;
  setSearchTerm: (term: string) => void;
  updateCharacterHp: (id: string, hp: number) => void;
  updateCharacterHpMax: (id: string, hp: number) => void;
  updateCharacterAp: (id: string, ap: number) => void;
  healCharacter: (id?: string) => void;
}

const CharacterContext = createContext<CharacterContextType | null>(null);

// Named function component for better debugging and Fast Refresh compatibility
function CharacterProviderComponent({ children }: { children: React.ReactNode })
{
  const [state, dispatch] = useReducer(characterReducer, initialState);

  const setCharacters = useCallback((characters: Character[] | ((prev: Character[]) => Character[])) =>
  {
    console.log('Setting characters with:', characters);
    dispatch({ type: 'SET_CHARACTERS', payload: characters });
  }, []);

  const addCharacter = useCallback((character: Omit<Character, 'id'>) =>
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

  const updateCharacterHpMax = useCallback((id: string, hp: number) =>
  {
    dispatch({ type: 'UPDATE_CHARACTER_HP_MAX', payload: { id, hp } });
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
    updateCharacterHpMax,
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

// Named function declaration for better Fast Refresh compatibility
export function useCharacters()
{
  const context = useContext(CharacterContext);
  if (!context)
  {
    throw new Error('useCharacters must be used within a CharacterProvider');
  }
  return context;
}

// Separate export for better Fast Refresh compatibility
export const CharacterProvider = CharacterProviderComponent; 