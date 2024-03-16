import { useEffect, useState } from 'react';
import { UBlobReceipt, getUBlobReceipt } from '../utils/api';

type UseFetchUBlobReceiptReturn = {
  data: UBlobReceipt | null;
  loading: boolean;
  error: string | null;
};

/**
 * Fetches a specific ublob receipt.
 * @param id ublob receipt id
 * @returns {UseFetchUBlobReceiptReturn} - ublob receipt data
 */
export const useUBlobReceipt = (id: number): UseFetchUBlobReceiptReturn => {
  const [data, setData] = useState<UBlobReceipt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await getUBlobReceipt(id);
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
