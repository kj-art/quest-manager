import React from 'react';
import { useCharacters } from '../../contexts/CharacterContext';

export const SaveStatus: React.FC = () =>
{
  const { isSavingInline, saveError } = useCharacters();

  if (saveError)
  {
    return (
      <div className="save-status error">
        <span>❌ Auto-save failed: {saveError}</span>
      </div>
    );
  }

  if (isSavingInline)
  {
    return (
      <div className="save-status saving">
        <span>💾 Auto-saving...</span>
      </div>
    );
  }

  return (
    <div className="save-status saved">
      <span>✅ Auto-saved</span>
    </div>
  );
};