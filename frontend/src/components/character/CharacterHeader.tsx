import React, { useCallback, useEffect, useRef } from 'react';
import { IconButton } from '../common/IconButton';
import { useCharacters } from '../../contexts/CharacterContext';
import { createDefaultCharacter } from '../../utils/characterUtils';
import { useUI } from '../../contexts/UIContext';
import { saveGameData } from '../../services/gameDataService';
import './CharacterList.css';

// Wrap with React.memo since this component doesn't need to re-render
// when parent components change - only when context values change
export const CharacterHeader = React.memo(() =>
{
  const { characters, healCharacter, setEditingCharacter } = useCharacters();
  const { toggleSettingsForm } = useUI();

  // Memoize event handlers to maintain consistent references
  const handleHealAll = useCallback(() =>
  {
    // No id means heal all characters
    healCharacter();
  }, [healCharacter]);

  const justAddedRef = useRef(false);

  useEffect(() =>
  {
    if (justAddedRef.current)
    {
      justAddedRef.current = false;
      const newest = characters[characters.length - 1];
      setEditingCharacter(newest);
    }
  }, [characters]);

  const handleAddCharacter = () =>
  {
    const newChar = { ...createDefaultCharacter(), id: crypto.randomUUID() };
    setEditingCharacter(newChar);
  };

  const handleManualSave = async () =>
  {
    try
    {
      console.log('Manual save triggered for characters:', characters);
      await saveGameData('Characters', characters);
      console.log('Manual save successful!');
      alert('Characters saved successfully!');
    } catch (error)
    {
      console.error('Manual save failed:', error);
      alert(`Save failed: ${error}`);
    }
  };

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
        <button onClick={handleManualSave} style={{ marginRight: '0.5rem' }}>
          💾 Save
        </button>
        <IconButton
          icon="button_add"
          alt="Add Character"
          onClick={handleAddCharacter}
        />
        <IconButton
          icon="button_settings"
          alt="Settings"
          onClick={() => toggleSettingsForm()}
        />
      </span>
    </li>
  );
});