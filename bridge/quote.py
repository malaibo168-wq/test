from __future__ import annotations

from dataclasses import dataclass

CHAINS = {
    "ehp": {
        "id": "ehp",
        "name": "EHP",
        "network": "Ethereum (ERC-20)",
        "tokens": ["ETH", "USDT", "USDC"],
        "address_hint": "0x 开头的 EVM 地址",
    },
    "sol": {
        "id": "sol",
        "name": "SOL",
        "network": "Solana",
        "tokens": ["SOL", "USDT", "USDC"],
        "address_hint": "Solana Base58 地址",
    },
    "trc": {
        "id": "trc",
        "name": "TRC",
        "network": "Tron (TRC-20)",
        "tokens": ["TRX", "USDT", "USDC"],
        "address_hint": "T 开头的 Tron 地址",
    },
}

DEFAULT_PRICES = {
    "ETH": 3420.0,
    "SOL": 148.0,
    "TRX": 0.16,
    "USDT": 1.0,
    "USDC": 1.0,
}

DEFAULT_FEE_BPS = 28
MIN_USD = 10.0
MAX_USD = 50_000.0

ETA = {
    ("ehp", "sol"): "约 2–8 分钟",
    ("ehp", "trc"): "约 3–10 分钟",
    ("sol", "ehp"): "约 2–8 分钟",
    ("sol", "trc"): "约 2–6 分钟",
    ("trc", "ehp"): "约 3–10 分钟",
    ("trc", "sol"): "约 2–6 分钟",
}


@dataclass(frozen=True)
class Quote:
    from_chain: str
    from_token: str
    to_chain: str
    to_token: str
    amount_in: float
    amount_out: float
    rate: str
    fee_usd: float
    fee_bps: int
    eta: str
    usd_in: float


def _token_ok(chain: str, token: str) -> bool:
    info = CHAINS.get(chain)
    return bool(info) and token in info["tokens"]


def quote(
    from_chain: str,
    from_token: str,
    to_chain: str,
    to_token: str,
    amount: float,
    prices: dict[str, float] | None = None,
    fee_bps: int | None = None,
) -> Quote:
    if amount <= 0:
        raise ValueError("金额必须大于 0。")
    if from_chain == to_chain and from_token == to_token:
        raise ValueError("请选择不同的资产或链路。")
    if not _token_ok(from_chain, from_token) or not _token_ok(to_chain, to_token):
        raise ValueError("不支持的链路或代币。")

    px = {**DEFAULT_PRICES, **(prices or {})}
    bps = DEFAULT_FEE_BPS if fee_bps is None else int(fee_bps)
    from_px = px.get(from_token)
    to_px = px.get(to_token)
    if not from_px or not to_px:
        raise ValueError("缺少报价。")

    usd = amount * from_px
    if usd < MIN_USD:
        raise ValueError(f"单笔最低约 ${MIN_USD:.0f}。")
    if usd > MAX_USD:
        raise ValueError(f"单笔最高约 ${MAX_USD:,.0f}。")

    fee_usd = usd * bps / 10_000
    out = (usd - fee_usd) / to_px
    same = from_chain == to_chain
    eta = "约 30–90 秒" if same else ETA.get((from_chain, to_chain), "约 5–15 分钟")
    return Quote(
        from_chain=from_chain,
        from_token=from_token,
        to_chain=to_chain,
        to_token=to_token,
        amount_in=amount,
        amount_out=out,
        rate=f"1 {from_token} ≈ {from_px / to_px:.6f} {to_token}",
        fee_usd=round(fee_usd, 4),
        fee_bps=bps,
        eta=eta,
        usd_in=round(usd, 4),
    )


def public_routes() -> list[dict]:
    rows = []
    ids = list(CHAINS)
    for src in ids:
        for dst in ids:
            if src == dst:
                continue
            rows.append(
                {
                    "from": CHAINS[src]["name"],
                    "to": CHAINS[dst]["name"],
                    "eta": ETA.get((src, dst), "约 5–15 分钟"),
                    "pair": f"{src}->{dst}",
                }
            )
    return rows
