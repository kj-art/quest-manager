import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CharacterForm, createDefaultCharacter } from './CharacterForm';
import { CharacterSettingsForm } from './CharacterSettingsForm';
import type { Character, CharacterSettings } from './Character';
import { setAbilityUpgradeMax, setStatUpgradeMax, setTotalStatPoints } from './Character';
import { FormField } from './components/FormField'
// src/iconLoader.ts

const icons = import.meta.glob('../src/assets/*.png', { eager: true });

const iconMap: Record<string, string> = {};

for (const path in icons)
{
  const fileName = path.split('/').pop()?.split('.')[0];
  if (fileName && typeof icons[path] === 'object' && 'default' in icons[path])
  {
    iconMap[fileName] = (icons[path] as any).default;
  }
}

export function getIcon(name: string): string | undefined
{
  return iconMap[name];
}

export function CharacterManager()
{
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [settings, setSettings] = useState<CharacterSettings>({
    statTotal: 4,
    abilityUpgradeMax: 7,
    statUpgradeMax: 7,
  });
  const [searchTerm, setSearchTerm] = useState('');

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
        setCharacters(data.characters);
        setSettings(prevSettings => ({
          ...prevSettings,
          statTotal: data.statTotal,
          abilityUpgradeMax: data.abilityUpgradeMax,
          statUpgradeMax: data.statUpgradeMax
        }));

      })
      .catch((err) => console.error('Failed to load characters:', err));
  }, []);

  function handleSaveCharacter(character: Character)
  {
    if (character.id === '' || character.id == null)
    {
      const newCharacter = { ...character, id: uuidv4() };
      setCharacters((prev) => [...prev, newCharacter]);
    }
    else
    {
      setCharacters((prev) =>
        prev.map((c) => (c.id === character.id ? character : c))
      );
    }
    setEditingCharacter(null);
  }

  function handleEdit(id: string | number)
  {
    const char = characters.find((c) => c.id === id);
    if (char) setEditingCharacter(char);
  }

  function handleDelete(id: string | number)
  {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCharacterHp(id: string | number, newHp: number)
  {
    setCharacters(prev =>
      prev.map(char =>
        char.id === id
          ? {
            ...char,
            currentHp: Math.max(0, Math.min(newHp, char.totalHp)),
          }
          : char
      )
    );
  }

  function handleHeal(id?: string | number)
  {
    if (id === undefined)
    {
      // Heal all characters
      setCharacters(prev =>
        prev.map(char => ({
          ...char,
          currentHp: char.totalHp
        }))
      );
    }
    else
    {
      const char = characters.find(c => c.id === id);
      if (char)
      {
        updateCharacterHp(id, char.totalHp);
      }
    }
  }

  function handleHpChange(id: string | number, value: number)
  {
    updateCharacterHp(id, isNaN(value) ? 0 : value);
  }

  function handleApChange(id: string | number, value: number)
  {
    setCharacters(prev =>
      prev.map(char =>
        char.id === id
          ? {
            ...char,
            ap: Math.max(0, value),
          }
          : char
      )
    );
  }

  return (
    <div className="top-left-heading">
      {!editingCharacter && !showSettingsForm && (
        <>
          <div className="form-field with-button">
            <FormField
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search characters..."
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')}>Clear</button>
            )}
          </div>
          <ul>
            <li className="character-row character-header">
              <span className="character-col name"><strong>Character</strong></span>
              <span className="character-col hp"><button className="icon-button" onClick={() => handleHeal()}>
                <img src={getIcon("button_heal")} alt="Restore HP" />
              </button><strong>Health</strong></span>
              <span className="character-col hp"><strong>Ability Points</strong></span>
              <span className="character-col tags"><strong>Tags</strong></span>
              <span className="character-col buttons"><button className="icon-button" onClick={() => setEditingCharacter(createDefaultCharacter())}>
                <img src={getIcon("button_add")} alt="Add Character" />
              </button>
                <button className="icon-button" onClick={() => setShowSettingsForm(prev => !prev)}>
                  <img src={getIcon("button_settings")} alt="Settings" />
                </button></span>
            </li>
            {characters.filter((char) =>
            {
              console.log('Name:', char.name, 'Tags:', char.tags);
              const inName = char.name.toLowerCase().includes(searchTerm.toLowerCase());
              const inTags = Array.isArray(char.tags) &&
                char.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
              console.log('→', inName, inTags);
              return inName || inTags;
            })
              .map((char) => (
                <li key={char.id} className="character-row">
                  <span className="character-col name">{char.name}</span>
                  <span className="character-col hp">
                    <button className="icon-button" onClick={() => handleHeal(char.id)}>
                      <img src={getIcon("button_heal")} alt="Restore HP" />
                    </button>
                    <input className='fraction-input'
                      type="number"
                      value={char.currentHp}
                      onChange={(e) => handleHpChange(char.id, parseInt(e.target.value, 10))}
                      style={{ width: '2rem' }}
                    /> / {char.totalHp}
                  </span>
                  <span className="character-col hp"><input
                    type="number"
                    value={char.ap}
                    onChange={(e) => handleApChange(char.id, parseInt(e.target.value, 10))}
                    min={0}
                    style={{ width: '2rem' }}
                  /></span>
                  <span className="character-col tags">{char.tags.join(', ')}</span>
                  <span className="character-col buttons">
                    <button className="icon-button" onClick={() => handleEdit(char.id)}>
                      <img src={getIcon("button_edit")} alt="Edit" />
                    </button>
                    <button className="icon-button" onClick={() => handleDelete(char.id)}>
                      <img src={getIcon("button_delete")} alt="Delete" />
                    </button>

                  </span>
                </li>
              ))}
          </ul>

        </>
      )}

      {editingCharacter && (
        <CharacterForm
          character={editingCharacter}
          onSave={handleSaveCharacter}
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
