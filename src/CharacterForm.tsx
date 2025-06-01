import React, { useState, useEffect } from 'react';
import type { Character, Stats, CharacterType } from './Character';
import { STAT_NAMES, getTotalStatPoints, getAbilityUpgradeMax, getStatUpgradeMax, CHARACTER_TYPES } from './Character';
import { FormField } from './components/FormField';
import { FractionField } from './components/FractionField';

function defaultStats(): Stats
{
  const stats = {} as Stats;
  STAT_NAMES.forEach(stat =>
  {
    stats[stat] = 0;
  });

  return stats;
}

// Default empty character to create new ones
export function createDefaultCharacter(): Character
{
  const chr = {
    id: '',
    name: '',
    type: 'NPC',
    age: 0,
    homePlanet: '',
    currentHp: 0,
    totalHp: 0,
    ap: 0,
    attack: 0,
    stats: defaultStats(),
    backstory: '',
    abilityUpgradePoints: 0,
    statUpgradePoints: 0,
    tags: [],
  } as Character;
  return chr
}

interface Errors
{
  [key: string]: string | null;
}

interface CharacterFormProps
{
  character: Character | null;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

export function CharacterForm({ character, onSave, onCancel }: CharacterFormProps)
{
  let defaultCharacter = createDefaultCharacter();
  const [formCharacter, setFormCharacter] = useState<Character>(defaultCharacter);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  // When character prop changes (edit or new), reset local form state
  useEffect(() =>
  {
    if (character)
    {
      setFormCharacter(character);
    } else
    {
      setFormCharacter(defaultCharacter);
    }
    setTagInput('');
  }, [character]);

  // Validation function to update errors
  function validate(character: Character)
  {
    const newErrors: Errors = {};

    if (!character.name.trim())
    {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return newErrors;
  }

  // Call validate on every change
  useEffect(() =>
  {
    validate(formCharacter);
  }, [formCharacter]);

  function handleChange<K extends keyof Character>(key: K, value: Character[K])
  {
    setFormCharacter(prev => ({ ...prev, [key]: value }));
  }

  function handleTotalHPChange(value: number)
  {
    setFormCharacter(prev =>
    {
      const shouldSyncHp = prev.currentHp === prev.totalHp;
      return {
        ...prev,
        totalHp: value,
        currentHp: shouldSyncHp ? value : prev.currentHp,
      };
    });
  }

  // For nested stats
  function handleStatChange<K extends keyof Character['stats']>(key: K, value: number)
  {
    setFormCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [key]: value,
      },
    }));
  }

  function addTag()
  {
    const newTag = tagInput.trim();
    if (newTag && !formCharacter.tags.includes(newTag))
    {
      setFormCharacter(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setTagInput('');
    }
  }

  function removeTag(tagToRemove: string)
  {
    setFormCharacter(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove),
    }));
  }

  function handleSubmit(e: React.FormEvent)
  {
    e.preventDefault();

    // First validate all fields
    const validationErrors = validate(formCharacter);

    if (Object.keys(validationErrors).length > 0)
    {
      // There are errors — don't proceed
      return;
    }

    // Now check the stats total:
    const statsSum = Object.values(formCharacter.stats).reduce((a, b) => a + b, 0);
    const expectedTotal = getTotalStatPoints();

    if (statsSum !== expectedTotal)
    {
      const confirmed = window.confirm(`The total stat points (${statsSum}) do not equal the expected total (${expectedTotal}). Are you sure you want to proceed?`);
      if (!confirmed)
      {
        return; // User cancelled — do not submit
      }
    }

    // Proceed with submitting the form (e.g., saving character)
    onSave(formCharacter);
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Name:"
        type="text"
        value={formCharacter.name}
        onChange={e => handleChange('name', e.target.value)}
        required
      />

      <FormField
        label="Type"
        as="select"
        value={formCharacter.type}
        onChange={e => handleChange('type', e.target.value as CharacterType)}
      >
        {CHARACTER_TYPES.map(type => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </FormField>


      <FractionField
        label="Current/Total HP:"
        idStart="current-hp"
        startValue={formCharacter.currentHp}
        onStartChange={val => handleChange('currentHp', val)}
        idEnd="total-hp"
        endValue={formCharacter.totalHp}
        onEndChange={val => handleTotalHPChange(val)}
        min={0}
      />

      <FormField
        label="AP:"
        type="number"
        value={formCharacter.ap}
        min={0}
        onChange={e => handleChange('ap', Number(e.target.value))}
      />

      <FormField
        label="Attack:"
        type="number"
        value={formCharacter.attack}
        min={0}
        onChange={e => handleChange('attack', Number(e.target.value))}
      />

      {formCharacter.type === 'player' && (
        <>
          <FormField
            label="Ability Upgrade Points:"
            type="number"
            value={formCharacter.abilityUpgradePoints}
            min={0}
            max={getAbilityUpgradeMax()}
            onChange={e => handleChange('abilityUpgradePoints', Number(e.target.value))}
          />

          <FormField
            label="Stat Upgrade Points:"
            type="number"
            value={formCharacter.statUpgradePoints}
            min={0}
            max={getStatUpgradeMax()}
            onChange={e => handleChange('statUpgradePoints', Number(e.target.value))}
          />
        </>
      )}

      <fieldset>
        <legend>Stats</legend>
        {(
          Object.keys(formCharacter.stats) as (keyof Character['stats'])[]
        ).map(stat => (
          <FormField
            key={stat}
            label={`${stat.charAt(0).toUpperCase() + stat.slice(1)}:`}
            type="number"
            value={formCharacter.stats[stat]}
            onChange={e => handleStatChange(stat, Number(e.target.value))}
          />
        ))}
      </fieldset>

      <FormField
        label="Age:"
        type="number"
        value={formCharacter.age}
        min={0}
        onChange={e => handleChange('age', Number(e.target.value))}
      />

      <FormField
        label="Home Planet:"
        type="text"
        value={formCharacter.homePlanet}
        onChange={e => handleChange('homePlanet', e.target.value)}
      />

      <FormField
        label="Backstory:"
        as="textarea"
        value={formCharacter.backstory}
        onChange={e => handleChange('backstory', e.target.value)}
      />

      {/* Tags */}
      <div>
        <label htmlFor="tags">Tags:</label>
        <div>
          <input
            id="tags"
            type="text"
            value={tagInput}
            placeholder="Add a tag"
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e =>
            {
              if (e.key === 'Enter')
              {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <button type="button" onClick={addTag}>Add Tag</button>
        </div>
        <div style={{ marginTop: '0.5em' }}>
          {formCharacter.tags.map(tag => (
            <span
              key={tag}
              style={{
                display: 'inline-block',
                padding: '0.25em 0.5em',
                marginRight: '0.5em',
                backgroundColor: '#ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => removeTag(tag)}
              title="Click to remove tag"
            >
              {tag} ×
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1em' }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: '1em' }}>
          Cancel
        </button>
      </div>
    </form>

  );
}
