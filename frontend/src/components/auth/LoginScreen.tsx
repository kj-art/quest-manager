// frontend/src/components/auth/LoginScreen.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginScreen.css';

export const LoginScreen: React.FC = () =>
{
  const { loginWithGoogle, loginDemo, isLoading } = useAuth();

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Title matching your app style */}
        <h1 className="login-title">Quest Manager</h1>
        <h2 className="login-subtitle">Tales of Verdana</h2>

        <div className="login-form">
          <h3>Choose Login Method</h3>

          {/* Google Login Button */}
          <button
            className="login-button google-login"
            onClick={loginWithGoogle}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Connecting to Google...</span>
            ) : (
              <>
                <span className="google-icon">🔐</span>
                Login with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="login-divider">
            <span>or</span>
          </div>

          {/* Demo Mode Button */}
          <button
            className="login-button demo-login"
            onClick={loginDemo}
            disabled={isLoading}
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