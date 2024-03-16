import { BLOB_SIZE, getUBlobBid, getUBlobSize } from "../utils/blob";
import { generateRandomHead } from "../utils/mock";
import { useQuery } from "@tanstack/react-query";

async function getPendingBids() {
  const data = generateRandomHead();

  // sort by highest bid
  data.ublobs.sort((a, b) => getUBlobBid(b) - getUBlobBid(a));

  const accepted_blobs = [];
  const pending_blobs = [];

  let acc = 0;
  for (const blob of data.ublobs) {
    if (acc < BLOB_SIZE) {
      accepted_blobs.push(blob);
    } else {
      pending_blobs.push(blob);
    }
    console.log(acc);

    acc += getUBlobSize(blob);
  }

  return {
    all_blobs: data.ublobs,
    accepted_blobs,
    pending_blobs,
  };
}

/**
 * Fetches the head of the ublob auction.
 */
export default function useHead() {
  return useQuery({
    queryKey: ["head"],
    queryFn: getPendingBids,

    // poll every 500ms
    refetchInterval: 500,
  });
}
