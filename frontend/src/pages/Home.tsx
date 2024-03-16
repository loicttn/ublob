import BidsGraph from "../components/BidsGraph";
import BidsList from "../components/BidsList";

const BASE_FEE = 10;

function Kpis() {
  const kpis = [
    { name: "base fee", value: BASE_FEE },
    { name: "pending blobs", value: 54 },
  ];

  return (
    <div className="flex gap-6 items-center">
      {kpis.map((kpi) => (
        <p className="text-xs" key={kpi.name}>
          <span className="text-light-purple">{kpi.name}:</span>{" "}
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

      <div className="grid grid-cols-2 gap-4 min-h-[28rem]">
        <BidsList />

        <BidsGraph />
      </div>
    </>
  );
}

export default Home;
