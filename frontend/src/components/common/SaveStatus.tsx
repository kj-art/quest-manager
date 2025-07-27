import React, { useEffect, useState, useRef } from 'react';
import { useCharacters } from '../../contexts/CharacterContext';

export const SaveStatus: React.FC = () =>
{
  const { isSavingInline, saveError } = useCharacters();
  const [showSaved, setShowSaved] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const wasSavingRef = useRef(false);

  useEffect(() =>
  {
    let fadeTimer: number;
    let hideTimer: number;

    // Track if we were previously saving
    if (isSavingInline)
    {
      wasSavingRef.current = true;
    }

    // Only show "saved" if we just finished saving (transition from saving to not saving)
    if (wasSavingRef.current && !isSavingInline && !saveError)
    {
      // Show the saved message
      setShowSaved(true);
      setFadeOut(false);
      wasSavingRef.current = false; // Reset the flag

      // Start fade out after 2 seconds
      fadeTimer = window.setTimeout(() =>
      {
        setFadeOut(true);
      }, 2000);

      // Hide completely after fade animation (3 seconds total)
      hideTimer = window.setTimeout(() =>
      {
        setShowSaved(false);
        setFadeOut(false);
      }, 3000);
    }

    return () =>
    {
      if (fadeTimer) window.clearTimeout(fadeTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [isSavingInline, saveError]);

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

  if (showSaved)
  {
    return (
      <div className={`save-status saved ${fadeOut ? 'fade-out' : ''}`}>
        <span>✅ Auto-saved</span>
      </div>
    );
  }

  return null; // Don't show anything when not saving/saved
};