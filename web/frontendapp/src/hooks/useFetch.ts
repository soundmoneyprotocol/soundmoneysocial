import { useState, useEffect, useCallback } from 'react';

export interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export const useFetch = <T,>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
): FetchState<T> => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setState({ data: null, isLoading: true, error: null });
      try {
        const result = await fetcher();
        if (isMounted) {
          setState({ data: result, isLoading: false, error: null });
        }
      } catch (err) {
        if (isMounted) {
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error('Unknown error'),
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
};

export default useFetch;
