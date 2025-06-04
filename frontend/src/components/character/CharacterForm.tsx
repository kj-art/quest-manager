import { useState, useEffect } from 'react';
import type { Character, CharacterType } from '../../types/Character';
import { CHARACTER_TYPES } from '../../types/Character';
import { FormField } from '../FormField';
import { FractionField } from '../FractionField';
import { getTotalStatPoints, getAbilityUpgradeMax, getStatUpgradeMax } from '../../Character';
import './CharacterForm.css';

interface CharacterFormProps
{
  character: Character | null;
  onSave: (character: Character) => void;
  onCancel: () => void;
}

type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
  ? `${K}.${NestedKeyOf<T[K]>}`
  : K
}[keyof T & (string | number)];

function createDefaultCharacter(): Omit<Character, 'id'>
{
  return {
    name: {
      first: '',
      nick: '',
      last: ''
    },
    type: 'NPC' as CharacterType,
    age: 0,
    homePlanet: '',
    currentHp: 10,
    totalHp: 10,
    ap: 0,
    attack: 0,
    stats: {
      strength: 0,
      speed: 0,
      sway: 0,
      sneak: 0,
      intelligence: 0,
      perception: 0
    },
    ship: {
      hp: 100,
      shields: 100,
      torpedoAmmo: 10,
      torpedoes: 25,
      stunAmmo: 10,
      stun: 15,
      targeting: 5,
      speed: 6,
      range: 4,
      firepower: 8
    },
    backstory: '',
    abilityUpgradePoints: 0,
    statUpgradePoints: 0,
    tags: []
  };
}

