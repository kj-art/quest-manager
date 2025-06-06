import React from 'react';
import type { CharacterSettings } from './Character';
import { FormField } from './components/FormField';
//import { useCharacterSettings } from './useCharacterSettings';

/*

settings button isn't working

add character button isn't working

*/


interface CharacterSettingsFormProps
{
  settings: CharacterSettings;
  onChange: (settings: CharacterSettings) => void;
  onSubmit: () => void;
}

export function CharacterSettingsForm({ settings, onChange, onSubmit }: CharacterSettingsFormProps)
{
  function handleChange(field: keyof CharacterSettings, value: number)
  {
    onChange({ ...settings, [field]: value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>)
  {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Settings</h2>
      <ul>
        <FormField
          label="Total Stat Points:"
          type="number"
          cssClass="character-list-item"
          value={settings.statTotal}
          onChange={e => handleChange("statTotal", Number(e.target.value))}
          min={0}
        />
      </ul>
      <ul>
        <FormField
          label="Ability Upgrade Max:"
          type="number"
          cssClass="character-list-item"
          value={settings.abilityUpgradeMax}
          onChange={e => handleChange("abilityUpgradeMax", Number(e.target.value))}
          min={0}
        />
      </ul>
      <ul>
        <FormField
          label="Stat Upgrade Max:"
          type="number"
          cssClass="character-list-item"
          value={settings.statUpgradeMax}
          onChange={e => handleChange("statUpgradeMax", Number(e.target.value))}
          min={0}
        />
      </ul>
      <div style={{ marginTop: '1em' }}>
        <button type="submit">Back</button>
      </div>
    </form>

  );
}
