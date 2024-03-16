import { useParams } from "react-router";
import Value from "../components/Value";
import useBlob from "../hooks/useBlob";
import { useMeasure } from "@uidotdev/usehooks";
import { BLOB_SIZE, getUBlobSize } from "../utils/blob";
import { keccak256 } from "viem";
import { UBlob } from "../utils/api";
import { Link } from "react-router-dom";

const getBlobColor = (blob: UBlob) => {
  const color = keccak256(`0x${blob.data}`);
  const background = `rgba(${parseInt(color.slice(2, 4), 16)}, ${parseInt(
    color.slice(4, 6),
    16
  )}, ${parseInt(color.slice(6, 8), 16)}, var(--opacity))`;
  return background;
};

function BlobPage() {
  const { id } = useParams();
  const { isLoading, data: blob, error } = useBlob(1);

  const [ref, { width }] = useMeasure();

  return (
    <>
      <div className="bg-light-violet rounded-md flex flex-col gap-2 p-4 text-white">
        <h2 className="text-lg">Blob - {id}</h2>
        <div className="flex flex-col text-sm">
          {isLoading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {blob && (
            <div className="flex flex-col gap-1 text-sm">
              <Value label="hash" value={blob.hash} />
              <Value label="fee" value={`${blob.fee} wei`} />
              <Value
                label="timestamp"
                value={new Date(blob.timestamp).toLocaleString()}
              />
            </div>
          )}
        </div>
      </div>

      <div
        className="w-full flex gap-x-1 p-1 bg-light-violet rounded-md h-28"
        ref={ref}
      >
        {blob?.ublobs.map((e) => {
          const blob_width =
            Math.floor(
              (getUBlobSize(e) * ((width ?? 0) - 4 * blob.ublobs.length)) /
                BLOB_SIZE
            ) + "px";
          const background = getBlobColor(e);

          return (
            <a
              href={"#" + e.id}
              key={e.id}
              className="text-xs rounded-sm flex items-center justify-center transition-colors truncate hover:![--opacity:0.8] text-white"
              style={
                {
                  "--opacity": "0.5",
                  width: blob_width,
                  backgroundColor: background,
                } as React.CSSProperties
              }
            >
              {e.id}
            </a>
          );
        })}
      </div>

      <h2 className="text-xl text-white mt-10">&micro;Blobs</h2>

      <div className="flex flex-col gap-8 -mx-4">
        {blob?.ublobs.map((e) => (
          <Link
            to={`/ublob/${e.id}`}
            className="flex p-4 hover:bg-light-violet transition-colors rounded-md flex-col gap-2"
            id={e.id.toString()}
          >
            <div className="flex flex-col gap-0.5 text-xs">
              <Value label="size" value={`${getUBlobSize(e)} bytes`} />
              <Value label="hash" value={e.id.toString()} />
              <Value label="sender" value={e.sender} />
            </div>

            <div
              className="p-3 rounded-md border border-light-purple text-white break-words"
              style={
                {
                  "--opacity": "0.5",
                  backgroundColor: getBlobColor(e),
                } as React.CSSProperties
              }
            >
              {e.data.substring(0, 100)}...
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default BlobPage;
