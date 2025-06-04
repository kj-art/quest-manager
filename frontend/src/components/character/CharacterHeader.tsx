import React, { useCallback } from 'react';
import { IconButton } from '../common/IconButton';
import { useCharacters } from '../../contexts/CharacterContext';
import { useSettings } from '../../contexts/SettingsContext';
import './CharacterList.css';

// Wrap with React.memo since this component doesn't need to re-render
// when parent components change - only when context values change
export const CharacterHeader = React.memo(() =>
{
  const { healCharacter, setEditingCharacter } = useCharacters();
  const { toggleSettingsForm } = useSettings();

  // Memoize event handlers to maintain consistent references
  const handleHealAll = useCallback(() =>
  {
    // No id means heal all characters
    healCharacter();
  }, [healCharacter]);

  const handleAddCharacter = useCallback(() =>
  {
    // null means create new character
    setEditingCharacter(null);
  }, [setEditingCharacter]);

  const handleOpenSettings = useCallback(() =>
  {
    toggleSettingsForm(true);
  }, [toggleSettingsForm]);

  return (
    <li className="character-row character-header">
      <span className="character-col name">
        <strong>Character</strong>
      </span>
      <span className="character-col hp">
        <IconButton
          icon="button_heal"
          alt="Restore HP"
          onClick={handleHealAll}
        />
        <strong>Health</strong>
      </span>
      <span className="character-col hp">
        <strong>Ability Points</strong>
      </span>
      <span className="character-col tags">
        <strong>Tags</strong>
      </span>
      <span className="character-col buttons">
        <IconButton
          icon="button_add"
          alt="Add Character"
          onClick={handleAddCharacter}
        />
        <IconButton
          icon="button_settings"
          alt="Settings"
          onClick={handleOpenSettings}
        />
      </span>
    </li>
  );
}); 