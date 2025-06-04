import React from 'react';
import { ImageBanner } from './ImageBanner';
import './Splash.css';

interface PageInfo
{
  component: React.ComponentType;
  title: string;
}

interface SplashProps
{
  pages: Record<string, PageInfo>;
}

export function Splash({ pages }: SplashProps)
{
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div>
      <h1 className="title">Quest Manager</h1>
      <h1 className="subtitle">Tales of Verdana</h1>
      <div className="splash-container">
        <img src="../src/assets/splash_main.png" className="splash-main" />
        <div className="banner-list">
          {Object.keys(pages).map((slug, index) => (
            <ImageBanner
              key={slug}
              slug={slug}
              zIndex={index + 1}
              index={index}
              hoveredIndex={hoveredIndex}
              setHoveredIndex={setHoveredIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 