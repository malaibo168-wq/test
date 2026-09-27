from __future__ import annotations

import os
from dataclasses import dataclass

from embit import bip32, bip39, script
from embit.networks import NETWORKS
from eth_account import Account
from eth_account.datastructures import SignedTransaction
from hexbytes import HexBytes

BTC_ACCOUNT_PATH = "m/84h/0h/0h"
ETH_ACCOUNT_PATH = "m/44'/60'/0'"


@dataclass(frozen=True)
class AddressInfo:
    path: str
    address: str
    public_key: str


def generate_mnemonic(strength_bits: int = 256) -> str:
    if strength_bits not in (128, 256):
        raise ValueError("Use 128 bits (12 words) or 256 bits (24 words).")
    return bip39.mnemonic_from_bytes(os.urandom(strength_bits // 8))


def mnemonic_is_valid(mnemonic: str) -> bool:
    try:
        return bip39.mnemonic_is_valid(mnemonic)
    except Exception:
        return False


def seed_from_mnemonic(mnemonic: str, passphrase: str = "") -> bytes:
    if not mnemonic_is_valid(mnemonic):
        raise ValueError("Invalid BIP39 mnemonic.")
    return bip39.mnemonic_to_seed(mnemonic, passphrase)


def _root_from_mnemonic(mnemonic: str, passphrase: str = "") -> bip32.HDKey:
    seed = seed_from_mnemonic(mnemonic, passphrase)
    return bip32.HDKey.from_seed(seed, version=NETWORKS["main"]["xprv"])


def bitcoin_account(mnemonic: str, passphrase: str = "") -> bip32.HDKey:
    return _root_from_mnemonic(mnemonic, passphrase).derive(BTC_ACCOUNT_PATH)


def bitcoin_xpub(mnemonic: str, passphrase: str = "") -> str:
    account = bitcoin_account(mnemonic, passphrase)
    return account.to_public().to_string()


def bitcoin_address(
    mnemonic: str,
    index: int = 0,
    change: bool = False,
    passphrase: str = "",
) -> AddressInfo:
    if index < 0:
        raise ValueError("Address index must be >= 0.")
    account = bitcoin_account(mnemonic, passphrase)
    branch = 1 if change else 0
    child = account.derive([branch, index])
    addr = script.p2wpkh(child).address()
    path = f"{BTC_ACCOUNT_PATH}/{branch}/{index}"
    return AddressInfo(path=path, address=addr, public_key=child.sec().hex())


def ethereum_address(
    mnemonic: str,
    index: int = 0,
    passphrase: str = "",
) -> AddressInfo:
    if index < 0:
        raise ValueError("Address index must be >= 0.")
    Account.enable_unaudited_hdwallet_features()
    path = f"{ETH_ACCOUNT_PATH}/0/{index}"
    acct = Account.from_mnemonic(mnemonic, account_path=path, passphrase=passphrase)
    return AddressInfo(
        path=path,
        address=acct.address,
        public_key=acct._key_obj.public_key.to_hex(),
    )


def sign_bitcoin_psbt(mnemonic: str, psbt_b64: str, passphrase: str = "") -> str:
    from embit.psbt import PSBT

    root = _root_from_mnemonic(mnemonic, passphrase)
    psbt = PSBT.from_string(psbt_b64.strip())
    psbt.sign_with(root)
    return psbt.to_string()


def sign_ethereum_tx(
    mnemonic: str,
    tx: dict,
    index: int = 0,
    passphrase: str = "",
) -> SignedTransaction:
    Account.enable_unaudited_hdwallet_features()
    path = f"{ETH_ACCOUNT_PATH}/0/{index}"
    acct = Account.from_mnemonic(mnemonic, account_path=path, passphrase=passphrase)
    raw = dict(tx)
    if "nonce" in raw and isinstance(raw["nonce"], str):
        raw["nonce"] = int(raw["nonce"], 0)
    if "chainId" in raw:
        raw["chainId"] = int(raw["chainId"], 0) if isinstance(raw["chainId"], str) else raw["chainId"]
    signed = acct.sign_transaction(raw)
    return signed


def signed_tx_hex(signed: SignedTransaction) -> str:
    raw = signed.raw_transaction if hasattr(signed, "raw_transaction") else signed.rawTransaction
    return HexBytes(raw).hex()
