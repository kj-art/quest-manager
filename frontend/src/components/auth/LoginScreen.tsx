import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginScreen.css';

export const LoginScreen: React.FC = () =>
{
  const { loginWithGoogle, loginDemo, isLoading } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () =>
  {
    setGoogleLoading(true);
    try
    {
      await loginWithGoogle();
    } catch (error)
    {
      console.error('Google login failed:', error);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">Quest Manager</h1>
        <h2 className="login-subtitle">Tales of Verdana</h2>

        <div className="login-form">
          <h3>Choose Login Method</h3>

          <button
            className="login-button google-login"
            onClick={handleGoogleLogin}
            disabled={isLoading || googleLoading}
          >
            {googleLoading ? (
              <span>Redirecting to Google...</span>
            ) : (
              <>
                <span className="google-icon">🔐</span>
                Login with Google
              </>
            )}
          </button>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button
            className="login-button demo-login"
            onClick={loginDemo}
            disabled={isLoading || googleLoading}
          >
            <span className="demo-icon">🧪</span>
            Continue in Demo Mode
          </button>

          <p className="demo-explanation">
            Demo mode uses sample data stored locally.
            Perfect for testing and exploration.
          </p>
        </div>
      </div>
    </div>
  );
};