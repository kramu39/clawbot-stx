import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  ShieldCheck,
  ShieldOff,
  Search,
  Loader2,
  Send,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/contexts/WalletContext";
import {
  authorizeBot,
  revokeBot,
  isBotAuthorized,
  botSpend,
} from "@/services/contractService";
import {
  isValidStxAddress,
  stxToMicroStx,
  formatStx,
  explorerTxUrl,
} from "@/utils/conversion";
import { toast } from "sonner";

export function BotManagement() {
  const { isConnected } = useWallet();

  // Authorize Bot
  const [authBotAddr, setAuthBotAddr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Revoke Bot
  const [revokeBotAddr, setRevokeBotAddr] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);

  // Check Bot
  const [checkBotAddr, setCheckBotAddr] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<boolean | null>(null);

  // Bot Spend
  const [spendRecipient, setSpendRecipient] = useState("");
  const [spendAmount, setSpendAmount] = useState("");
  const [spendLoading, setSpendLoading] = useState(false);

  const handleAuthorize = async () => {
    if (!isValidStxAddress(authBotAddr)) return;
    setAuthLoading(true);
    try {
      const txid = await authorizeBot(authBotAddr);
      toast.success("Bot authorization submitted!", {
        action: txid
          ? { label: "View TX", onClick: () => window.open(explorerTxUrl(txid), "_blank") }
          : undefined,
      });
      setAuthBotAddr("");
    } catch (e: any) {
      toast.error("Authorization failed", { description: e?.message });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!isValidStxAddress(revokeBotAddr)) return;
    setRevokeLoading(true);
    try {
      const txid = await revokeBot(revokeBotAddr);
      toast.success("Bot revocation submitted!", {
        action: txid
          ? { label: "View TX", onClick: () => window.open(explorerTxUrl(txid), "_blank") }
          : undefined,
      });
      setRevokeBotAddr("");
    } catch (e: any) {
      toast.error("Revocation failed", { description: e?.message });
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!isValidStxAddress(checkBotAddr)) return;
    setCheckLoading(true);
    setCheckResult(null);
    try {
      const result = await isBotAuthorized(checkBotAddr);
      setCheckResult(result);
    } catch (e: any) {
      toast.error("Check failed", { description: e?.message });
    } finally {
      setCheckLoading(false);
    }
  };

  const handleBotSpend = async () => {
    const parsedAmount = parseFloat(spendAmount);
    if (!isValidStxAddress(spendRecipient) || isNaN(parsedAmount) || parsedAmount <= 0) return;
    setSpendLoading(true);
    try {
      const txid = await botSpend(stxToMicroStx(parsedAmount), spendRecipient);
      toast.success("Bot spend submitted!", {
        description: `Spending ${formatStx(parsedAmount)} STX`,
        action: txid
          ? { label: "View TX", onClick: () => window.open(explorerTxUrl(txid), "_blank") }
          : undefined,
      });
      setSpendAmount("");
      setSpendRecipient("");
    } catch (e: any) {
      toast.error("Bot spend failed", { description: e?.message });
    } finally {
      setSpendLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-4"
    >
      {/* Authorize Bot */}
      <Card className="border-glow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Authorize Bot</CardTitle>
              <CardDescription>Grant a bot address spending permissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Bot address (ST…)"
            value={authBotAddr}
            onChange={(e) => setAuthBotAddr(e.target.value.trim())}
            disabled={!isConnected || authLoading}
            className="font-mono text-sm"
          />
          <Button
            variant="glow"
            onClick={handleAuthorize}
            disabled={!isConnected || !isValidStxAddress(authBotAddr) || authLoading}
          >
            {authLoading ? <Loader2 className="animate-spin" /> : "Authorize"}
          </Button>
        </CardContent>
      </Card>

      {/* Revoke Bot */}
      <Card className="border-glow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-base">Revoke Bot</CardTitle>
              <CardDescription>Remove bot authorization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Bot address (ST…)"
            value={revokeBotAddr}
            onChange={(e) => setRevokeBotAddr(e.target.value.trim())}
            disabled={!isConnected || revokeLoading}
            className="font-mono text-sm"
          />
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={!isConnected || !isValidStxAddress(revokeBotAddr) || revokeLoading}
          >
            {revokeLoading ? <Loader2 className="animate-spin" /> : "Revoke"}
          </Button>
        </CardContent>
      </Card>

      {/* Check Bot Status */}
      <Card className="border-glow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Check Bot Status</CardTitle>
              <CardDescription>Verify if a bot is authorized</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Bot address (ST…)"
              value={checkBotAddr}
              onChange={(e) => {
                setCheckBotAddr(e.target.value.trim());
                setCheckResult(null);
              }}
              disabled={checkLoading}
              className="font-mono text-sm"
            />
            <Button
              variant="outline-glow"
              onClick={handleCheck}
              disabled={!isValidStxAddress(checkBotAddr) || checkLoading}
            >
              {checkLoading ? <Loader2 className="animate-spin" /> : "Check"}
            </Button>
          </div>
          {checkResult !== null && (
            <div
              className={`rounded-lg p-3 text-sm font-medium ${
                checkResult
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <Bot className="mr-1.5 inline h-4 w-4" />
              {checkResult ? "Bot is authorized ✓" : "Bot is NOT authorized ✗"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bot Spend */}
      <Card className="border-glow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-secondary" />
            <div>
              <CardTitle className="text-base">Bot Spend</CardTitle>
              <CardDescription>Spend from bot balance to a recipient</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Recipient Address</Label>
            <Input
              placeholder="Recipient (ST…)"
              value={spendRecipient}
              onChange={(e) => setSpendRecipient(e.target.value.trim())}
              disabled={!isConnected || spendLoading}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Amount (STX)</Label>
            <Input
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.00"
              value={spendAmount}
              onChange={(e) => setSpendAmount(e.target.value)}
              disabled={!isConnected || spendLoading}
              className="font-mono"
            />
          </div>
          <Button
            variant="glow-amber"
            className="w-full"
            onClick={handleBotSpend}
            disabled={
              !isConnected ||
              !isValidStxAddress(spendRecipient) ||
              isNaN(parseFloat(spendAmount)) ||
              parseFloat(spendAmount) <= 0 ||
              spendLoading
            }
          >
            {spendLoading ? <Loader2 className="animate-spin" /> : <Send />}
            {spendLoading ? "Confirming…" : "Bot Spend"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
