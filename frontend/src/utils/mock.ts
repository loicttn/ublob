import { Head, UBlob } from './api';

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
const getRandomString = (min: number, max: number): string => {
  const length = getRandomInt(min, max);
  return Math.random().toString(36).substr(2, length);
};

/**
 * Generate a random blob value.
 * @returns {UBlob} - random ublob data
 */
export const generateRandomUBlob = (): UBlob => ({
  id: getRandomInt(1, 10000),
  data: getRandomString(100, 20000),
  sender: getRandomString(20, 20),
  signature: getRandomString(100, 1000),
  max_wei_per_byte: getRandomInt(1, 10),
  age_factor: getRandomFloat(1, 5),
  expiration_timestamp: getRandomInt(1000000, 10000000),
  creation_timestamp: getRandomInt(100000, 1000000),
  creation_block_number: getRandomInt(1000, 5000),
});

/**
 * Generate a random head data.
 * @returns {Head} - random head data
 */
export const generateRandomHead = (): Head => {
  const ublobs: UBlob[] = [];

  for (let i = 0; i < getRandomInt(1, 42); i++) {
    ublobs.push(generateRandomUBlob());
  }

  return { ublobs };
};
