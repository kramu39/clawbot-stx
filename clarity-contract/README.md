# STX-Clawbot: Multi-User STX Wallet Contract

> A decentralized wallet smart contract on Stacks that enables bots and users to manage, deposit, withdraw, and transfer STX (Stacks cryptocurrency) with secure balance tracking.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Contract Functions](#contract-functions)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Contract Deployment](#contract-deployment)
- [Security Considerations](#security-considerations)
- [FAQs](#faqs)
- [References](#references)

---

## Overview

**STX-Clawbot** is a smart contract built on the Stacks blockchain using Clarity language. It functions as a multi-user wallet that allows:

- **Users** to deposit and withdraw STX
- **Bots** to spend STX from their wallet balance
- **Everyone** to transfer STX between accounts within the contract
- **Control** over bot authorization and activation

The contract maintains accurate balance records for all accounts and tracks total deposits for transparency.

### Key Characteristics

| Property | Details |
|----------|---------|
| **Network** | Stacks Testnet |
| **Contract Name** | `stx-clawbot` |
| **Language** | Clarity 4 |
| **Deployment Cost** | 0.040360 STX (40,360 microSTX) |
| **Status** | ✅ Deployed & Confirmed |

---

## Features

### ✨ Core Capabilities

1. **Deposit STX** - Add funds to your account balance
2. **Withdraw STX** - Retrieve your funds from the contract
3. **Transfer STX** - Send STX between accounts within the wallet
4. **Bot Spending** - Allow bots to spend from their wallet balance
5. **Bot Authorization** - Manage which bots are active and approved
6. **Balance Tracking** - Query account balances anytime
7. **Deposit Analytics** - View total deposits across all accounts

### 🔒 Security Features

- Account balance validation before transfers
- Prevention of unauthorized withdrawals
- Error handling for invalid amounts (zero or negative)
- Per-account balance isolation
- Principal-based access control

---

## Getting Started

### Prerequisites

- Node.js 16+ or Docker
- Clarinet CLI (`clarinet` command)
- STX for deployment (testnet faucet available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clarity-contract
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify contract syntax**
   ```bash
   clarinet check
   ```
   Expected output: `✔ 1 contract checked`

4. **Run tests**
   ```bash
   npm test
   ```

---

## Contract Functions

### 📤 Public Functions (State-Modifying)

These functions change the contract state and require a transaction.

#### `deposit(amount: uint) → (ok uint) | (err uint)`

Deposit STX into your account balance.

**Parameters:**
- `amount` (uint): Amount of microSTX to deposit (must be > 0)

**Returns:**
- Success: `(ok amount)` - Returns the deposited amount
- Error: `(err u4)` - Invalid amount (must be > 0)

**Example:**
```clarity
(contract-call? .stx-clawbot deposit u1000)
;; Deposits 1000 microSTX
```

---

#### `withdraw(amount: uint) → (ok uint) | (err uint)`

Withdraw STX from your account balance.

**Parameters:**
- `amount` (uint): Amount of microSTX to withdraw (must be > 0)

**Returns:**
- Success: `(ok amount)` - Returns the withdrawn amount
- Error: `(err u2)` - Insufficient balance
- Error: `(err u4)` - Invalid amount (must be > 0)

**Example:**
```clarity
(contract-call? .stx-clawbot withdraw u500)
;; Withdraws 500 microSTX to your address
```

---

#### `transfer(amount: uint, recipient: principal) → (ok uint) | (err uint)`

Transfer STX to another account within the contract.

**Parameters:**
- `amount` (uint): Amount of microSTX to send
- `recipient` (principal): Recipient's Stacks address

**Returns:**
- Success: `(ok amount)` - Returns the transferred amount
- Error: `(err u2)` - Insufficient balance
- Error: `(err u4)` - Invalid amount

**Example:**
```clarity
(contract-call? .stx-clawbot transfer u1000 'ST29VJHHXFPRQMW6W1VDE9NVR4AZ04V44H15082SQ)
;; Transfers 1000 microSTX to the specified address
```

---

#### `bot-spend(amount: uint, recipient: principal) → (ok uint) | (err uint)`

Allow a bot to spend from its balance and send to a recipient.

**Parameters:**
- `amount` (uint): Amount of microSTX to spend
- `recipient` (principal): Recipient's Stacks address

**Returns:**
- Success: `(ok amount)` - Returns the spent amount
- Error: `(err u2)` - Insufficient balance
- Error: `(err u4)` - Invalid amount

**Example:**
```clarity
(contract-call? .stx-clawbot bot-spend u300 'ST3P0AQRGTKY7QPXVYCQFZ0SK3QTSFVXD5V4DYP00)
;; Bot spends 300 microSTX and sends to recipient
```

---

#### `authorize-bot(bot: principal) → (ok bool)`

Mark a bot as authorized in the contract.

**Parameters:**
- `bot` (principal): Bot's Stacks address

**Returns:**
- Success: `(ok true)`

**Example:**
```clarity
(contract-call? .stx-clawbot authorize-bot 'STZG6GZNPJKL5VH6QXK7YNR9NQK85KNMR6GSJ7YD)
```

---

#### `revoke-bot(bot: principal) → (ok bool)`

Remove a bot's authorization status.

**Parameters:**
- `bot` (principal): Bot's Stacks address

**Returns:**
- Success: `(ok true)`

**Example:**
```clarity
(contract-call? .stx-clawbot revoke-bot 'STZG6GZNPJKL5VH6QXK7YNR9NQK85KNMR6GSJ7YD)
```

---

### 📖 Read-Only Functions

These functions query the contract state without modifying it.

#### `get-balance(account: principal) → uint`

Query the STX balance of any account.

**Parameters:**
- `account` (principal): Account's Stacks address

**Returns:**
- Balance in microSTX (returns 0 if account has no balance)

**Example:**
```clarity
(contract-call? .stx-clawbot get-balance 'ST29VJHHXFPRQMW6W1VDE9NVR4AZ04V44H15082SQ)
;; Returns: u5000 (5000 microSTX balance)
```

---

#### `is-bot-authorized(bot: principal) → bool`

Check if a bot is currently authorized.

**Parameters:**
- `bot` (principal): Bot's Stacks address

**Returns:**
- `true` if bot is authorized, `false` otherwise

**Example:**
```clarity
(contract-call? .stx-clawbot is-bot-authorized 'STZG6GZNPJKL5VH6QXK7YNR9NQK85KNMR6GSJ7YD)
;; Returns: true or false
```

---

#### `get-total-deposits() → uint`

Get the total amount of STX deposited across all accounts.

**Parameters:** None

**Returns:**
- Total microSTX deposited

**Example:**
```clarity
(contract-call? .stx-clawbot get-total-deposits)
;; Returns: u50000 (50,000 microSTX total)
```

---

## Usage Examples

### Example 1: User Deposits STX

```bash
# A user deposits 1 STX (1,000,000 microSTX)
contract-call? .stx-clawbot deposit u1000000
# Result: (ok u1000000)

# Check new balance
contract-call? .stx-clawbot get-balance 'ST29VJHHXFPRQMW6W1VDE9NVR4AZ04V44H15082SQ
# Result: u1000000
```

### Example 2: Transfer Between Users

```bash
# User A transfers 0.5 STX to User B
contract-call? .stx-clawbot transfer u500000 'ST3P0AQRGTKY7QPXVYCQFZ0SK3QTSFVXD5V4DYP00

# Check User A's new balance
contract-call? .stx-clawbot get-balance 'ST29VJHHXFPRQMW6W1VDE9NVR4AZ04V44H15082SQ
# Result: u500000 (1,000,000 - 500,000)

# Check User B's new balance
contract-call? .stx-clawbot get-balance 'ST3P0AQRGTKY7QPXVYCQFZ0SK3QTSFVXD5V4DYP00
# Result: u500000
```

### Example 3: Bot Authorization & Spending

```bash
# Admin authorizes a bot
contract-call? .stx-clawbot authorize-bot 'STZG6GZNPJKL5VH6QXK7YNR9NQK85KNMR6GSJ7YD

# Bot deposits funds
contract-call? .stx-clawbot deposit u2000000

# Bot spends from its balance
contract-call? .stx-clawbot bot-spend u500000 'ST3P0AQRGTKY7QPXVYCQFZ0SK3QTSFVXD5V4DYP00

# Check bot balance
contract-call? .stx-clawbot get-balance 'STZG6GZNPJKL5VH6QXK7YNR9NQK85KNMR6GSJ7YD
# Result: u1500000 (2,000,000 - 500,000)
```

---

## Testing

The contract includes comprehensive test coverage with **20+ test cases**.

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### View Test Coverage Report

```bash
npm run test:report
```

### Test Categories

✅ **Deposit Tests**
- Successful deposits
- Balance tracking
- Invalid amount rejection
- Total deposits tracking

✅ **Withdrawal Tests**
- Successful withdrawals
- Balance updates
- Insufficient balance handling

✅ **Transfer Tests**
- Inter-account transfers
- Balance synchronization
- Insufficient balance handling

✅ **Bot Functions**
- Bot spending
- Bot authorization
- Authorization revocation

✅ **Query Tests**
- Balance queries
- Multi-account balances
- Total deposit tracking

---

## Contract Deployment

### On Testnet (Current)

```
Network:            Stacks Testnet
Contract Name:      stx-clawbot
Clarity Version:    4
Epoch:              3.3
Deployment Cost:    0.040360 STX
Status:             ✅ Successfully Deployed
```

### Deployment Command

```bash
clarinet deployment push testnet
```

### Verify Deployment

```bash
clarinet check
# Expected: ✔ 1 contract checked
```

---

## Security Considerations

### ✅ What This Contract Protects Against

1. **Balance Validation**
   - Prevents withdrawals exceeding account balance
   - Validates all amounts are positive

2. **Account Isolation**
   - Each account has separate balance tracking
   - No cross-account interference

3. **Error Handling**
   - Clear error codes for different failure scenarios
   - Prevents partial state changes on errors

### ⚠️ Important Notes

1. **Deposit/Withdrawal Trust Model**
   - Users must trust the contract deployer
   - Always verify contract address before interacting

2. **STX Conservation**
   - The contract maintains a 1:1 STX ratio
   - Total withdrawn ≤ Total deposited

3. **No Admin Keys**
   - Anyone can authorize/revoke bots
   - Bot authorization is transparent but not restricted

### 🔐 Best Practices

- **Always verify contract address** before calling functions
- **Test with small amounts** before large transactions
- **Keep transaction receipts** for audit trails
- **Never share your private key** with the contract

---

## Error Codes

| Code | Name | Meaning |
|------|------|---------|
| `u1` | `ERR-UNAUTHORIZED` | Action not authorized (not used) |
| `u2` | `ERR-INSUFFICIENT-BALANCE` | Account doesn't have enough STX |
| `u3` | `ERR-TRANSFER-FAILED` | Transfer operation failed (not used) |
| `u4` | `ERR-INVALID-AMOUNT` | Amount must be greater than 0 |

---

## FAQs

### Q: How much does it cost to use this contract?

**A:** 
- One-time deployment cost: 0.040360 STX
- Each transaction has standard Stacks network fees (~0.001 STX)
- Balance queries are free (read-only operations)

### Q: Can I withdraw more than I deposited?

**A:** No. The contract will return an error if you attempt to withdraw more than your balance.

### Q: What happens to my STX if the contract fails?

**A:** Your STX is safely stored on-chain. The contract cannot be deleted, so your funds remain recoverable.

### Q: Can the contract owner take my funds?

**A:** No. Only you can withdraw or transfer your own funds. There are no admin withdrawal functions.

### Q: How do I become authorized as a bot?

**A:** Any account can call `authorize-bot` to register itself or another address as a bot. Authorization is voluntary and transparent.

### Q: Is this contract audited?

**A:** This is a reference implementation. For production use, consider a professional security audit.

### Q: What STX amount can I deposit?

**A:** You can deposit any amount up to the uint256 maximum (very large number), but realistically limited by your STX holdings.

---

## Data Storage

### Balances Map

Stores the STX balance for each account:

```clarity
{
  account: principal,
  amount: uint
}
```

### Authorized Bots Map

Tracks which principals are marked as authorized:

```clarity
{
  bot: principal,
  active: bool
}
```

### Total Deposits Variable

Running total of all deposits:
```clarity
uint
```

---

## References

### Documentation

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Clarinet CLI Guide](https://docs.hiro.so/stacks/clarinet)
- [Stacks Testnet Faucet](https://testnet.stacks.org/faucet)

### Network Info

- **Testnet Explorer**: https://testnet-explorer.alexgo.io
- **Stacks Wallet**: https://wallet.hiro.so

### Related Projects

- [Stacks Blockchain](https://github.com/stacks-network/stacks-blockchain)
- [Clarinet SDK](https://github.com/hirosystems/clarinet)

---

## License

This project is provided as-is for educational and reference purposes.

---

## Support

For issues or questions:

1. Check the [FAQs](#faqs) section
2. Review [Security Considerations](#security-considerations)
3. Check contract [Error Codes](#error-codes)
4. Refer to [Clarity Documentation](https://docs.stacks.co/clarity)

---

**Last Updated:** February 7, 2026  
**Contract Status:** ✅ Active on Testnet  
**Version:** 1.0.0
