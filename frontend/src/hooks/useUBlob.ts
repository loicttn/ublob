import { useEffect, useState } from 'react';
import { UBlob } from '../utils/api';
import { generateRandomUBlob } from '../utils/mock';

type UseFetchUBlobReturn = {
  data: UBlob | null;
  loading: boolean;
  error: string | null;
};

/**
 * Fetches a specific ublob.
 * @param id ublob id
 * @returns {UseFetchUBlobReturn} - ublob data
 */
export const useUBlob = (id: number): UseFetchUBlobReturn => {
  const [data, setData] = useState<UBlob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        // const res = await getUBlob(id);
        const res = generateRandomUBlob(); // TODO: remove this once api live
        setData(res);
        setLoading(false);
      } catch (error) {
        setError((error as Error).message);
        setLoading(false);
      }
    };

    getData();
  }, [id]);

  return { data, loading, error };
};
