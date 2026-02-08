import { Wallet, LogOut, Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { shortenAddress } from "@/utils/conversion";

export function WalletConnect() {
  const { isConnected, stxAddress, connecting, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!stxAddress) return;
    await navigator.clipboard.writeText(stxAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <Button variant="glow" onClick={connect} disabled={connecting}>
        {connecting ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Wallet />
        )}
        {connecting ? "Connecting…" : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2 font-mono text-xs text-accent-foreground transition-colors hover:border-primary/40"
      >
        {copied ? (
          <Check className="h-3 w-3 text-primary" />
        ) : (
          <Copy className="h-3 w-3 text-muted-foreground" />
        )}
        {stxAddress ? shortenAddress(stxAddress) : "—"}
      </button>
      <Button variant="ghost" size="icon" onClick={disconnect} title="Disconnect">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
