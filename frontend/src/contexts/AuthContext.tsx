import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { initializeDemoMode, clearDemoMode } from '../services/gameDataService';

interface User
{
  id: string;
  name: string;
  email: string;
  isDemo: boolean;
  accessToken?: string;
  refreshToken?: string;
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
    isLoading: true
  });

  // Check for OAuth callback parameters on mount
  useEffect(() =>
  {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('auth_success'))
    {
      // Handle successful OAuth callback
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const userId = urlParams.get('user_id');
      const userName = urlParams.get('user_name');
      const userEmail = urlParams.get('user_email');

      if (accessToken && userId && userName && userEmail)
      {
        const user: User = {
          id: userId,
          name: userName,
          email: userEmail,
          isDemo: false,
          accessToken,
          refreshToken: refreshToken || undefined
        };

        // Store tokens in localStorage for development
        localStorage.setItem('auth_tokens', JSON.stringify({
          accessToken,
          refreshToken,
          user: { id: userId, name: userName, email: userEmail }
        }));

        setState({ user, isLoading: false });

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (urlParams.has('auth_error'))
    {
      // Handle OAuth error
      const error = urlParams.get('auth_error');
      console.error('OAuth error:', error);
      setState({ user: null, isLoading: false });

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else
    {
      // Check for existing stored tokens
      const storedAuth = localStorage.getItem('auth_tokens');
      if (storedAuth)
      {
        try
        {
          const { accessToken, refreshToken, user: userData } = JSON.parse(storedAuth);
          setState({
            user: {
              ...userData,
              isDemo: false,
              accessToken,
              refreshToken
            },
            isLoading: false
          });
        } catch (error)
        {
          console.error('Failed to parse stored auth:', error);
          localStorage.removeItem('auth_tokens');
          setState({ user: null, isLoading: false });
        }
      } else
      {
        setState({ user: null, isLoading: false });
      }
    }
  }, []);

  const loginWithGoogle = async () =>
  {
    setState(prev => ({ ...prev, isLoading: true }));

    try
    {
      // Get auth URL from backend
      const response = await fetch('/auth/login');
      const data = await response.json();

      if (!response.ok)
      {
        throw new Error(data.detail || 'Failed to initiate login');
      }

      // Redirect to Google OAuth
      window.location.href = data.auth_url;
    } catch (error)
    {
      console.error('Google login failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
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
    localStorage.removeItem('auth_tokens');

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