import { useState, useEffect } from 'react';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseFetchOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  dependencies?: any[];
  retries?: number;
  retryDelay?: number;
}

export function useFetch<T>(url: string, options: UseFetchOptions = {}): UseFetchState<T> & { retry: () => void } {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const {
    onSuccess,
    onError,
    dependencies = [],
    retries = 3,
    retryDelay = 1000,
  } = options;

  // Memoize the fetch function to avoid recreating it on every render
  const fetchData = async (retryCount = 0) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
    } catch (error) {
      const errorObject = error instanceof Error ? error : new Error(String(error));
      
      // Retry logic
      if (retryCount < retries) {
        console.warn(`Fetch attempt ${retryCount + 1} failed, retrying in ${retryDelay}ms...`);
        setTimeout(() => fetchData(retryCount + 1), retryDelay);
        return;
      }

      setState({ data: null, loading: false, error: errorObject });
      onError?.(errorObject);
    }
  };

  useEffect(() => {
    let mounted = true;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchWithAbort = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const response = await fetch(url, { signal });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        if (mounted) {
          setState({ data, loading: false, error: null });
          onSuccess?.(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return; // Ignore abort errors
        }

        if (mounted) {
          const errorObject = error instanceof Error ? error : new Error(String(error));
          setState({ data: null, loading: false, error: errorObject });
          onError?.(errorObject);
        }
      }
    };

    fetchWithAbort();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [url, ...dependencies]);

  const retry = () => {
    fetchData();
  };

  return { ...state, retry };
} 