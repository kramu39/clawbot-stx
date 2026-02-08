import { Cl, serializeCV, deserializeCV, cvToValue } from "@stacks/transactions";
import { request } from "@stacks/connect";

const CONTRACT_ADDRESS = "ST29VJHHXFPRQMW6W1VDE9NVR4AZ04V44H15082SQ";
const CONTRACT_NAME = "stx-clawbot";
const CONTRACT_ID = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
const NETWORK = "testnet";
const API_BASE = "https://api.testnet.hiro.so";

function toHex(bytes: Uint8Array | string): string {
  if (typeof bytes === "string") return bytes.startsWith("0x") ? bytes : `0x${bytes}`;
  return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function serializeArg(cv: any): string {
  const serialized = serializeCV(cv);
  return toHex(serialized as unknown as Uint8Array | string);
}

async function callReadOnly(
  functionName: string,
  args: any[],
  sender?: string
) {
  const url = `${API_BASE}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${functionName}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: sender || CONTRACT_ADDRESS,
      arguments: args.map(serializeArg),
    }),
  });
  const data = await response.json();
  if (!data.okay) throw new Error(data.cause || "Read-only call failed");
  return deserializeCV(data.result);
}

// ─── Read Operations ────────────────────────────────────
export async function getStxBalance(address: string): Promise<number> {
  const response = await fetch(`${API_BASE}/extended/v1/address/${address}/stx`);
  const data = await response.json();
  return parseInt(data.balance || "0", 10) / 1_000_000;
}

export async function getContractBalance(address: string): Promise<number> {
  const cv = await callReadOnly("get-balance", [Cl.principal(address)], address);
  const value = cvToValue(cv, true);
  return Number(value) / 1_000_000;
}

export async function getTotalDeposits(): Promise<number> {
  const cv = await callReadOnly("get-total-deposits", []);
  const value = cvToValue(cv, true);
  return Number(value) / 1_000_000;
}

export async function isBotAuthorized(bot: string): Promise<boolean> {
  const cv = await callReadOnly("is-bot-authorized", [Cl.principal(bot)]);
  return Boolean(cvToValue(cv, true));
}

// ─── Write Operations ───────────────────────────────────
export async function deposit(amountMicroStx: number): Promise<string> {
  const response: any = await request("stx_callContract", {
    contract: CONTRACT_ID,
    functionName: "deposit",
    functionArgs: [Cl.uint(amountMicroStx)],
    network: NETWORK,
  });
  return response.txid || response.txId || "";
}

export async function withdraw(amountMicroStx: number): Promise<string> {
  const response: any = await request("stx_callContract", {
    contract: CONTRACT_ID,
    functionName: "withdraw",
    functionArgs: [Cl.uint(amountMicroStx)],
    network: NETWORK,
  });
  return response.txid || response.txId || "";
}

export async function transfer(
  amountMicroStx: number,
  recipient: string
): Promise<string> {
  const response: any = await request("stx_callContract", {
    contract: CONTRACT_ID,
    functionName: "transfer",
    functionArgs: [Cl.uint(amountMicroStx), Cl.principal(recipient)],
    network: NETWORK,
  });
  return response.txid || response.txId || "";
}

export async function botSpend(
  amountMicroStx: number,
  recipient: string
): Promise<string> {
  const response: any = await request("stx_callContract", {
    contract: CONTRACT_ID,
    functionName: "bot-spend",
    functionArgs: [Cl.uint(amountMicroStx), Cl.principal(recipient)],
    network: NETWORK,
  });
  return response.txid || response.txId || "";
}

export async function authorizeBot(bot: string): Promise<string> {
  const response: any = await request("stx_callContract", {
    contract: CONTRACT_ID,
    functionName: "authorize-bot",
    functionArgs: [Cl.principal(bot)],
    network: NETWORK,
  });
  return response.txid || response.txId || "";
}

export async function revokeBot(bot: string): Promise<string> {
  const response: any = await request("stx_callContract", {
    contract: CONTRACT_ID,
    functionName: "revoke-bot",
    functionArgs: [Cl.principal(bot)],
    network: NETWORK,
  });
  return response.txid || response.txId || "";
}
