import { useCharacterSettings } from './contexts/CharacterSettingsContext';
import type { CharacterSettings } from './Character'; // if needed
import { FormField } from './components/field/FormField';

interface CharacterSettingsFormProps
{
  onSubmit: () => void;
}

export function CharacterSettingsForm({ onSubmit }: CharacterSettingsFormProps)
{
  const { settings, updateSetting } = useCharacterSettings();

  function handleChange(field: keyof CharacterSettings, value: number)
  {
    updateSetting(field, value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>)
  {
    e.preventDefault();
    onSubmit();
  }

  const makeChangeHandler = (field: keyof CharacterSettings) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      handleChange(field, Number(e.target.value));


  return (
    <form onSubmit={handleSubmit}>
      <h2>Settings</h2>
      <ul>
        <FormField
          label="Total Stat Points:"
          type="number"
          cssClass="character-list-item"
          value={settings.statTotal}
          onChange={makeChangeHandler("statTotal")}
          min={0}
        />
      </ul>
      <ul>
        <FormField
          label="Ability Upgrade Max:"
          type="number"
          cssClass="character-list-item"
          value={settings.abilityUpgradeMax}
          onChange={makeChangeHandler("abilityUpgradeMax")}
          min={0}
        />
      </ul>
      <ul>
        <FormField
          label="Stat Upgrade Max:"
          type="number"
          cssClass="character-list-item"
          value={settings.statUpgradeMax}
          onChange={makeChangeHandler("statUpgradeMax")}
          min={0}
        />
      </ul>
      <div style={{ marginTop: '1em' }}>
        <button type="submit">Back</button>
      </div>
    </form>
  );
}
