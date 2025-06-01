import React, { useCallback } from 'react';
import { FormField } from '../FormField';
import { useCharacters } from '../../contexts/CharacterContext';

// Wrap with React.memo since this component only needs to re-render
// when searchTerm changes
export const CharacterSearch = React.memo(() =>
{
  const { searchTerm, setSearchTerm } = useCharacters();

  // Memoize event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
  {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  const handleClearSearch = useCallback(() =>
  {
    setSearchTerm('');
  }, [setSearchTerm]);

  console.log('Rendering CharacterSearch'); // Debug log

  return (
    <div className="form-field with-button">
      <FormField
        label="Search"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search characters..."
      />
      {searchTerm && (
        <button onClick={handleClearSearch}>Clear</button>
      )}
    </div>
  );
}); 