export function CharacterForm({ character, onSave, onCancel }: CharacterFormProps)
{
  const [formCharacter, setFormCharacter] = useState<Character>(() =>
  {
    if (character)
    {
      return { ...character };
    }
    return { ...createDefaultCharacter(), id: crypto.randomUUID() };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() =>
  {
    if (character)
    {
      setFormCharacter(character);
    }
  }, [character]);

  function getNestedReference(obj: any, path: string): { parent: any, key: string } | null
  {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++)
    {
      if (current == null || typeof current !== 'object') return null;
      current = current[keys[i]];
    }

    return {
      parent: current,
      key: keys[keys.length - 1]
    };
  }

  function setNestedValue(obj: any, path: string, value: any): void
  {
    const ref = getNestedReference(obj, path);
    if (ref && ref.parent && typeof ref.parent === 'object')
    {
      ref.parent[ref.key] = value;
    }
  }

  function getNestedValue(obj: any, path: string): any
  {
    const ref = getNestedReference(obj, path);
    if (!ref) return undefined;
    return ref.parent?.[ref.key];
  }

  function handleChange(path: NestedKeyOf<Character>, value: any)
  {
    setFormCharacter(prev =>
    {
      const newChar = { ...prev };
      setNestedValue(newChar, path, value);
      return newChar;
    });
  }

  /*
  with the current/total hp of the character, the current/total hp of the ship, or the current/total ammo types of the ship - if the current and the total are the same right before the user changes the max, I want the current value to match the new max.*/
  function handleEndChange(path1: NestedKeyOf<Character>, path2: NestedKeyOf<Character>, value: number)
  {
    setFormCharacter(prev =>
    {
      const newChar = { ...prev };
      const val1 = getNestedValue(prev, path1);
      const val2 = getNestedValue(prev, path2);

      if (val1 === val2)
      {
        setNestedValue(newChar, path2, value);
      }

      setNestedValue(newChar, path1, value);
      return newChar;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>)
  {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formCharacter.name.first.trim())
    {
      newErrors.name = 'First name is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0)
    {
      onSave(formCharacter);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Basic Info</h3>
        <div className="form-row">
          <FormField
            label="First Name:"
            type="text"
            value={formCharacter.name.first}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name.first', e.target.value)}
            required
          />
          <FormField
            label="Nickname:"
            type="text"
            value={formCharacter.name.nick || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name.nick', e.target.value)}
          />
          <FormField
            label="Last Name:"
            type="text"
            value={formCharacter.name.last}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name.last', e.target.value)}
          />
        </div>

        <div className="form-row">
          <FormField
            label="Type"
            as="select"
            value={formCharacter.type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('type', e.target.value as CharacterType)}
          >
            {CHARACTER_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </FormField>
        </div>
      </div>

      <div className="form-section">
        <h3>Combat</h3>
        <div className="form-row">
          <FractionField
            label="Current/Total HP:"
            idStart="current-hp"
            startValue={formCharacter.currentHp}
            onStartChange={val => handleChange('currentHp', val)}
            idEnd="total-hp"
            endValue={formCharacter.totalHp}
            onEndChange={val => handleEndChange('totalHp', 'currentHp', val)}
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
        </div>
      </div>

      <div className="form-section">
        <h3>Stat Block</h3>
        <div className="form-row">
          <FormField
            label="Strength:"
            type="number"
            value={formCharacter.stats.strength}
            onChange={e => handleChange('stats.strength', Number(e.target.value))}
          />
          <FormField
            label="Speed:"
            type="number"
            value={formCharacter.stats.speed}
            onChange={e => handleChange('stats.speed', Number(e.target.value))}
          />
          <FormField
            label="Sway:"
            type="number"
            value={formCharacter.stats.sway}
            onChange={e => handleChange('stats.sway', Number(e.target.value))}
          />
        </div>

        <div className="form-row">
          <FormField
            label="Sneak:"
            type="number"
            value={formCharacter.stats.sneak}
            onChange={e => handleChange('stats.sneak', Number(e.target.value))}
          />
          <FormField
            label="Intelligence:"
            type="number"
            value={formCharacter.stats.intelligence}
            onChange={e => handleChange('stats.intelligence', Number(e.target.value))}
          />
          <FormField
            label="Perception:"
            type="number"
            value={formCharacter.stats.perception}
            onChange={e => handleChange('stats.perception', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Ship</h3>
        <div className="ship-layout">
          <div className="ship-column ship-status">
            <h4>Current Status</h4>
            <FractionField
              label="Current/Max HP:"
              idStart="ship-hp"
              startValue={formCharacter.ship.hp}
              onStartChange={val => handleChange('ship.hp', val)}
              idEnd="ship-shields-display"
              endValue={formCharacter.ship.shields}
              onEndChange={() => { }} // Read-only
              endReadOnly={true}
              min={0}
              showConnectingLine={true}
            />
            <FractionField
              label="Torpedo Ammo/Max:"
              idStart="torpedo-ammo"
              startValue={formCharacter.ship.torpedoAmmo}
              onStartChange={val => handleChange('ship.torpedoAmmo', val)}
              idEnd="torpedo-max-display"
              endValue={formCharacter.ship.torpedoes}
              onEndChange={() => { }} // Read-only
              endReadOnly={true}
              min={0}
              showConnectingLine={true}
            />
            <FractionField
              label="Stun Ammo/Max:"
              idStart="stun-ammo"
              startValue={formCharacter.ship.stunAmmo}
              onStartChange={val => handleChange('ship.stunAmmo', val)}
              idEnd="stun-max-display"
              endValue={formCharacter.ship.stun}
              onEndChange={() => { }} // Read-only
              endReadOnly={true}
              min={0}
              showConnectingLine={true}
            />
          </div>

          <div className="ship-column ship-stats">
            <h4>Stats</h4>
            <div className="ship-stats-grid">
              <div className="ship-stats-col">
                <FormField
                  label="Shields:"
                  type="number"
                  value={formCharacter.ship.shields}
                  onChange={e => handleChange('ship.shields', Number(e.target.value))}
                  min={0}
                />
                <FormField
                  label="Torpedoes:"
                  type="number"
                  value={formCharacter.ship.torpedoes}
                  onChange={e => handleChange('ship.torpedoes', Number(e.target.value))}
                  min={0}
                />
                <FormField
                  label="Stun:"
                  type="number"
                  value={formCharacter.ship.stun}
                  onChange={e => handleChange('ship.stun', Number(e.target.value))}
                  min={0}
                />
                <FormField
                  label="Speed:"
                  type="number"
                  value={formCharacter.ship.speed}
                  onChange={e => handleChange('ship.speed', Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="ship-stats-col">
                <FormField
                  label="Range:"
                  type="number"
                  value={formCharacter.ship.range}
                  onChange={e => handleChange('ship.range', Number(e.target.value))}
                  min={0}
                />
                <FormField
                  label="Targeting:"
                  type="number"
                  value={formCharacter.ship.targeting}
                  onChange={e => handleChange('ship.targeting', Number(e.target.value))}
                  min={0}
                />
                <FormField
                  label="Firepower:"
                  type="number"
                  value={formCharacter.ship.firepower}
                  onChange={e => handleChange('ship.firepower', Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Upgrade Points</h3>
        <div className="form-row">
          <FormField
            label="Ability Upgrade Points:"
            type="number"
            value={formCharacter.abilityUpgradePoints}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('abilityUpgradePoints', Number(e.target.value))}
            min={0}
          />
          <FormField
            label="Stat Upgrade Points:"
            type="number"
            value={formCharacter.statUpgradePoints}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('statUpgradePoints', Number(e.target.value))}
            min={0}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Tags</h3>
        <FormField
          label="Tags (comma-separated):"
          type="text"
          value={formCharacter.tags.join(', ')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          {
            const newTags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            setFormCharacter(prev => ({
              ...prev,
              tags: newTags
            }));
          }}
        />
      </div>

      <div className="form-section">
        <h3>Character Background</h3>
        <div className="form-row">
          <FormField
            label="Age:"
            type="number"
            value={formCharacter.age}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('age', Number(e.target.value))}
            min={0}
          />
          <FormField
            label="Home Planet:"
            type="text"
            value={formCharacter.homePlanet}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('homePlanet', e.target.value)}
          />
        </div>
        <FormField
          label="Backstory:"
          as="textarea"
          value={formCharacter.backstory}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('backstory', e.target.value)}
        />
      </div>

      <div className="form-buttons">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
