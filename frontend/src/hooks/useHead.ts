import { getHead } from "../utils/api";
import { BLOB_SIZE, getUBlobBidWei, getUBlobSize } from "../utils/blob";
import { useQuery } from "@tanstack/react-query";

async function getPendingBids() {
  const data = await getHead();

  // sort by highest bid
  data.ublobs.sort((a, b) => getUBlobBidWei(b) - getUBlobBidWei(a));

  const accepted_blobs = [];
  const pending_blobs = [];

  let acc = 0;
  for (const blob of data.ublobs) {
    if (acc < BLOB_SIZE) {
      accepted_blobs.push(blob);
    } else {
      pending_blobs.push(blob);
    }

    acc += getUBlobSize(blob);
  }

  const biggest_blob = data.ublobs[0];
  const smallest_blob = data.ublobs.at(-1);

  return {
    all_blobs: data.ublobs,
    accepted_blobs,
    pending_blobs,
    biggest_blob,
    smallest_blob,
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
