import { useEffect, useState } from 'react';
import { CharacterForm } from './components/character/CharacterForm';
import { CharacterSettingsForm } from './CharacterSettingsForm';
import { CharacterList } from './components/character/CharacterList';
import { useCharacters } from './contexts/CharacterContext';
import { useCharacterSettings } from './contexts/CharacterSettingsContext';
import { useUI } from './contexts/UIContext';
import { fetchGameData } from './services/gameDataService';

export function CharacterManager()
{
  const { editingCharacter, addCharacter, setEditingCharacter, setCharacters } = useCharacters();
  const { loadSettings } = useCharacterSettings();
  const { showSettingsForm, toggleSettingsForm } = useUI();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() =>
  {
    const loadData = async () =>
    {
      try
      {
        const data = await fetchGameData('Characters', 'CharacterSettings');
        if (data.Characters)
        {
          setCharacters(data.Characters);
        }
        if (data.CharacterSettings?.[0])
        {
          loadSettings(data.CharacterSettings[0]);
        }
        setError(null);
      } catch (err)
      {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while fetching game data'
        );
      } finally
      {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setCharacters, loadSettings]);

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
  } else
  {
    content = showSettingsForm ? (
      <CharacterSettingsForm onSubmit={() => toggleSettingsForm(false)} />
    ) : (
      <CharacterList />
    );
  }

  return <div className="top-left-heading">{content}</div>;
}
