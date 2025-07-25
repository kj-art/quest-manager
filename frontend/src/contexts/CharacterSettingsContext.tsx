import React, { createContext, useContext, useReducer, useCallback } from 'react';

export interface CharacterSettings
{
  [key: string]: number;
}

interface CharacterSettingsState
{
  settings: CharacterSettings;
}

type CharacterSettingsAction =
  | { type: 'SET_ALL_SETTINGS'; payload: CharacterSettings }
  | { type: 'UPDATE_SETTING'; key: string; value: number };

const initialState: CharacterSettingsState = {
  settings: {},
};

function reducer(state: CharacterSettingsState, action: CharacterSettingsAction): CharacterSettingsState
{
  switch (action.type)
  {
    case 'SET_ALL_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.key]: action.value,
        },
      };
    default:
      return state;
  }
}

interface CharacterSettingsContextType extends CharacterSettingsState
{
  loadSettings: (newSettings: CharacterSettings) => void;
  updateSetting: (key: string, value: number) => void;
}

const CharacterSettingsContext = createContext<CharacterSettingsContextType | null>(null);

export const CharacterSettingsProvider = ({ children }: { children: React.ReactNode }) =>
{
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadSettings = useCallback((newSettings: CharacterSettings) =>
  {
    dispatch({ type: 'SET_ALL_SETTINGS', payload: newSettings });
  }, []);

  const updateSetting = useCallback((key: string, value: number) =>
  {
    dispatch({ type: 'UPDATE_SETTING', key, value });
  }, []);

  return (
    <CharacterSettingsContext.Provider value={{
      ...state,
      loadSettings,
      updateSetting
    }}>
      {children}
    </CharacterSettingsContext.Provider>
  );
};

export function useCharacterSettings()
{
  const context = useContext(CharacterSettingsContext);
  if (!context)
  {
    throw new Error('useCharacterSettings must be used within a CharacterSettingsProvider');
  }
  return context;
}