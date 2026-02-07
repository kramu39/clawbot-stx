import { describe, it, expect, beforeEach } from "vitest";
import { Clarinet, Tx, Chain, Account } from "@stacks/clarinet-sdk";

describe("stx-clawbot contract", () => {
  let chain: Chain;
  let accounts: Map<string, Account>;

  beforeEach(async () => {
    const simnet = await Clarinet.test();
    chain = simnet.chain;
    accounts = simnet.accounts;
  });

  describe("Deposit Function", () => {
    it("should deposit STX successfully", () => {
      const user = accounts.get("wallet_1")!;
      const depositAmount = 1000;

      const receipt = chain.txSender(user).callPublicFn(
        "stx-clawbot",
        "deposit",
        [`u${depositAmount}`]
      );

      expect(receipt.isOk()).toBeTruthy();
      expect(receipt.result).toEqual(`(ok u${depositAmount})`);
    });

    it("should increase balance after deposit", () => {
      const user = accounts.get("wallet_1")!;
      const depositAmount = 1000;

      chain.txSender(user).callPublicFn("stx-clawbot", "deposit", [`u${depositAmount}`]);

      const balanceReceipt = chain.callReadOnlyFn(
        "stx-clawbot",
        "get-balance",
        [`'${user.address}`]
      );

      expect(balanceReceipt.result).toEqual(`u${depositAmount}`);
    });

    it("should reject zero or negative deposit", () => {
      const user = accounts.get("wallet_1")!;

      const receipt = chain.txSender(user).callPublicFn(
        "stx-clawbot",
        "deposit",
        ["u0"]
      );

      expect(receipt.isErr()).toBeTruthy();
    });

    it("should track total deposits", () => {
      const user1 = accounts.get("wallet_1")!;
      const user2 = accounts.get("wallet_2")!;

      chain.txSender(user1).callPublicFn("stx-clawbot", "deposit", ["u500"]);
      chain.txSender(user2).callPublicFn("stx-clawbot", "deposit", ["u300"]);

      const totalReceipt = chain.callReadOnlyFn(
        "stx-clawbot",
        "get-total-deposits",
        []
      );

      expect(totalReceipt.result).toEqual("u800");
    });
  });

  describe("Withdraw Function", () => {
    it("should withdraw STX successfully", () => {
      const user = accounts.get("wallet_1")!;
      const depositAmount = 1000;
      const withdrawAmount = 500;

      chain.txSender(user).callPublicFn("stx-clawbot", "deposit", [`u${depositAmount}`]);

      const receipt = chain.txSender(user).callPublicFn(
        "stx-clawbot",
        "withdraw",
        [`u${withdrawAmount}`]
      );

      expect(receipt.isOk()).toBeTruthy();
      expect(receipt.result).toEqual(`(ok u${withdrawAmount})`);
    });

    it("should decrease balance after withdrawal", () => {
      const user = accounts.get("wallet_1")!;
      const depositAmount = 1000;
      const withdrawAmount = 300;

      chain.txSender(user).callPublicFn("stx-clawbot", "deposit", [`u${depositAmount}`]);
      chain.txSender(user).callPublicFn("stx-clawbot", "withdraw", [`u${withdrawAmount}`]);

      const balanceReceipt = chain.callReadOnlyFn(
        "stx-clawbot",
        "get-balance",
        [`'${user.address}`]
      );

      expect(balanceReceipt.result).toEqual(`u${depositAmount - withdrawAmount}`);
    });

    it("should reject withdrawal with insufficient balance", () => {
      const user = accounts.get("wallet_1")!;

      chain.txSender(user).callPublicFn("stx-clawbot", "deposit", ["u100"]);

      const receipt = chain.txSender(user).callPublicFn(
        "stx-clawbot",
        "withdraw",
        ["u200"]
      );

      expect(receipt.isErr()).toBeTruthy();
    });
  });

  describe("Transfer Function", () => {
    it("should transfer STX between accounts", () => {
      const sender = accounts.get("wallet_1")!;
      const recipient = accounts.get("wallet_2")!;
      const transferAmount = 500;

      chain.txSender(sender).callPublicFn("stx-clawbot", "deposit", ["u1000"]);

      const receipt = chain.txSender(sender).callPublicFn(
        "stx-clawbot",
        "transfer",
        [`u${transferAmount}`, `'${recipient.address}`]
      );

      expect(receipt.isOk()).toBeTruthy();
    });

    it("should update balances after transfer", () => {
      const sender = accounts.get("wallet_1")!;
      const recipient = accounts.get("wallet_2")!;
      const transferAmount = 300;

      chain.txSender(sender).callPublicFn("stx-clawbot", "deposit", ["u1000"]);
      chain.txSender(sender).callPublicFn(
        "stx-clawbot",
        "transfer",
        [`u${transferAmount}`, `'${recipient.address}`]
      );

      const senderBalance = chain.callReadOnlyFn(
        "stx-clawbot",
        "get-balance",
        [`'${sender.address}`]
      );
      const recipientBalance = chain.callReadOnlyFn(
        "stx-clawbot",
        "get-balance",
        [`'${recipient.address}`]
      );

      expect(senderBalance.result).toEqual("u700");
      expect(recipientBalance.result).toEqual(`u${transferAmount}`);
    });

    it("should reject transfer with insufficient balance", () => {
      const sender = accounts.get("wallet_1")!;
      const recipient = accounts.get("wallet_2")!;

      chain.txSender(sender).callPublicFn("stx-clawbot", "deposit", ["u100"]);

      const receipt = chain.txSender(sender).callPublicFn(
        "stx-clawbot",
        "transfer",
        ["u200", `'${recipient.address}`]
      );

      expect(receipt.isErr()).toBeTruthy();
    });
  });

  describe("Bot Spend Function", () => {
    it("should allow bot to spend from their balance", () => {
      const bot = accounts.get("wallet_1")!;
      const recipient = accounts.get("wallet_2")!;

      chain.txSender(bot).callPublicFn("stx-clawbot", "deposit", ["u1000"]);

      const receipt = chain.txSender(bot).callPublicFn(
        "stx-clawbot",
        "bot-spend",
        ["u500", `'${recipient.address}`]
      );

      expect(receipt.isOk()).toBeTruthy();
    });

    it("should deduct from bot balance after spend", () => {
      const bot = accounts.get("wallet_1")!;
      const recipient = accounts.get("wallet_2")!;
      const spendAmount = 400;

      chain.txSender(bot).callPublicFn("stx-clawbot", "deposit", ["u1000"]);
      chain.txSender(bot).callPublicFn(
        "stx-clawbot",
        "bot-spend",
        [`u${spendAmount}`, `'${recipient.address}`]
      );

      const botBalance = chain.callReadOnlyFn(
        "stx-clawbot",
        "get-balance",
        [`'${bot.address}`]
      );

      expect(botBalance.result).toEqual(`u${1000 - spendAmount}`);
    });

    it("should reject bot spend with insufficient balance", () => {
      const bot = accounts.get("wallet_1")!;
      const recipient = accounts.get("wallet_2")!;

      chain.txSender(bot).callPublicFn("stx-clawbot", "deposit", ["u100"]);

      const receipt = chain.txSender(bot).callPublicFn(
        "stx-clawbot",
        "bot-spend",
        ["u500", `'${recipient.address}`]
      );

      expect(receipt.isErr()).toBeTruthy();
    });
  });

  describe("Bot Authorization Functions", () => {
    it("should authorize a bot", () => {
      const bot = accounts.get("wallet_1")!;
      const deployer = accounts.get("deployer")!;

      const receipt = chain.txSender(deployer).callPublicFn(
        "stx-clawbot",
        "authorize-bot",
        [`'${bot.address}`]
      );

      expect(receipt.isOk()).toBeTruthy();
    });

    it("should verify bot authorization status", () => {
      const bot = accounts.get("wallet_1")!;
      const deployer = accounts.get("deployer")!;

      chain.txSender(deployer).callPublicFn(
        "stx-clawbot",
        "authorize-bot",
        [`'${bot.address}`]
      );

      const isAuthorized = chain.callReadOnlyFn(
        "stx-clawbot",
        "is-bot-authorized",
        [`'${bot.address}`]
      );

      expect(isAuthorized.result).toEqual("true");
    });

    it("should revoke bot authorization", () => {
      const bot = accounts.get("wallet_1")!;
      const deployer = accounts.get("deployer")!;

      chain.txSender(deployer).callPublicFn(
        "stx-clawbot",
        "authorize-bot",
        [`'${bot.address}`]
      );
      chain.txSender(deployer).callPublicFn(
        "stx-clawbot",
        "revoke-bot",
        [`'${bot.address}`]
      );

      const isAuthorized = chain.callReadOnlyFn(
        "stx-clawbot",
        "is-bot-authorized",
        [`'${bot.address}`]
      );

      expect(isAuthorized.result).toEqual("false");
    });
  });

  describe("Balance Queries", () => {
    it("should return zero for non-existent account", () => {
      const fakeAccount = "ST3P0AQRGTKY7QPXVYCQFZ0SK3QTSFVXD5V4DYP00";

      const balance = chain.callReadOnlyFn(
        "stx-clawbot",
        "get-balance",
        [`'${fakeAccount}`]
      );

      expect(balance.result).toEqual("u0");
    });

    it("should return correct balance for multiple users", () => {
      const user1 = accounts.get("wallet_1")!;
      const user2 = accounts.get("wallet_2")!;
      const user3 = accounts.get("wallet_3")!;

      chain.txSender(user1).callPublicFn("stx-clawbot", "deposit", ["u1000"]);
      chain.txSender(user2).callPublicFn("stx-clawbot", "deposit", ["u2000"]);
      chain.txSender(user3).callPublicFn("stx-clawbot", "deposit", ["u3000"]);

      const balance1 = chain.callReadOnlyFn(
        "stx-clawbot",
        "get-balance",
        [`'${user1.address}`]
      );
      const balance2 = chain.callReadOnlyFn(
        "stx-clawbot",
        "get-balance",
        [`'${user2.address}`]
      );
      const balance3 = chain.callReadOnlyFn(
        "stx-clawbot",
        "get-balance",
        [`'${user3.address}`]
      );

      expect(balance1.result).toEqual("u1000");
      expect(balance2.result).toEqual("u2000");
      expect(balance3.result).toEqual("u3000");
    });
  });
});
