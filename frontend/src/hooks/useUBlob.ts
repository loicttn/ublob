import { generateRandomUBlob } from "../utils/mock";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches a specific ublob.
 */
export default function useUBlob(id: number) {
  return useQuery({
    queryKey: ["ublob", id],
    queryFn: () => generateRandomUBlob(/** id */),
  });
}
