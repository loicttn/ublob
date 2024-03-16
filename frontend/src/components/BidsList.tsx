import { formatWeiToEth } from "../utils/format";

function BidsList() {
  const bids = [
    { size: 12313, hash: "0x31313131313", bid: 1231231231231n },
    { size: 12313, hash: "0x313131313bd", bid: 12312123131n },
    { size: 12313, hash: "0x3131313131a", bid: 1231232131n },
    { size: 12313, hash: "0x3131313131d", bid: 1231231n },
  ];

  return (
    <div className="bg-light-violet rounded-md flex flex-col gap-2 p-4">
      <h2 className="text-white text-lg">Bids</h2>

      <div className="flex flex-col gap-3">
        {bids.map((bid) => (
          <div
            key={bid.hash}
            className="grid grid-cols-3 p-4 border border-purple text-xs"
          >
            <p>
              <span className="text-white">{bid.size}</span>{" "}
              <span className="text-light-purple">bytes</span>
            </p>
            <p className="text-white">{bid.hash}</p>
            <p className="text-right">
              <span className="text-white">{formatWeiToEth(bid.bid)}</span>{" "}
              <span className="text-light-purple">wei</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BidsList;
