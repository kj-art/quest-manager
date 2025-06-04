import { useState, useEffect } from 'react';
import { CharacterForm } from './components/character/CharacterForm';
import { CharacterSettingsForm } from './CharacterSettingsForm';
import { CharacterList } from './components/character/CharacterList';
import { useCharacters } from './contexts/CharacterContext';
import { useGameData } from './hooks/useGameData';

export function CharacterManager()
{
  const { editingCharacter, setEditingCharacter, setCharacters } = useCharacters();
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const { settings, setSettings, isLoading, error, characters } = useGameData();

  // Sync characters from game data to character context
  useEffect(() =>
  {
    if (characters)
    {
      setCharacters(characters);
    }
  }, [characters, setCharacters]);

  if (isLoading)
  {
    return <div>Loading game data...</div>;
  }

  if (error)
  {
    return <div>Error loading game data: {error}</div>;
  }

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
