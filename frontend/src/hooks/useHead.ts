import { useEffect, useState } from 'react';
import { Head } from '../utils/api';
import { generateRandomHead } from '../utils/mock';

type UseFetchHeadReturn = {
  data: Head | null;
  loading: boolean;
  error: string | null;
};

/**
 * Fetches the head of the ublob auction.
 * @returns {UseFetchHeadReturn} - The head of the ublob auction
 */
export const useHead = (): UseFetchHeadReturn => {
  const [data, setData] = useState<Head | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        // const res = await getHead();
        const res = generateRandomHead(); // TODO: remove this once api live
        setData(res);
        setLoading(false);
      } catch (error) {
        setError((error as Error).message);
        setLoading(false);
      }
    };

    getData();
  }, []);

  return { data, loading, error };
};
