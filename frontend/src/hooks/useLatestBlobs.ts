import { useQuery } from "@tanstack/react-query";
import { getLatestBlobs } from "../utils/api";

/**
 * Fetches a specific ublob.
 */
export default function useLatestBlobs() {
  return useQuery({
    queryKey: ["blobs"],
    queryFn: getLatestBlobs,

    // poll every 500ms
    refetchInterval: 500,
  });
}
