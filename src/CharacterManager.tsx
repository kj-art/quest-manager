import React, { useState, useEffect } from 'react';
import { CharacterForm, createDefaultCharacter } from './CharacterForm';
import { CharacterSettingsForm } from './CharacterSettingsForm';
import type { Character, CharacterSettings } from './Character';
import { setAbilityUpgradeMax, setStatUpgradeMax, setTotalStatPoints } from './Character';
import { CharacterList } from './components/character/CharacterList';
import { useCharacters } from './contexts/CharacterContext';

export function CharacterManager()
{
  const { setCharacters, editingCharacter, setEditingCharacter } = useCharacters();
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [settings, setSettings] = useState<CharacterSettings>({
    statTotal: 4,
    abilityUpgradeMax: 7,
    statUpgradeMax: 7,
  });

  useEffect(() =>
  {
    fetch('/src/characters.json')
      .then((response) =>
      {
        if (!response.ok)
        {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data =>
      {
        if (Array.isArray(data.characters))
        {
          setCharacters(data.characters);
        }
        else
        {
          console.error('Characters data is not an array:', data.characters);
          setCharacters([]);
        }

        setSettings(prevSettings => ({
          ...prevSettings,
          statTotal: data.statTotal ?? prevSettings.statTotal,
          abilityUpgradeMax: data.abilityUpgradeMax ?? prevSettings.abilityUpgradeMax,
          statUpgradeMax: data.statUpgradeMax ?? prevSettings.statUpgradeMax
        }));

        // Update the global settings
        setTotalStatPoints(data.statTotal ?? 4);
        setAbilityUpgradeMax(data.abilityUpgradeMax ?? 7);
        setStatUpgradeMax(data.statUpgradeMax ?? 7);
      })
      .catch((err) =>
      {
        console.error('Failed to load characters:', err);
        setCharacters([]);
      });
  }, [setCharacters]);

  return (
    <div className="top-left-heading">
      {!editingCharacter && !showSettingsForm && (
        <CharacterList />
      )}

      {editingCharacter && (
        <CharacterForm
          character={editingCharacter}
          onSave={() => setEditingCharacter(null)}
          onCancel={() => setEditingCharacter(null)}
        />
      )}
      {showSettingsForm && (
        <CharacterSettingsForm
          settings={settings}
          onChange={setSettings}
          onSubmit={() => setShowSettingsForm(false)}
        />
      )}
    </div>
  );
}
