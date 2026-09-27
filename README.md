# Offline cold wallet

Python CLI for **air-gapped** key generation and signing. Create the seed on a machine that never goes online. Move unsigned transactions in (QR, USB, SD card), move signed transactions out. Keep the private key on the offline computer.

This is a compact reference implementation, not an audited product. Do not store large balances on it without an independent review.

## What it does

- Generate a 12- or 24-word BIP39 mnemonic
- Encrypt the seed with Argon2id + AES-256-GCM
- Derive Bitcoin native SegWit addresses (`m/84'/0'/0'`)
- Derive Ethereum addresses (`m/44'/60'/0'`)
- Export a Bitcoin account xpub for a watch-only hot wallet
- Sign a Bitcoin PSBT offline
- Sign an Ethereum transaction JSON offline

## Install

Use a dedicated offline machine (or a live USB OS). Copy this folder with a USB stick, then:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

If the machine has no network, install the wheels from another computer and copy the `pip download` folder over.

## Usage

```bash
# Create a new 24-word wallet (prints the mnemonic once)
python -m cold_wallet init

# Restore from paper backup
python -m cold_wallet restore word1 word2 ... word24

# Receive addresses
python -m cold_wallet addresses --count 5

# Watch-only export for Electrum / Sparrow
python -m cold_wallet xpub

# Sign Bitcoin PSBT created on an online wallet
python -m cold_wallet sign-psbt --psbt unsigned.psbt --out signed.psbt

# Sign Ethereum tx JSON created on an online machine
python -m cold_wallet sign-eth --tx tx.json
```

Example Ethereum `tx.json`:

```json
{
  "chainId": 1,
  "nonce": 0,
  "gas": 21000,
  "maxFeePerGas": 30000000000,
  "maxPriorityFeePerGas": 1000000000,
  "to": "0x0000000000000000000000000000000000000000",
  "value": 0,
  "data": "0x",
  "type": 2
}
```

Broadcast the signed hex on an online node or wallet. Never copy the mnemonic or vault password to that machine.

Default vault path: `~/.cold_wallet/vault.bin`  
Override with `--vault` or `COLD_WALLET_VAULT`.

## Air-gap workflow

1. Offline PC: `init`, write the 24 words on paper, store the paper in a safe.
2. Online PC: import the **xpub or address only**, build an unsigned PSBT / ETH tx.
3. Carry the unsigned file to the offline PC, sign, carry the signed file back.
4. Online PC: broadcast.

## Tests

```bash
python -m pytest tests
```
