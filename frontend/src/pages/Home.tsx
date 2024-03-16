import BidsGraph from "../components/BidsGraph";
import BidsList from "../components/BidsList";
import LatestBlobs from "../components/LatestBlobs";
import useHead from "../hooks/useHead";
import { getUBlobBidWei } from "../utils/blob";

function Kpis() {
  const { data } = useHead();

  const last_accepted_blob = data?.accepted_blobs.at(-1);
  const base_fee = last_accepted_blob
    ? getUBlobBidWei(last_accepted_blob)
    : undefined;

  return (
    <div className="flex gap-6 items-center">
      <p className="text-xs">
        <span className="text-light-purple">base fee:</span>{" "}
        <span className="text-white">{base_fee} wei</span>
      </p>

      <p className="text-xs">
        <span className="text-light-purple">pending &micro;blobs:</span>{" "}
        <span className="text-white">{data?.all_blobs.length}</span>
      </p>
    </div>
  );
}

function Home() {
  return (
    <>
      <Kpis />

      <div className="grid grid-cols-2 h-[32rem] gap-4">
        <BidsList />

        <BidsGraph />
      </div>

      <LatestBlobs />
      <div className="my-10" />
    </>
  );
}

export default Home;
