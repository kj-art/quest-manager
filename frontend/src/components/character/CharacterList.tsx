import React, { useMemo } from 'react';
import type { Character } from '../../Character';
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
    const searchTermLower = searchTerm.toLowerCase();
    return characters.filter((char) =>
    {
      // Check if search term matches any part of the name
      const nameMatch =
        char.name.first.toLowerCase().includes(searchTermLower) ||
        (char.name.nick?.toLowerCase() || '').includes(searchTermLower) ||
        char.name.last.toLowerCase().includes(searchTermLower);

      // Check if search term matches any tags
      const inTags = Array.isArray(char.tags) &&
        char.tags.some(tag => tag.toLowerCase().includes(searchTermLower));

      return nameMatch || inTags;
    });
  }, [characters, searchTerm]);

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