import { useEffect, useState } from 'react';
import { loadPetData } from '../services/petDataService';
import type { PetDataResponse } from '../types';

interface UsePetDataResult {
  data: PetDataResponse | null;
  loading: boolean;
  error: string | null;
}

export function usePetData(): UsePetDataResult {
  const [data, setData] = useState<PetDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setLoading(true);
        const response = await loadPetData();
        if (mounted) {
          setData(response);
          setError(null);
        }
      } catch {
        if (mounted) {
          setError('Could not load pet names. Please refresh the page.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
