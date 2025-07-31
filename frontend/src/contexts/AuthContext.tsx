// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { initializeDemoMode, clearDemoMode } from '../services/gameDataService';

interface User
{
  id: string;
  name: string;
  email: string;
  isDemo: boolean;
}

interface AuthState
{
  user: User | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState
{
  loginWithGoogle: () => Promise<void>;
  loginDemo: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) =>
{
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false
  });

  const loginWithGoogle = async () =>
  {
    setState(prev => ({ ...prev, isLoading: true }));

    try
    {
      // TODO: Implement real Google OAuth
      console.log('Google login - to be implemented');

      // For now, simulate success after delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState({
        user: {
          id: 'google-user-123',
          name: 'Real User',
          email: 'user@gmail.com',
          isDemo: false
        },
        isLoading: false
      });
    } catch (error)
    {
      console.error('Google login failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loginDemo = () =>
  {
    initializeDemoMode();

    setState({
      user: {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@example.com',
        isDemo: true
      },
      isLoading: false
    });
  };

  const logout = () =>
  {
    clearDemoMode();

    setState({
      user: null,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      loginWithGoogle,
      loginDemo,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
{
  const context = useContext(AuthContext);
  if (!context)
  {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};