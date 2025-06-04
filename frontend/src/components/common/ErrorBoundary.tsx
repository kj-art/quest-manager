import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props
{
  children: ReactNode;
  fallback?: ReactNode;
}

interface State
{
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State>
{
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State
  {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo)
  {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render()
  {
    if (this.state.hasError)
    {
      if (this.props.fallback)
      {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
} 