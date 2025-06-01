import React, { useCallback } from 'react';
import type { Character } from '../../types/Character';
import { IconButton } from '../common/IconButton';
import { useCharacters } from '../../contexts/CharacterContext';

interface CharacterRowProps
{
  character: Character;
}

// Wrap the component with React.memo to prevent unnecessary re-renders
// This component will only re-render if its props (character) change
export const CharacterRow = React.memo<CharacterRowProps>(({ character }) =>
{
  const { healCharacter, updateCharacterHp, updateCharacterAp, setEditingCharacter, deleteCharacter } = useCharacters();

  // Memoize event handlers to prevent recreating functions on every render
  const handleHpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
  {
    updateCharacterHp(character.id, parseInt(e.target.value, 10));
  }, [character.id, updateCharacterHp]);

  const handleApChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
  {
    updateCharacterAp(character.id, parseInt(e.target.value, 10));
  }, [character.id, updateCharacterAp]);

  const handleHeal = useCallback(() =>
  {
    healCharacter(character.id);
  }, [character.id, healCharacter]);

  const handleEdit = useCallback(() =>
  {
    setEditingCharacter(character);
  }, [character, setEditingCharacter]);

  const handleDelete = useCallback(() =>
  {
    deleteCharacter(character.id);
  }, [character.id, deleteCharacter]);

  console.log(`Rendering CharacterRow for ${character.name}`); // Debug log

  return (
    <li className="character-row">
      <span className="character-col name">{character.name}</span>
      <span className="character-col hp">
        <IconButton
          icon="button_heal"
          alt="Restore HP"
          onClick={handleHeal}
        />
        <input
          className="fraction-input"
          type="number"
          value={character.currentHp}
          onChange={handleHpChange}
          style={{ width: '2rem' }}
        />{' '}
        / {character.totalHp}
      </span>
      <span className="character-col hp">
        <input
          type="number"
          value={character.ap}
          onChange={handleApChange}
          min={0}
          style={{ width: '2rem' }}
        />
      </span>
      <span className="character-col tags">{character.tags.join(', ')}</span>
      <span className="character-col buttons">
        <IconButton
          icon="button_edit"
          alt="Edit"
          onClick={handleEdit}
        />
        <IconButton
          icon="button_delete"
          alt="Delete"
          onClick={handleDelete}
        />
      </span>
    </li>
  );
}); 