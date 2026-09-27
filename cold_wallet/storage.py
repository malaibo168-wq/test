from __future__ import annotations

import json
import os
import secrets
from dataclasses import dataclass
from pathlib import Path

from argon2.low_level import Type, hash_secret_raw
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

VAULT_VERSION = 1
ARGON2_TIME_COST = 3
ARGON2_MEMORY_KIB = 64 * 1024
ARGON2_PARALLELISM = 2
KEY_LEN = 32
SALT_LEN = 16
NONCE_LEN = 12


@dataclass(frozen=True)
class VaultPayload:
    mnemonic: str
    created_unix: int


def default_vault_path() -> Path:
    override = os.environ.get("COLD_WALLET_VAULT")
    if override:
        return Path(override).expanduser()
    return Path.home() / ".cold_wallet" / "vault.bin"


def _derive_key(password: str, salt: bytes) -> bytes:
    return hash_secret_raw(
        secret=password.encode("utf-8"),
        salt=salt,
        time_cost=ARGON2_TIME_COST,
        memory_cost=ARGON2_MEMORY_KIB,
        parallelism=ARGON2_PARALLELISM,
        hash_len=KEY_LEN,
        type=Type.ID,
    )


def save_vault(path: Path, mnemonic: str, password: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    salt = secrets.token_bytes(SALT_LEN)
    nonce = secrets.token_bytes(NONCE_LEN)
    key = _derive_key(password, salt)
    plaintext = json.dumps(
        {"version": VAULT_VERSION, "mnemonic": mnemonic},
        separators=(",", ":"),
    ).encode("utf-8")
    ciphertext = AESGCM(key).encrypt(nonce, plaintext, None)
    path.write_bytes(b"CWLT" + bytes([VAULT_VERSION]) + salt + nonce + ciphertext)
    os.chmod(path, 0o600)


def load_vault(path: Path, password: str) -> str:
    raw = path.read_bytes()
    if len(raw) < 4 + 1 + SALT_LEN + NONCE_LEN + 16 or raw[:4] != b"CWLT":
        raise ValueError("Vault file is missing or corrupted.")
    version = raw[4]
    if version != VAULT_VERSION:
        raise ValueError(f"Unsupported vault version: {version}")
    salt = raw[5 : 5 + SALT_LEN]
    nonce = raw[5 + SALT_LEN : 5 + SALT_LEN + NONCE_LEN]
    ciphertext = raw[5 + SALT_LEN + NONCE_LEN :]
    key = _derive_key(password, salt)
    try:
        plaintext = AESGCM(key).decrypt(nonce, ciphertext, None)
    except Exception as exc:
        raise ValueError("Wrong password or corrupted vault.") from exc
    data = json.loads(plaintext.decode("utf-8"))
    mnemonic = data.get("mnemonic")
    if not isinstance(mnemonic, str) or not mnemonic:
        raise ValueError("Vault does not contain a mnemonic.")
    return mnemonic


def wipe_vault(path: Path) -> None:
    if not path.exists():
        return
    size = path.stat().st_size
    with path.open("r+b") as handle:
        handle.write(os.urandom(size))
        handle.flush()
        os.fsync(handle.fileno())
    path.unlink()
