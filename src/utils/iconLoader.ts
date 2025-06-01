type IconModule = {
  default: string;
};

const isIconModule = (module: unknown): module is IconModule => {
  return typeof module === 'object' && module !== null && 'default' in module;
};

type IconMap = Record<string, string>;

/**
 * Loads all PNG icons from the assets directory and creates a map of filename -> URL
 * @returns A record mapping icon names to their URLs
 */
export const loadIcons = (): IconMap => {
  const icons = import.meta.glob('../assets/*.png', { eager: true });
  
  return Object.entries(icons).reduce((acc, [path, module]) => {
    const fileName = path.split('/').pop()?.split('.')[0];
    if (fileName && isIconModule(module)) {
      acc[fileName] = module.default;
    }
    return acc;
  }, {} as IconMap);
};

/**
 * Gets the URL for a specific icon
 * @param name The name of the icon (without .png extension)
 * @returns The URL of the icon or undefined if not found
 */
export const getIcon = (name: string): string | undefined => {
  const iconMap = loadIcons();
  return iconMap[name];
}; 