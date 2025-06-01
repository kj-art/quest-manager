import React, { useMemo } from 'react';
import type { Character } from '../../types/Character';
import { CharacterHeader } from './CharacterHeader';
import { CharacterRow } from './CharacterRow';
import { CharacterSearch } from './CharacterSearch';
import { useCharacters } from '../../contexts/CharacterContext';
import './CharacterList.css';

export const CharacterList: React.FC = () =>
{
  const { characters, searchTerm } = useCharacters();

  // Using useMemo to cache the filtered list
  // This prevents recalculating the filtered list on every render
  // Only recalculates when characters or searchTerm change
  const filteredCharacters = useMemo(() =>
  {
    return characters.filter((char) =>
    {
      const inName = char.name.toLowerCase().includes(searchTerm.toLowerCase());
      const inTags = Array.isArray(char.tags) &&
        char.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return inName || inTags;
    });
  }, [characters, searchTerm]); // Dependencies array - only recompute when these values change

  return (
    <>
      <CharacterSearch />
      <ul>
        <CharacterHeader />
        {filteredCharacters.map((character) => (
          <CharacterRow
            key={character.id}
            character={character}
          />
        ))}
      </ul>
    </>
  );
}; 