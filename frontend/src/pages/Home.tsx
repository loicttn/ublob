import BidsGraph from '../components/BidsGraph';
import BidsList from '../components/BidsList';
import LatestBlobs from '../components/LatestBlobs';

const BASE_FEE = 10;

function Kpis() {
  const kpis = [
    { name: 'base fee', value: BASE_FEE },
    { name: 'pending blobs', value: 54 },
  ];

  return (
    <div className="flex gap-6 items-center">
      {kpis.map((kpi) => (
        <p className="text-xs" key={kpi.name}>
          <span className="text-light-purple">{kpi.name}:</span>{' '}
          <span className="text-white">{kpi.value}</span>
        </p>
      ))}
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
