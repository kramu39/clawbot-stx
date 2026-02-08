import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Landmark, TrendingUp, RefreshCw, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { getTotalDeposits } from "@/services/contractService";
import { formatStx } from "@/utils/conversion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function Dashboard() {
  const { isConnected, stxAddress, stxBalance, contractBalance, refreshBalances } =
    useWallet();
  const [totalDeposits, setTotalDeposits] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTotalDeposits = async () => {
    try {
      const total = await getTotalDeposits();
      setTotalDeposits(total);
    } catch (e) {
      console.error("Failed to fetch total deposits:", e);
    }
  };

  useEffect(() => {
    fetchTotalDeposits();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshBalances(), fetchTotalDeposits()]);
    setRefreshing(false);
  };

  const stats = [
    {
      label: "Contract Balance",
      value: contractBalance !== null ? `${formatStx(contractBalance)} STX` : "—",
      icon: Landmark,
      description: "Your deposited balance in the contract",
      accent: "primary" as const,
    },
    {
      label: "STX Wallet Balance",
      value: stxBalance !== null ? `${formatStx(stxBalance)} STX` : "—",
      icon: Coins,
      description: "Available balance on-chain",
      accent: "secondary" as const,
    },
    {
      label: "Total Protocol Deposits",
      value: totalDeposits !== null ? `${formatStx(totalDeposits)} STX` : "—",
      icon: TrendingUp,
      description: "Total deposits across all users",
      accent: "primary" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {isConnected
              ? "Overview of your balances and protocol stats"
              : "Connect your wallet to view balances"}
          </p>
        </div>
        <Button
          variant="outline-glow"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="border-glow overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        stat.accent === "primary"
                          ? "text-primary"
                          : "text-secondary"
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-2 ${
                      stat.accent === "primary"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contract Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card className="border-glow">
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Contract Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">Contract</span>
                <code className="font-mono text-xs text-accent-foreground">
                  stx-clawbot
                </code>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">Network</span>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Testnet
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground">Explorer</span>
                <a
                  href="https://explorer.hiro.so/txid/ST29VJHHXFPRQMW6W1VDE9NVR4AZ04V44H15082SQ.stx-clawbot?chain=testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View on Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
