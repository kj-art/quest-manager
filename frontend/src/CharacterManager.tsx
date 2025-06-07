import { useEffect, useState } from 'react';
import { CharacterForm } from './components/character/CharacterForm';
import { CharacterSettingsForm } from './CharacterSettingsForm';
import { CharacterList } from './components/character/CharacterList';
import { useCharacters } from './contexts/CharacterContext';
import { useGameData } from './hooks/useGameData';
import { useUI } from './contexts/UIContext';

export function CharacterManager()
{
  const { editingCharacter, addCharacter, setEditingCharacter, setCharacters } = useCharacters();
  const { settings, setSettings, isLoading, error, characters } = useGameData();
  //const [showSettingsForm, setShowSettingsForm] = useState(false);
  const { showSettingsForm, toggleSettingsForm } = useUI();

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

  let content;
  if (editingCharacter)
  {
    content = (
      <CharacterForm
        character={editingCharacter}
        onSave={(char) =>
        {
          addCharacter(char);
          setEditingCharacter(null);
        }}
        onCancel={() => setEditingCharacter(null)}
      />
    );
  }
  else
  {
    content = showSettingsForm ? (
      <CharacterSettingsForm
        settings={settings}
        onChange={setSettings}
        onSubmit={() => toggleSettingsForm(false)}
      />
    ) : (
      <CharacterList />
    );
  }

  return (
    <div className="top-left-heading">
      {content}
    </div>
  );
}
