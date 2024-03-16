import { UBlob } from "./api";

export const BLOB_SIZE = 128000;

export const HEADER_SIZE = 28;

export function getUBlobSize(blob: UBlob): number {
  return blob.data.length + HEADER_SIZE;
}

export function getUBlobBid(blob: UBlob): number {
  return getUBlobSize(blob) * blob.max_wei_per_byte;
}
