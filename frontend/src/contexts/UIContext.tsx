import { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType
{
  showSettingsForm: boolean;
  toggleSettingsForm: (value?: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) =>
{
  const [showSettingsForm, setShowSettingsForm] = useState(false);

  const toggleSettingsForm = (value?: boolean) =>
  {
    setShowSettingsForm(prev =>
      typeof value === 'boolean' ? value : !prev
    );
  };

  return (
    <UIContext.Provider value={{ showSettingsForm, toggleSettingsForm }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () =>
{
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};
