export interface TransactionResult {
  txid: string;
  status: "pending" | "success" | "error";
  type: TransactionType;
  message?: string;
  amount?: number;
  recipient?: string;
}

export type TransactionType =
  | "deposit"
  | "withdraw"
  | "transfer"
  | "bot-spend"
  | "authorize-bot"
  | "revoke-bot";

export interface ContractInfo {
  address: string;
  name: string;
  network: "testnet" | "mainnet";
}
