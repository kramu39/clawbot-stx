import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import { transfer } from "@/services/contractService";
import {
  stxToMicroStx,
  formatStx,
  isValidStxAddress,
  explorerTxUrl,
} from "@/utils/conversion";
import { toast } from "sonner";

export function TransferForm() {
  const { isConnected, contractBalance, refreshBalances } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  const parsedAmount = parseFloat(amount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const isRecipientValid = recipient.length > 0 && isValidStxAddress(recipient);
  const isValid = isAmountValid && isRecipientValid;
  const microStx = isAmountValid ? stxToMicroStx(parsedAmount) : 0;

  const handleTransfer = async () => {
    if (!isValid) return;
    setLoading(true);
    setLastTxId(null);
    try {
      const txid = await transfer(microStx, recipient);
      setLastTxId(txid);
      toast.success("Transfer submitted!", {
        description: `Sending ${formatStx(parsedAmount)} STX`,
        action: txid
          ? {
              label: "View TX",
              onClick: () => window.open(explorerTxUrl(txid), "_blank"),
            }
          : undefined,
      });
      setAmount("");
      setRecipient("");
      setTimeout(() => refreshBalances(), 5000);
    } catch (e: any) {
      toast.error("Transfer failed", {
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
              <Send className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Transfer STX</CardTitle>
              <CardDescription>
                Send funds to another user within the contract
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-address">Recipient Address</Label>
            <Input
              id="recipient-address"
              placeholder="ST29VJ…"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.trim())}
              disabled={!isConnected || loading}
              className="font-mono text-sm"
            />
            {recipient.length > 0 && !isRecipientValid && (
              <p className="text-xs text-destructive">
                Invalid Stacks address format
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="transfer-amount">Amount (STX)</Label>
              {contractBalance !== null && (
                <span className="text-xs text-muted-foreground">
                  Balance: {formatStx(contractBalance)} STX
                </span>
              )}
            </div>
            <Input
              id="transfer-amount"
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isConnected || loading}
              className="font-mono text-lg"
            />
            {isAmountValid && (
              <p className="text-xs text-muted-foreground">
                = {microStx.toLocaleString()} microSTX
              </p>
            )}
          </div>

          <Button
            variant="glow"
            className="w-full"
            onClick={handleTransfer}
            disabled={!isConnected || !isValid || loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
            {loading
              ? "Confirming…"
              : !isConnected
              ? "Connect Wallet First"
              : "Transfer"}
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
