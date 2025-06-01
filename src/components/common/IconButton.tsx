import React from 'react';
import { getIcon } from '../../CharacterManager';
import '/src/components/common/IconButton.css';

interface IconButtonProps
{
  /**
   * The name of the icon file (without .png extension)
   */
  icon: string;

  /**
   * Alt text for accessibility
   */
  alt: string;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Optional className for additional styling
   */
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  alt,
  onClick,
  className = ''
}) =>
{
  const iconUrl = getIcon(icon);

  if (!iconUrl)
  {
    console.warn(`Icon not found: ${icon}`);
    return null;
  }

  return (
    <button
      className={`icon-button ${className}`.trim()}
      onClick={onClick}
      type="button"
    >
      <img src={iconUrl} alt={alt} />
    </button>
  );
}; 