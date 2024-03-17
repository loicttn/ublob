import useLatestBlobs from "../hooks/useLatestBlobs";
import { formatAddress } from "../utils/format";
import { BLOB_SIZE } from "../utils/blob";

function LatestBlobs() {
  const { data: blobs } = useLatestBlobs();

  blobs?.blobs.sort((a, b) => b.Timestamp - a.Timestamp);

  return (
    <div className="flex flex-col gap-2 text-sm">
      <h2 className="text-lg text-white">Latest Blobs</h2>
      <div className="flex justify-between p-4 text-light-purple">
        <p>Hash</p>
        <p>Blob Filled</p>
        <p>Fee</p>
      </div>
      <div className="flex flex-col gap-4">
        {blobs &&
          blobs.blobs.map((blob) => (
            <a href={`/blob/${blob.BlobHash}`} key={blob.BlobHash}>
              <div className="flex justify-between bg-light-violet p-4 rounded-md text-white items-center">
                <p>{formatAddress(blob.BlobHash, 8)}</p>

                <div className="w-48 flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded h-2.5  dark:bg-gray-700">
                    <div
                      className="bg-green-600 h-2.5 rounded dark:bg-emerald-500"
                      style={{
                        width: `${Math.floor((blob.Size / BLOB_SIZE) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-green-500">
                    {Math.floor((blob.Size / BLOB_SIZE) * 100)}%
                  </div>
                </div>

                <div>
                  <p>{blob.BlobGasPrice} wei</p>
                </div>
              </div>
            </a>
          ))}
      </div>
    </div>
  );
}

export default LatestBlobs;
