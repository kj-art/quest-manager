import { CharacterManager } from './CharacterManager';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import React from 'react';

// The central map of slug -> component
const pageComponents: Record<string, JSX.Element> = {
  'character-manager': <CharacterManager />,
  'script-writer': <div>Script Writer</div>,
  //'locations': <div>Locations</div>,                  // is this needed? the Enterprise script will be less obnoxious when you can view one chapter at a time
  'battle-balancer': <div>Battle Balancer</div>,
  'minigame-designer': <div>Minigame Designer</div>,
  'inventory': <div>Inventory</div>,
  'abilities': <div>Abilities</div>,
};

// Utility to convert slug to display name
const formatDisplayName = (slug: string) =>
  slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

function ImageBanner({ slug, zIndex, index, hoveredIndex, setHoveredIndex }: { slug: string; zIndex: number, index: number, hoveredIndex: number, setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>> })
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

// Main splash page
function Main()
{
  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  return (
    <div>
      <h1 className="title">Quest Manager</h1>
      <h1 className="subtitle">Tales of Verdana</h1>
      <div className="splash-container">
        <img src="../src/assets/splash_main.png" className="splash-main" />

        <div className="banner-list">
          {Object.keys(pageComponents).map((slug, index) => (
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
        {Object.keys(pageComponents).map((slug) => (
          <span key={slug}>
            <Link to={`/${slug}`}>{formatDisplayName(slug)}</Link>
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
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        {Object.entries(pageComponents).map(([slug, component]) => (
          <Route key={slug} path={`/${slug}`} element={component} />
        ))}
      </Routes>
    </>
  );
}