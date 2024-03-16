import { useParams } from 'react-router';
import Value from '../components/Value';
import useBlob from '../hooks/useBlob';

export const BlobPage = () => {
  const { id } = useParams();
  const { isLoading, data: blob, error } = useBlob(1);

  return (
    <div className="bg-light-violet rounded-md flex flex-col gap-2 p-4 text-white">
      <h2 className="text-lg">Blob - {id}</h2>
      <div className="flex flex-col text-sm">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {blob && (
          <div className="flex flex-col text-sm">
            <Value label="Owner" value={blob.sender} />
            <Value label="# µBlob" value="42" />
          </div>
        )}
      </div>
    </div>
  );
};
