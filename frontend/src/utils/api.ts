/*-------------------------------- CONSTANTS --------------------------------*/

const API = "http://localhost:8080";

/*--------------------------------- ERRORS ----------------------------------*/

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

/*-------------------------------- API TYPES --------------------------------*/

export type Blob = {
  ID: number;
  BlobHash: string;
  BlobGasPrice: string;
  Size: number;
  Timestamp: number;
  UBlobReceipts: UBlobReceipt[] | null;
};

export type Blobs = {
  blobs: Blob[];
};

export type UBlob = {
  ID: number;
  Data: string;
  Sender: string;
  Signature: string;
  MaxWeiPerByte: string;
  AgeFactor: number;
  ExpirationTimestamp: number;
  CreationTimestamp: number;
  CreationBlockNumber: number;
  UBlobReceiptID: number;
  UBlobReceipt: UBlobReceipt;
};

export type UBlobReceipt = {
  Blob: UBlob;
  BlobReceiptID: number;
  ID: number;
  Offset: number;
  Size: number;
};

export type Head = {
  ublobs: UBlob[];
};

/*-------------------------------- API CALLS --------------------------------*/

/**
 * Fetches the head of the ublob auction.
 * @returns {Promise<Head>} - The head of the ublob auction
 */
export async function getHead(): Promise<Head> {
  const res = await fetch(`${API}/ublobs`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new NetworkError(`Failed to fetch head: ${res.status}`);
  }

  return res.json();
}

/**
 * Fetches the head of the ublob auction.
 * @returns {Promise<Head>} - The head of the ublob auction
 */
export async function getLatestBlobs(): Promise<Blobs> {
  const res = await fetch(`${API}/blobs`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new NetworkError(`Failed to fetch head: ${res.status}`);
  }

  return res.json();
}

export async function getUBlob(hash: string): Promise<{ ublob: Blob }> {
  const res = await fetch(`${API}/ublobs/${hash}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new NetworkError(`Failed to fetch ublob: ${res.status}`);
  }

  return res.json();
}

/**
 * Fetches the ublob receipt with the given id.
 * @param id ublob receipt id
 * @returns {Promise<UBlobReceipt>} - The ublob receipt with the given id
 */
export async function getUBlobReceipt(id: number): Promise<UBlobReceipt> {
  const res = await fetch(`${API}/v1/ublob_receipt/${id}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new NetworkError(`Failed to fetch ublob receipt: ${res.status}`);
  }

  return res.json();
}
