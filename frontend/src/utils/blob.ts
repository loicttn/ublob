import { UBlob } from "./api";

export const BLOB_SIZE = 4096 * 32;

export const HEADER_SIZE = 28;

export function getUBlobSize(blob: UBlob): number {
  return blob.Data.length + HEADER_SIZE;
}

export function getUBlobBidWei(blob: UBlob): number {
  return getUBlobSize(blob) * Number(blob.MaxWeiPerByte);
}
