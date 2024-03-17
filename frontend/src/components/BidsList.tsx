import { useMeasure } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import useHead from "../hooks/useHead";
import { UBlob } from "../utils/api";
import { getUBlobBidWei } from "../utils/blob";
import { formatAddress } from "../utils/format";

function BidsList() {
  const { data } = useHead();
  const [ref, { width }] = useMeasure();

  const show_base_fee = data?.pending_blobs && data?.pending_blobs.length > 0;
  const last_accepted_blob = data?.accepted_blobs.at(-1);
  const base_fee = last_accepted_blob
    ? getUBlobBidWei(last_accepted_blob)
    : undefined;

  const cell_width = (width ?? 0) / 3;
  const min_width = cell_width * 2;

  const MAX_PENDING_BLOBS = 5;
  const accepted_blobs = data?.accepted_blobs ?? [];
  const pending_blobs = data?.pending_blobs.slice(0, MAX_PENDING_BLOBS) ?? [];

  const getWidth = (blob: UBlob) =>
    min_width +
    (data?.biggest_blob && data?.smallest_blob
      ? (cell_width * getUBlobBidWei(blob)) / getUBlobBidWei(data.biggest_blob)
      : 0);

  return (
    <div className="bg-light-violet overflow-y-auto rounded-md flex flex-col gap-2">
      <h2 className="text-white text-base px-4 pt-4">Bids</h2>
      <div
        className="flex flex-col gap-1.5 overflow-y-auto px-4 pb-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgb(56 45 99) rgb(23 16 49)",
        }}
      >
        <div ref={ref} className="invisible" />

        {accepted_blobs.map((ublob) => (
          <motion.div
            key={ublob.ID}
            layoutId={ublob.ID.toString()}
            style={{ width: getWidth(ublob) }}
            className="grid grid-cols-[120px_100px_auto] px-3 py-2 border border-l-2 border-l-emerald-500 border-purple text-xs"
          >
            <p>
              <span className="text-white">{ublob.Data.length}</span>{" "}
              <span className="text-light-purple">bytes</span>
            </p>
            <p className="text-white">{formatAddress(ublob.Sender)}</p>
            <p className="text-right">
              <span className="text-white">{getUBlobBidWei(ublob)}</span>{" "}
              <span className="text-light-purple">wei</span>
            </p>
          </motion.div>
        ))}

        {show_base_fee && (
          <div className="w-full flex items-center text-xs gap-2 my-3">
            <div className="bg-purple grow h-px" />
            <span className="text-light-purple">base fee:</span>
            <span className="text-white">{base_fee} wei</span>
          </div>
        )}

        {pending_blobs.map((ublob) => (
          <motion.div
            key={ublob.ID}
            layoutId={ublob.ID.toString()}
            style={{ width: getWidth(ublob) }}
            className="grid grid-cols-[120px_100px_auto] px-3 py-2 border border-purple text-xs"
          >
            <p>
              <span className="text-white">{ublob.Data.length}</span>{" "}
              <span className="text-light-purple">bytes</span>
            </p>
            <p className="text-white">{formatAddress(ublob.Sender)}</p>
            <p className="text-right">
              <span className="text-white">{getUBlobBidWei(ublob)}</span>{" "}
              <span className="text-light-purple">wei</span>
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default BidsList;
