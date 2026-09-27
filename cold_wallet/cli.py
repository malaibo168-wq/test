from __future__ import annotations

import argparse
import getpass
import json
import sys
from pathlib import Path

from . import storage, wallet


AIRGAP_BANNER = """
This tool is meant to run on an air-gapped machine.
Do not generate, restore, or sign on a computer that is online.
Do not reuse this demo vault for large amounts of money without an independent audit.
""".strip()


def _password(confirm: bool = False) -> str:
    password = getpass.getpass("Vault password: ")
    if not password:
        raise SystemExit("Password cannot be empty.")
    if confirm:
        again = getpass.getpass("Confirm password: ")
        if password != again:
            raise SystemExit("Passwords do not match.")
    return password


def _load_mnemonic(args: argparse.Namespace) -> str:
    path = Path(args.vault)
    if not path.exists():
        raise SystemExit(f"Vault not found: {path}")
    return storage.load_vault(path, _password())


def cmd_init(args: argparse.Namespace) -> None:
    path = Path(args.vault)
    if path.exists() and not args.force:
        raise SystemExit(f"Vault already exists: {path}. Use --force to overwrite.")
    mnemonic = wallet.generate_mnemonic(256 if args.words == 24 else 128)
    password = _password(confirm=True)
    storage.save_vault(path, mnemonic, password)
    print(AIRGAP_BANNER)
    print()
    print("Write these words on paper. This is the only backup.")
    print(mnemonic)
    print()
    print(f"Encrypted vault written to {path}")
    btc = wallet.bitcoin_address(mnemonic, index=0)
    eth = wallet.ethereum_address(mnemonic, index=0)
    print(f"BTC receive[0]: {btc.address}")
    print(f"ETH receive[0]: {eth.address}")


def cmd_restore(args: argparse.Namespace) -> None:
    path = Path(args.vault)
    if path.exists() and not args.force:
        raise SystemExit(f"Vault already exists: {path}. Use --force to overwrite.")
    mnemonic = " ".join(args.mnemonic) if args.mnemonic else input("Mnemonic: ").strip()
    if not wallet.mnemonic_is_valid(mnemonic):
        raise SystemExit("Invalid mnemonic.")
    password = _password(confirm=True)
    storage.save_vault(path, mnemonic, password)
    print(f"Encrypted vault written to {path}")


def cmd_addresses(args: argparse.Namespace) -> None:
    mnemonic = _load_mnemonic(args)
    passphrase = args.passphrase or ""
    for i in range(args.count):
        if args.coin in ("btc", "all"):
            info = wallet.bitcoin_address(mnemonic, index=i, passphrase=passphrase)
            print(f"BTC {info.path} {info.address}")
        if args.coin in ("eth", "all"):
            info = wallet.ethereum_address(mnemonic, index=i, passphrase=passphrase)
            print(f"ETH {info.path} {info.address}")


def cmd_xpub(args: argparse.Namespace) -> None:
    mnemonic = _load_mnemonic(args)
    print(wallet.bitcoin_xpub(mnemonic, args.passphrase or ""))


def cmd_sign_psbt(args: argparse.Namespace) -> None:
    mnemonic = _load_mnemonic(args)
    psbt = Path(args.psbt).read_text(encoding="utf-8") if args.psbt else sys.stdin.read()
    signed = wallet.sign_bitcoin_psbt(mnemonic, psbt, args.passphrase or "")
    if args.out:
        Path(args.out).write_text(signed + "\n", encoding="utf-8")
        print(f"Signed PSBT written to {args.out}")
    else:
        print(signed)


def cmd_sign_eth(args: argparse.Namespace) -> None:
    mnemonic = _load_mnemonic(args)
    raw = Path(args.tx).read_text(encoding="utf-8") if args.tx else sys.stdin.read()
    tx = json.loads(raw)
    signed = wallet.sign_ethereum_tx(mnemonic, tx, index=args.index, passphrase=args.passphrase or "")
    result = {
        "hash": signed.hash.hex() if hasattr(signed.hash, "hex") else str(signed.hash),
        "raw": wallet.signed_tx_hex(signed),
    }
    print(json.dumps(result, indent=2))


def cmd_wipe(args: argparse.Namespace) -> None:
    path = Path(args.vault)
    storage.wipe_vault(path)
    print(f"Wiped {path}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Offline cold wallet: generate keys, export addresses, sign offline.",
    )
    parser.add_argument(
        "--vault",
        default=str(storage.default_vault_path()),
        help="Encrypted vault path (default: ~/.cold_wallet/vault.bin)",
    )
    parser.add_argument("--passphrase", default="", help="Optional BIP39 passphrase")
    sub = parser.add_subparsers(dest="cmd", required=True)

    init = sub.add_parser("init", help="Generate a new 12/24-word mnemonic")
    init.add_argument("--words", type=int, choices=(12, 24), default=24)
    init.add_argument("--force", action="store_true")
    init.set_defaults(func=cmd_init)

    restore = sub.add_parser("restore", help="Import an existing mnemonic into the vault")
    restore.add_argument("mnemonic", nargs="*")
    restore.add_argument("--force", action="store_true")
    restore.set_defaults(func=cmd_restore)

    addrs = sub.add_parser("addresses", help="Print receive addresses")
    addrs.add_argument("--coin", choices=("btc", "eth", "all"), default="all")
    addrs.add_argument("--count", type=int, default=5)
    addrs.set_defaults(func=cmd_addresses)

    xpub = sub.add_parser("xpub", help="Export Bitcoin account xpub for a watch-only wallet")
    xpub.set_defaults(func=cmd_xpub)

    psbt = sub.add_parser("sign-psbt", help="Sign a Bitcoin PSBT offline")
    psbt.add_argument("--psbt", help="PSBT file (base64). Reads stdin if omitted.")
    psbt.add_argument("--out", help="Write signed PSBT to this file")
    psbt.set_defaults(func=cmd_sign_psbt)

    eth = sub.add_parser("sign-eth", help="Sign an Ethereum transaction JSON offline")
    eth.add_argument("--tx", help="Transaction JSON file. Reads stdin if omitted.")
    eth.add_argument("--index", type=int, default=0)
    eth.set_defaults(func=cmd_sign_eth)

    wipe = sub.add_parser("wipe", help="Overwrite and delete the vault")
    wipe.set_defaults(func=cmd_wipe)
    return parser


def main(argv: list[str] | None = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
