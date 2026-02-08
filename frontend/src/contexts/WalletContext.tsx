import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  connect as stacksConnect,
  disconnect as stacksDisconnect,
  isConnected as stacksIsConnected,
  getLocalStorage,
} from "@stacks/connect";
import { getStxBalance, getContractBalance } from "@/services/contractService";

interface WalletContextType {
  isConnected: boolean;
  stxAddress: string | null;
  stxBalance: number | null;
  contractBalance: number | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

function findTestnetAddress(addresses: any[]): string | null {
  if (!addresses || !Array.isArray(addresses)) return null;
  const stAddr = addresses.find(
    (a: any) => typeof a?.address === "string" && a.address.startsWith("ST")
  );
  return stAddr?.address || addresses[0]?.address || null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [stxBalance, setStxBalance] = useState<number | null>(null);
  const [contractBalance, setContractBalance] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);

  const refreshBalances = useCallback(async () => {
    if (!stxAddress) return;
    try {
      const [chain, contract] = await Promise.allSettled([
        getStxBalance(stxAddress),
        getContractBalance(stxAddress),
      ]);
      if (chain.status === "fulfilled") setStxBalance(chain.value);
      if (contract.status === "fulfilled") setContractBalance(contract.value);
    } catch (e) {
      console.error("Failed to fetch balances:", e);
    }
  }, [stxAddress]);

  // Restore connection on mount
  useEffect(() => {
    try {
      if (stacksIsConnected()) {
        const storage: any = getLocalStorage();
        const addrs = storage?.addresses || storage?.stx || [];
        const addrList = Array.isArray(addrs) ? addrs : Object.values(addrs).flat();
        const addr = findTestnetAddress(addrList as any[]);
        if (addr) {
          setStxAddress(addr);
          setIsConnected(true);
        }
      }
    } catch {
      // silently fail if no prior session
    }
  }, []);

  // Refresh balances when address changes
  useEffect(() => {
    if (stxAddress) {
      refreshBalances();
    }
  }, [stxAddress, refreshBalances]);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const response: any = await stacksConnect();
      const addrs = response?.addresses || response?.stx || [];
      const addrList = Array.isArray(addrs) ? addrs : Object.values(addrs).flat();
      const addr = findTestnetAddress(addrList as any[]);
      if (addr) {
        setStxAddress(addr);
        setIsConnected(true);
      }
    } catch (e) {
      console.error("Wallet connection failed:", e);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    stacksDisconnect();
    setIsConnected(false);
    setStxAddress(null);
    setStxBalance(null);
    setContractBalance(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        stxAddress,
        stxBalance,
        contractBalance,
        connecting,
        connect,
        disconnect,
        refreshBalances,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
