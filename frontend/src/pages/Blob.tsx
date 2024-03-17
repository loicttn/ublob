import { useParams } from "react-router";
import Value from "../components/Value";
import useBlob from "../hooks/useBlob";
import { useMeasure } from "@uidotdev/usehooks";
import { BLOB_SIZE, getUBlobSize } from "../utils/blob";
import { keccak256 } from "viem";
import { UBlob } from "../utils/api";
import { Link } from "react-router-dom";
import { formatAddress } from "../utils/format";

const getBlobColor = (blob: UBlob) => {
  const color = keccak256(`0x${blob.Data}`);
  const background = `rgba(${parseInt(color.slice(2, 4), 16)}, ${parseInt(
    color.slice(4, 6),
    16
  )}, ${parseInt(color.slice(6, 8), 16)}, var(--opacity))`;
  return background;
};

function BlobPage() {
  const { hash } = useParams();
  const { isLoading, data, error } = useBlob(hash!);

  const [ref, { width }] = useMeasure();

  const blob = data?.ublob;
  console.log(blob);

  return (
    <>
      <div className="bg-light-violet rounded-md flex flex-col gap-2 p-4 text-white">
        <h2 className="text-lg">Blob - {formatAddress(hash ?? "", 12)}</h2>
        <div className="flex flex-col text-sm">
          {isLoading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {blob && (
            <div className="flex flex-col gap-1 text-sm">
              <Value
                label="hash"
                value={formatAddress(blob.BlobHash ?? "", 10)}
              />
              <Value label="fee" value={`${blob.BlobGasPrice} wei`} />
              <Value label="size" value={`${blob.Size} bytes`} />
            </div>
          )}
        </div>
      </div>

      <div
        className="w-full flex gap-x-1 p-1 bg-light-violet rounded-md h-28"
        ref={ref}
      >
        {blob?.UBlobReceipts!.map((e) => {
          const blob_width =
            Math.floor(
              (getUBlobSize(e.Blob) *
                ((width ?? 0) - 4 * blob.UBlobReceipts!.length)) /
                BLOB_SIZE
            ) + "px";
          const background = getBlobColor(e.Blob);

          return (
            <a
              href={"#" + e.ID}
              key={e.ID}
              className="text-xs rounded-sm flex items-center justify-center transition-colors truncate hover:![--opacity:0.8] text-white"
              style={
                {
                  "--opacity": "0.5",
                  width: blob_width,
                  backgroundColor: background,
                } as React.CSSProperties
              }
            >
              {e.ID}
            </a>
          );
        })}
      </div>

      <h2 className="text-xl text-white mt-10">&micro;Blobs</h2>

      <div className="flex flex-col gap-8 -mx-4">
        {blob?.UBlobReceipts!.map((e) => (
          <Link
            to={`/ublob/${blob.BlobHash}/${e.ID}`}
            className="flex p-4 hover:bg-light-violet transition-colors rounded-md flex-col gap-2"
            id={e.ID.toString()}
            key={e.ID}
          >
            <div className="flex flex-col gap-0.5 text-xs">
              <Value label="size" value={`${getUBlobSize(e.Blob)} bytes`} />
              <Value label="hash" value={keccak256(`0x${e.ID}`)} />
              <Value label="sender" value={e.Blob.Sender} />
            </div>

            <div
              className="p-3 rounded-md border border-light-purple text-white break-words"
              style={
                {
                  "--opacity": "0.5",
                  backgroundColor: getBlobColor(e.Blob),
                } as React.CSSProperties
              }
            >
              {e.Blob.Data.substring(0, 100)}...
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default BlobPage;
