import { formatEther } from "viem";

type RoundingMode =
  | "ceil"
  | "floor"
  | "expand"
  | "trunc"
  | "halfCeil"
  | "halfFloor"
  | "halfExpand"
  | "halfTrunc"
  | "halfEven";

/**
 * Converts wei to eth
 */
export function weiToEth(wei: bigint): string {
  return formatEther(wei);
}

/**
 * Formats a number into 0,000.00 format
 */
export function formatNumber(
  number: number | string,
  decimals = 2,
  rounding_mode: RoundingMode = "floor"
): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    roundingMode: rounding_mode,
    // ref: https://caniuse.com/mdn-javascript_builtins_intl_numberformat_numberformat_options_roundingmode_parameter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any).format(number as any);
}

/**
 * Formats a number into a percentage with the 0,000.00% format
 */
export function formatPercentage(number: number, decimals = 2): string {
  return formatNumber(number, decimals) + "%";
}

/**
 * Converts wei to eth and formats it
 */
export function formatWeiToEth(
  wei_amount: bigint,
  decimals = 4,
  rounding_mode: RoundingMode = "floor"
): string {
  return formatNumber(weiToEth(wei_amount), decimals, rounding_mode);
}

/**
 * Formats an address into 0x000...000 format
 */
export function formatAddress(address: string, pad = 4): string {
  const start = address.substring(0, pad);
  const end = address.slice(address.length - pad);
  return `${start}...${end}`;
}
