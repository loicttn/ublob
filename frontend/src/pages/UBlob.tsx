import { useParams } from 'react-router';
import Value from '../components/Value';
import useUBlob from '../hooks/useUBlob';

export const UBlobPage = () => {
  const { id } = useParams();
  const { isLoading, data: ublob, error } = useUBlob(1);

  return (
    <div className="bg-light-violet rounded-md flex flex-col gap-2 p-4 text-white">
      <h2 className="text-lg">µBlob - {id}</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {ublob && (
        <div className="flex flex-col text-sm">
          <Value label="Owner" value={ublob.sender} />
          <Value label="Byte Price" value={`${ublob.max_wei_per_byte} wei`} />
          <Value
            label="Creation Block"
            value={ublob.creation_block_number.toString()}
          />
          <Value label="Size" value={ublob.data.length.toString()} />

          <div className="mt-4">
            <label className="font-bold text-light-purple">Data</label>
            <p className="mt-2 break-all">{ublob.data}</p>
          </div>
        </div>
      )}
    </div>
  );
};
