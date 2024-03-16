import { useQuery } from '@tanstack/react-query';
import { generateRandomUBlob } from '../utils/mock';

/**
 * Fetches a specific ublob.
 */
export default function useBlob(id: number) {
  return useQuery({
    queryKey: ['ublob', id],
    queryFn: () => generateRandomUBlob(/** id */),
  });
}
