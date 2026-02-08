import { motion } from "framer-motion";
import { Bot, LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Send, Cpu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletConnect } from "@/components/stx/WalletConnect";
import { Dashboard } from "@/components/stx/Dashboard";
import { DepositForm } from "@/components/stx/DepositForm";
import { WithdrawForm } from "@/components/stx/WithdrawForm";
import { TransferForm } from "@/components/stx/TransferForm";
import { BotManagement } from "@/components/stx/BotManagement";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-foreground">
                STX-Claw<span className="text-primary text-glow">bot</span>
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Stacks Testnet
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WalletConnect />
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="inline-flex h-11 w-full justify-start gap-1 overflow-x-auto bg-muted/50 p-1 sm:w-auto">
              <TabsTrigger
                value="dashboard"
                className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-glow"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger
                value="deposit"
                className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-glow"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Deposit</span>
              </TabsTrigger>
              <TabsTrigger
                value="withdraw"
                className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-secondary data-[state=active]:shadow-glow-amber"
              >
                <ArrowUpFromLine className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Withdraw</span>
              </TabsTrigger>
              <TabsTrigger
                value="transfer"
                className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-glow"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Transfer</span>
              </TabsTrigger>
              <TabsTrigger
                value="bots"
                className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-glow"
              >
                <Cpu className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Bots</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
            <TabsContent value="deposit">
              <DepositForm />
            </TabsContent>
            <TabsContent value="withdraw">
              <WithdrawForm />
            </TabsContent>
            <TabsContent value="transfer">
              <TransferForm />
            </TabsContent>
            <TabsContent value="bots">
              <BotManagement />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-4">
        <div className="container text-center text-xs text-muted-foreground">
          STX-Clawbot on Stacks Testnet •{" "}
          <a
            href="https://explorer.hiro.so/txid/ST29VJHHXFPRQMW6W1VDE9NVR4AZ04V44H15082SQ.stx-clawbot?chain=testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View Contract
          </a>
        </div>
      </footer>
    </div>
  );
}
