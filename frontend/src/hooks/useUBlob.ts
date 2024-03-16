import { useQuery } from '@tanstack/react-query';
import { generateRandomUBlob } from '../utils/mock';

/**
 * Fetches a specific ublob.
 */
export default function useUBlob(id: number) {
  return useQuery({
    queryKey: ['blob', id],
    queryFn: () => generateRandomUBlob(/** id */),
  });
}
