import { useParams } from "react-router";
import Value from "../components/Value";
import useUBlob from "../hooks/useUBlob";

function UBlobPage() {
  const { id } = useParams();
  const { isLoading, data: ublob, error } = useUBlob(1);

  return (
    <div className="bg-light-violet rounded-md flex flex-col gap-2 p-4 text-white">
      <h2 className="text-lg">µBlob - {id}</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {ublob && (
        <div className="flex flex-col text-sm">
          <Value label="owner" value={ublob.sender} />
          <Value label="byte price" value={`${ublob.max_wei_per_byte} wei`} />
          <Value
            label="creation block"
            value={ublob.creation_block_number.toString()}
          />
          <Value label="size" value={`${ublob.data.length} bytes`} />

          <div className="mt-4">
            <label className="font-bold text-light-purple">data</label>
            <p className="mt-2 break-all">{ublob.data}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UBlobPage;
