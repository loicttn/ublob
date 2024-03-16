/*-------------------------------- CONSTANTS --------------------------------*/

const API = 'http://localhost:8000/api';

/*--------------------------------- ERRORS ----------------------------------*/

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/*-------------------------------- API TYPES --------------------------------*/

export type Blob = {
  ublobs: UBlob[];
  hash: string;
  timestamp: number;
  fee: number;
  filled: number; // out of 100%
};

export type UBlob = {
  id: number;
  data: string;
  sender: string;
  signature: string;
  max_wei_per_byte: number;
  age_factor: number;
  expiration_timestamp: number;
  creation_timestamp: number;
  creation_block_number: number;
};

export type UBlobReceipt = {
  id: number;
  offset: number;
  size: number;
  blobID: number;
  blobReceiptID: number;
};

export type Head = {
  ublobs: UBlob[];
};

/*-------------------------------- API CALLS --------------------------------*/

/**
 * Fetches the head of the ublob auction.
 * @returns {Promise<Head>} - The head of the ublob auction
 */
export const getHead = async (): Promise<Head> => {
  const res = await fetch(`${API}/v1/head`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new NetworkError(`Failed to fetch head: ${res.status}`);
  }

  return res.json();
};

/**
 * Fetches the ublob with the given id.
 * @param id ublob id
 * @returns {Promise<UBlob>} - The ublob with the given id
 */
export const getUBlob = async (id: number): Promise<UBlob> => {
  const res = await fetch(`${API}/v1/ublob/${id}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new NetworkError(`Failed to fetch ublob: ${res.status}`);
  }

  return res.json();
};

/**
 * Fetches the ublob receipt with the given id.
 * @param id ublob receipt id
 * @returns {Promise<UBlobReceipt>} - The ublob receipt with the given id
 */
export const getUBlobReceipt = async (id: number): Promise<UBlobReceipt> => {
  const res = await fetch(`${API}/v1/ublob_receipt/${id}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new NetworkError(`Failed to fetch ublob receipt: ${res.status}`);
  }

  return res.json();
};
