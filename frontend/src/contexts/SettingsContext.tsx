import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { CharacterSettings } from '../Character';
import { setAbilityUpgradeMax, setStatUpgradeMax, setTotalStatPoints } from '../utils/characterUtils';


// make settings similar to character
// why are there two initial states for settings? here and useGameData?



interface SettingsState
{
  settings: CharacterSettings;
  showSettingsForm: boolean;
}

type SettingsAction =
  | { type: 'UPDATE_SETTINGS'; payload: CharacterSettings }
  | { type: 'TOGGLE_SETTINGS_FORM'; payload: boolean };

const initialState: SettingsState = {
  settings: {
    statTotal: 0,
    abilityUpgradeMax: 0,
    statUpgradeMax: 0,
    defaultHp: 0,
    defaultAttack: 0
  },
  showSettingsForm: false,
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState
{
  switch (action.type)
  {
    case 'UPDATE_SETTINGS':
      // Update the utility functions when settings change
      setTotalStatPoints(action.payload.statTotal);
      setAbilityUpgradeMax(action.payload.abilityUpgradeMax);
      setStatUpgradeMax(action.payload.statUpgradeMax);
      return { ...state, settings: action.payload };

    case 'TOGGLE_SETTINGS_FORM':
      return { ...state, showSettingsForm: action.payload };

    default:
      return state;
  }
}

interface SettingsContextType extends SettingsState
{
  updateSettings: (settings: CharacterSettings) => void;
  toggleSettingsForm: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

// Named function component for better debugging and Fast Refresh compatibility
function SettingsProviderComponent({ children }: { children: React.ReactNode })
{
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  const updateSettings = useCallback((settings: CharacterSettings) =>
  {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const toggleSettingsForm = useCallback((show: boolean) =>
  {
    dispatch({ type: 'TOGGLE_SETTINGS_FORM', payload: show });
  }, []);

  const value = {
    ...state,
    updateSettings,
    toggleSettingsForm,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Named function declaration for better Fast Refresh compatibility
export function useSettings()
{
  const context = useContext(SettingsContext);
  if (!context)
  {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Separate export for better Fast Refresh compatibility
export const SettingsProvider = SettingsProviderComponent; 