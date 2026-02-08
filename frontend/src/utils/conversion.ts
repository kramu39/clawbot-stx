export const MICRO_STX_PER_STX = 1_000_000;

export function stxToMicroStx(stx: number): number {
  return Math.round(stx * MICRO_STX_PER_STX);
}

export function microStxToStx(microStx: number): number {
  return microStx / MICRO_STX_PER_STX;
}

export function formatStx(stx: number): string {
  return stx.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function shortenAddress(address: string, chars = 5): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function isValidStxAddress(address: string): boolean {
  return /^S[TPM][A-Z0-9]{38,}$/i.test(address);
}

export function explorerTxUrl(txid: string, network: "testnet" | "mainnet" = "testnet"): string {
  return `https://explorer.hiro.so/txid/${txid}?chain=${network}`;
}
