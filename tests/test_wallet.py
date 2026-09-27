from pathlib import Path

from cold_wallet.storage import load_vault, save_vault, wipe_vault
from cold_wallet.wallet import bitcoin_address, ethereum_address, mnemonic_is_valid

# BIP39 12-word test vector
MNEMONIC = " ".join(["abandon"] * 11 + ["about"])


def test_mnemonic_valid():
    assert mnemonic_is_valid(MNEMONIC)


def test_bitcoin_first_receive():
    info = bitcoin_address(MNEMONIC, index=0)
    assert info.address == "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu"


def test_ethereum_first_receive():
    info = ethereum_address(MNEMONIC, index=0)
    assert info.address.lower() == "0x9858effd232b4033e47d90003d41ec34ecaeda94"


def test_vault_roundtrip(tmp_path: Path):
    vault = tmp_path / "vault.bin"
    save_vault(vault, MNEMONIC, "correct-horse")
    assert load_vault(vault, "correct-horse") == MNEMONIC
    wipe_vault(vault)
    assert not vault.exists()

