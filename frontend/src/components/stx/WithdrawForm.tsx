import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpFromLine, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { withdraw } from "@/services/contractService";
import { stxToMicroStx, formatStx, explorerTxUrl } from "@/utils/conversion";
import { toast } from "sonner";

export function WithdrawForm() {
  const { isConnected, contractBalance, refreshBalances } = useWallet();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const parsedAmount = parseFloat(amount);
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const microStx = isValid ? stxToMicroStx(parsedAmount) : 0;
  const exceedsBalance =
    isValid && contractBalance !== null && parsedAmount > contractBalance;

  const handleWithdraw = async () => {
    if (!isValid || exceedsBalance) return;
    setLoading(true);
    setLastTxId(null);
    try {
      const txid = await withdraw(microStx);
      setLastTxId(txid);
      toast.success("Withdrawal submitted!", {
        description: `Withdrawing ${formatStx(parsedAmount)} STX`,
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
      toast.error("Withdrawal failed", {
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
            <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
              <ArrowUpFromLine className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Withdraw STX</CardTitle>
              <CardDescription>Remove funds from your contract balance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {contractBalance !== null && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Available to withdraw</p>
              <p className="font-mono text-lg font-semibold text-secondary">
                {formatStx(contractBalance)} STX
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="withdraw-amount">Amount (STX)</Label>
              {contractBalance !== null && (
                <button
                  type="button"
                  onClick={() => setAmount(String(contractBalance))}
                  className="text-xs text-primary hover:underline"
                >
                  Max
                </button>
              )}
            </div>
            <Input
              id="withdraw-amount"
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isConnected || loading}
              className="font-mono text-lg"
            />
            {exceedsBalance && (
              <p className="text-xs text-destructive">Exceeds available balance</p>
            )}
            {isValid && !exceedsBalance && (
              <p className="text-xs text-muted-foreground">
                = {microStx.toLocaleString()} microSTX
              </p>
            )}
          </div>

          <Button
            variant="glow-amber"
            className="w-full"
            onClick={handleWithdraw}
            disabled={!isConnected || !isValid || exceedsBalance || loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : <ArrowUpFromLine />}
            {loading
              ? "Confirming…"
              : !isConnected
              ? "Connect Wallet First"
              : "Withdraw"}
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
