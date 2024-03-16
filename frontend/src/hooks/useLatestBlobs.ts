import { useQuery } from '@tanstack/react-query';
import { generateRandomBlobs } from '../utils/mock';

/**
 * Fetches a specific ublob.
 */
export default function useLatestBlobs(count: number) {
  return useQuery({
    queryKey: ['blob', count],
    queryFn: () => generateRandomBlobs(count),
  });
}
