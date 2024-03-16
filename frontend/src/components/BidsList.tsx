import useHead from "../hooks/useHead";
import { getUBlobBid } from "../utils/blob";

function BidsList() {
  const { data } = useHead();

  const show_base_fee = data?.pending_blobs && data?.pending_blobs.length > 0;
  const last_accepted_blob = data?.accepted_blobs.at(-1);
  const base_fee = last_accepted_blob
    ? getUBlobBid(last_accepted_blob)
    : undefined;

  return (
    <div className="bg-light-violet rounded-md flex flex-col gap-2 p-4">
      <h2 className="text-white text-base">Bids</h2>

      <div className="flex flex-col gap-3">
        {data?.accepted_blobs.map((ublob) => (
          <div
            key={ublob.id}
            className="grid grid-cols-3 p-4 border border-purple text-xs"
          >
            <p>
              <span className="text-white">{ublob.data.length}</span>{" "}
              <span className="text-light-purple">bytes</span>
            </p>
            <p className="text-white">{ublob.sender}</p>
            <p className="text-right">
              <span className="text-white">{getUBlobBid(ublob)}</span>{" "}
              <span className="text-light-purple">wei</span>
            </p>
          </div>
        ))}

        {show_base_fee && (
          <div>
            <span className="text-light-purple">base fee:</span>{" "}
            <span className="text-white">{base_fee} wei</span>
          </div>
        )}

        {data?.pending_blobs.map((ublob) => (
          <div
            key={ublob.id}
            className="grid grid-cols-3 p-4 border border-purple text-xs"
          >
            <p>
              <span className="text-white">{ublob.data.length}</span>{" "}
              <span className="text-light-purple">bytes</span>
            </p>
            <p className="text-white">{ublob.sender}</p>
            <p className="text-right">
              <span className="text-white">{getUBlobBid(ublob)}</span>{" "}
              <span className="text-light-purple">wei</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BidsList;
