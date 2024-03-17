import { useParams } from "react-router";
import Value from "../components/Value";
import useBlob from "../hooks/useBlob";

function UBlobPage() {
  const { hash, id } = useParams();
  const { isLoading, data, error } = useBlob(hash!);

  const ublob = data?.ublob.UBlobReceipts?.find((e) => e.ID === parseInt(id!));

  return (
    <div className="bg-light-violet rounded-md flex flex-col gap-2 p-4 text-white">
      <h2 className="text-lg">µBlob - {id}</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {ublob && (
        <div className="flex flex-col text-sm">
          <Value label="owner" value={ublob.Blob.Sender} />
          <Value label="byte price" value={`${ublob.Blob.MaxWeiPerByte} wei`} />
          <Value
            label="creation block"
            value={ublob.Blob.CreationBlockNumber.toString()}
          />
          <Value label="size" value={`${ublob.Blob.Data.length} bytes`} />

          <div className="mt-4">
            <label className="font-bold text-light-purple">data</label>
            <p className="mt-2 break-all">{ublob.Blob.Data}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UBlobPage;
