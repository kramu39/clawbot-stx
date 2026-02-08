import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { deposit } from "@/services/contractService";
import { stxToMicroStx, formatStx, explorerTxUrl } from "@/utils/conversion";
import { toast } from "sonner";

export function DepositForm() {
  const { isConnected, stxBalance, refreshBalances } = useWallet();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const parsedAmount = parseFloat(amount);
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const microStx = isValid ? stxToMicroStx(parsedAmount) : 0;

  const handleDeposit = async () => {
    if (!isValid) return;
    setLoading(true);
    setLastTxId(null);
    try {
      const txid = await deposit(microStx);
      setLastTxId(txid);
      toast.success("Deposit submitted!", {
        description: `Depositing ${formatStx(parsedAmount)} STX`,
        action: txid
          ? {
              label: "View TX",
              onClick: () => window.open(explorerTxUrl(txid), "_blank"),
            }
          : undefined,
      });
      setAmount("");
      setTimeout(() => refreshBalances(), 5000);
    } catch (e: any) {
      toast.error("Deposit failed", {
        description: e?.message || "Transaction was rejected or failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-glow mx-auto max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Deposit STX</CardTitle>
              <CardDescription>Add funds to your contract balance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="deposit-amount">Amount (STX)</Label>
              {stxBalance !== null && (
                <button
                  type="button"
                  onClick={() => setAmount(String(stxBalance))}
                  className="text-xs text-primary hover:underline"
                >
                  Max: {formatStx(stxBalance)} STX
                </button>
              )}
            </div>
            <Input
              id="deposit-amount"
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isConnected || loading}
              className="font-mono text-lg"
            />
            {isValid && (
              <p className="text-xs text-muted-foreground">
                = {microStx.toLocaleString()} microSTX
              </p>
            )}
          </div>

          <Button
            variant="glow"
            className="w-full"
            onClick={handleDeposit}
            disabled={!isConnected || !isValid || loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowDownToLine />}
            {loading ? "Confirming…" : !isConnected ? "Connect Wallet First" : "Deposit"}
          </Button>

          {lastTxId && (
            <a
              href={explorerTxUrl(lastTxId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
            >
              View transaction <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
