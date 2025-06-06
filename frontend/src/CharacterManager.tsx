import { useEffect } from 'react';
import { CharacterForm } from './components/character/CharacterForm';
import { CharacterSettingsForm } from './CharacterSettingsForm';
import { CharacterList } from './components/character/CharacterList';
import { useCharacters } from './contexts/CharacterContext';
import { useGameData } from './hooks/useGameData';
import { useSettings } from './contexts/SettingsContext';

export function CharacterManager()
{
  const { editingCharacter, addCharacter, setEditingCharacter, setCharacters } = useCharacters();
  const { showSettingsForm, toggleSettingsForm } = useSettings();
  const { settings, setSettings, isLoading, error, characters } = useGameData();

  // Sync characters from game data to character context
  useEffect(() =>
  {
    if (characters)
    {
      setCharacters(characters);
      //setEditingCharacter(null);
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
  console.log(`editing character: ${editingCharacter}`);
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
    if (showSettingsForm)
    {
      content = (
        <CharacterSettingsForm
          settings={settings}
          onChange={setSettings}
          onSubmit={() => toggleSettingsForm(false)}
        />
      );
    }
    else
      content = <CharacterList />;
  }

  return (
    <div className="top-left-heading">
      {content}
    </div>
  );

}
