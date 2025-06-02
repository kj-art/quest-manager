import React from 'react';
import { Link } from 'react-router-dom';

interface ImageBannerProps
{
  slug: string;
  zIndex: number;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

// Utility to convert slug to display name
const formatDisplayName = (slug: string) =>
  slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export function ImageBanner({
  slug,
  zIndex,
  index,
  hoveredIndex,
  setHoveredIndex
}: ImageBannerProps)
{
  const [hovered, setHovered] = React.useState(false);
  const target = formatDisplayName(slug);
  const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

  return (
    <div
      className={`banner-wrapper ${isDimmed ? 'dimmed' : ''}`}
      style={{ position: 'relative', zIndex }}
    >
      <img
        className={`banner-image ${hovered ? 'hovered' : ''}`}
        src={`../src/assets/banner_${slug}.png`}
        alt={target}
      />
      <Link
        to={`/${slug}`}
        className="banner-button-link"
        onMouseEnter={() =>
        {
          setHovered(true);
          setHoveredIndex(index);
        }}
        onMouseLeave={() =>
        {
          setHovered(false);
          setHoveredIndex(null);
        }}
      >
        <img
          className="banner-button"
          src="../src/assets/button_banner.png"
          alt="Click to enter"
        />
      </Link>
      <span className="banner-text">{target}</span>
    </div>
  );
} 