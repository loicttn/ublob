import useLatestBlobs from '../hooks/useLatestBlobs';

function LatestBlobs() {
  const { data: blobs } = useLatestBlobs(5);

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
          blobs.map((blob) => (
            <a href={`/blob/${blob.hash}`}>
              <div
                key={blob.hash}
                className="flex justify-between bg-light-violet p-4 rounded-md text-white items-center"
              >
                <p className="">{`0x${blob.hash.slice(
                  0,
                  4
                )}...${blob.hash.slice(-4, blob.hash.length)}`}</p>

                <div className="w-48 flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded h-2.5  dark:bg-gray-700">
                    <div
                      className="bg-green-600 h-2.5 rounded dark:bg-emerald-500"
                      style={{ width: `${blob.filled}%` }}
                    ></div>
                  </div>
                  <div className="text-green-500">{blob.filled}%</div>
                </div>

                <div>
                  <p>{blob.fee}</p>
                </div>
              </div>
            </a>
          ))}
      </div>
    </div>
  );
}

export default LatestBlobs;