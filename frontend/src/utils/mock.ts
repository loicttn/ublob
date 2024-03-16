import { Blob, Head, UBlob } from "./api";
import { BLOB_SIZE, getUBlobSize } from "./blob";

/**
 * Function to generate a random number between min and max.
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns {number} - The random number
 */
const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Function to generate a random float between min and max.
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns {number} - The random number
 */
const getRandomFloat = (min: number, max: number): number =>
  Math.random() * (max - min + 1) + min;

/**
 * Function to generate a random string of a given length.
 * @param min - The minimum length
 * @param max - The maximum length
 * @returns {string} - The random string
 */
export function getRandomString(min: number, max: number): string {
  const length = getRandomInt(min, max);
  const arr = new Uint8Array(length);
  window.crypto.getRandomValues(arr);
  return arr.map((item) => +item.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a random blob value.
 * @returns {UBlob} - random ublob data
 */
export function generateRandomUBlob(): UBlob {
  return {
    id: getRandomInt(100, 1000000),
    data: getRandomString(1000, 20000),
    sender: "0x" + getRandomString(40, 40),
    signature: "0x" + getRandomString(64, 64),
    max_wei_per_byte: getRandomInt(1, 10),
    age_factor: getRandomFloat(1, 5),
    expiration_timestamp: getRandomInt(1000000, 10000000),
    creation_timestamp: getRandomInt(100000, 1000000),
    creation_block_number: getRandomInt(1000, 5000),
  };
}

/**
 * Generate a random blob value.
 * @returns {UBlob} - random ublob data
 */
export function generateRandomBlob(): Blob {
  const data = {
    hash: "0x" + getRandomString(64, 64),
    timestamp: getRandomInt(100000, 1000000),
    fee: getRandomInt(100, 1000),
    filled: getRandomInt(0, 100),
    ublobs: [] as UBlob[],
  };

  while (true) {
    const new_blob = generateRandomUBlob();

    if (
      [...data.ublobs, new_blob].reduce((a, c) => getUBlobSize(c) + a, 0) <
      BLOB_SIZE
    ) {
      data.ublobs.push(new_blob);
    } else {
      break;
    }
  }

  return data;
}

/**
 * Generate a random blob value.
 * @returns {UBlob} - random ublob data
 */
export function generateRandomBlobs(count: number): Blob[] {
  const blobs: Blob[] = [];
  for (let i = 0; i < count; i++) {
    blobs.push(generateRandomBlob());
  }
  return blobs;
}

/**
 * Generate a random head data.
 * @returns {Head} - random head data
 */
export function generateRandomHead(): Head {
  const ublobs: UBlob[] = [];

  for (let i = 0; i < getRandomInt(20, 42); i++) {
    ublobs.push(generateRandomUBlob());
  }

  return { ublobs };
}
