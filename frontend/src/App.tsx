import { CharacterManager } from './CharacterManager';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import './components/header/Header.css';
import React from 'react';
import { Splash } from './components/splash/Splash';
import { CharacterProvider } from './contexts/CharacterContext';
import { SettingsProvider } from './contexts/SettingsContext';

interface PageInfo
{
  component: React.ComponentType;
  title: string;
}

// The central map of component names and their paths
const pages: Record<string, PageInfo> = {
  'character-manager': {
    component: CharacterManager,
    title: 'Character Manager'
  },
  'script-writer': {
    component: () => <div>Script Writer</div>,
    title: 'Script Writer'
  },
  'battle-balancer': {
    component: () => <div>Battle Balancer</div>,
    title: 'Battle Balancer'
  },
  'minigame-designer': {
    component: () => <div>Minigame Designer</div>,
    title: 'Minigame Designer'
  },
  'inventory': {
    component: () => <div>Inventory</div>,
    title: 'Inventory'
  },
  'abilities': {
    component: () => <div>Abilities</div>,
    title: 'Abilities'
  }
} as const;

// Utility to convert slug to display name
const formatDisplayName = (slug: string) =>
  slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

function ImageBanner({ slug, zIndex, index, hoveredIndex, setHoveredIndex }: { slug: string; zIndex: number, index: number, hoveredIndex: number | null, setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>> })
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

function HeadingText({ slug, headingText }: { slug: string; headingText: String })
{
  const [imageError, setImageError] = React.useState(false);
  React.useEffect(() =>
  {
    setImageError(false);
  }, [slug]);
  return imageError ? (
    <h1>{headingText}</h1>
  ) : (
    <div
      style={{
        position: 'relative',
        transform: 'translate(0%, -30%)',
        display: 'inline-block',
      }}
    >
      <img
        src={`../src/assets/banner_${slug}.png`}
        onError={() => setImageError(true)}
        style={{
          display: 'block',
          right: '100%',
        }}
      />
      <h1
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '0%',
          color: 'white',
          fontSize: '2rem',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textShadow: '-3px 4px 0px rgba(0, 0, 0, 1)',
        }}
      >
        {headingText}
      </h1>
    </div>
  );
}

// Header with nav and current location
function Header()
{
  const location = useLocation();
  const slug = location.pathname.slice(1); // remove leading '/'
  const headingText = slug ? formatDisplayName(slug) : 'Main';

  return (
    <div className="header-container">
      <HeadingText slug={slug} headingText={headingText} />

      <nav className="nav-links">
        <span>
          <Link to="/">Main</Link>
        </span>
        {Object.entries(pages).map(([slug, { title }]) => (
          <span key={slug}>
            <Link to={`/${slug}`}>{title}</Link>
          </span>
        ))}
      </nav>
    </div>
  );
}

// App with dynamic routing
export default function App()
{
  return (
    <SettingsProvider>
      <CharacterProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Splash pages={pages} />} />
          {Object.entries(pages).map(([slug, { component: Component }]) => (
            <Route key={slug} path={`/${slug}`} element={<Component />} />
          ))}
        </Routes>
      </CharacterProvider>
    </SettingsProvider>
  );
}