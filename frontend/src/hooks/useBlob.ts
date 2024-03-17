import { useQuery } from "@tanstack/react-query";
import { getUBlob } from "../utils/api";

/**
 * Fetches a specific ublob.
 */
export default function useBlob(hash: string) {
  return useQuery({
    queryKey: ["ublob", hash],
    queryFn: () => getUBlob(hash),
  });
}
