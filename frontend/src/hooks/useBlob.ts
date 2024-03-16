import { useQuery } from "@tanstack/react-query";
import { generateRandomBlob } from "../utils/mock";

/**
 * Fetches a specific ublob.
 */
export default function useUBlob(id: number) {
  return useQuery({
    queryKey: ["ublob", id],
    queryFn: () => generateRandomBlob(/** id */),
  });
}
