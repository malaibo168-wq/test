const CHAINS = [
  { id: "solana", name: "Solana", tokens: ["SOL", "USDT", "USDC"] },
  { id: "ethereum", name: "Ethereum", tokens: ["ETH", "USDT", "USDC", "WBTC"] },
  { id: "bsc", name: "BNB Chain", tokens: ["BNB", "USDT", "USDC"] },
  { id: "polygon", name: "Polygon", tokens: ["MATIC", "USDT", "USDC"] },
  { id: "arbitrum", name: "Arbitrum", tokens: ["ETH", "USDT", "USDC", "ARB"] },
  { id: "optimism", name: "Optimism", tokens: ["ETH", "USDT", "USDC", "OP"] },
  { id: "base", name: "Base", tokens: ["ETH", "USDC"] },
  { id: "bitcoin", name: "Bitcoin", tokens: ["BTC"] },
  { id: "tron", name: "Tron", tokens: ["TRX", "USDT"] },
];

const PRICES = {
  ETH: 3420,
  BTC: 97200,
  WBTC: 97150,
  BNB: 585,
  SOL: 148,
  MATIC: 0.52,
  ARB: 0.78,
  OP: 1.62,
  TRX: 0.16,
  USDT: 1,
  USDC: 1,
};

const BRIDGES = ["Stargate", "LayerZero", "Axelar", "Wormhole", "THORChain", "Across"];

const state = {
  from: { chain: "solana", token: "SOL" },
  to: { chain: "bsc", token: "USDT" },
  picking: "from",
  slippage: 0.5,
  wallet: null,
  quote: null,
  history: JSON.parse(localStorage.getItem("flashbridge.history") || "[]"),
};

const $ = (id) => document.getElementById(id);

function assetKey(side) {
  return `${state[side].token} · ${chainName(state[side].chain)}`;
}

function chainName(id) {
  return CHAINS.find((c) => c.id === id)?.name || id;
}

function demoBalance(token) {
  const map = { ETH: 1.25, BTC: 0.08, BNB: 4.2, SOL: 22, USDT: 2500, USDC: 1800, MATIC: 900, TRX: 12000 };
  return map[token] ?? 10;
}

function quoteAmount(amount) {
  const fromPx = PRICES[state.from.token] || 1;
  const toPx = PRICES[state.to.token] || 1;
  const usd = amount * fromPx;
  const sameChain = state.from.chain === state.to.chain;
  const feeBps = sameChain ? 8 : 18 + Math.abs(hashCode(state.from.chain + state.to.chain)) % 12;
  const netUsd = usd * (1 - feeBps / 10000);
  const out = netUsd / toPx;
  const eta = sameChain ? "约 15 秒" : state.from.chain === "bitcoin" || state.to.chain === "bitcoin" ? "约 8–18 分钟" : "约 45–90 秒";
  const bridge = sameChain ? "Uniswap / Pancake 本链兑换" : BRIDGES[Math.abs(hashCode(state.from.chain + state.to.chain)) % BRIDGES.length];
  return {
    out,
    rate: `1 ${state.from.token} ≈ ${(fromPx / toPx).toFixed(6)} ${state.to.token}`,
    feeUsd: usd - netUsd,
    eta,
    route: `${chainName(state.from.chain)} ${state.from.token} → ${bridge} → ${chainName(state.to.chain)} ${state.to.token}`,
    sameChain,
  };
}

function hashCode(s) {
  return [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
}

function refreshLabels() {
  $("fromLabel").textContent = assetKey("from");
  $("toLabel").textContent = assetKey("to");
  document.querySelector("#fromAssetBtn .dot").dataset.chain = state.from.chain;
  document.querySelector("#toAssetBtn .dot").dataset.chain = state.to.chain;
  $("fromBalance").textContent = state.wallet ? `余额 ${demoBalance(state.from.token)}` : "余额 --";
  $("toBalance").textContent = state.wallet ? `余额 ${demoBalance(state.to.token)}` : "余额 --";
  $("slipText").textContent = `${state.slippage}%`;
  refreshQuote();
}

function refreshQuote() {
  const amount = Number($("fromAmount").value);
  const btn = $("swapBtn");
  if (!amount || amount <= 0) {
    $("toAmount").value = "";
    $("quoteBox").classList.add("hidden");
    state.quote = null;
    btn.disabled = true;
    btn.textContent = "输入金额";
    return;
  }
  if (state.from.chain === state.to.chain && state.from.token === state.to.token) {
    $("quoteBox").classList.add("hidden");
    btn.disabled = true;
    btn.textContent = "请选择不同资产";
    return;
  }
  const q = quoteAmount(amount);
  state.quote = q;
  $("toAmount").value = q.out.toPrecision(8);
  $("rateText").textContent = q.rate;
  $("etaText").textContent = q.eta;
  $("feeText").textContent = `≈ $${q.feeUsd.toFixed(2)}`;
  $("routeText").textContent = q.route;
  $("quoteBox").classList.remove("hidden");
  btn.disabled = false;
  btn.textContent = state.wallet ? "闪兑" : "连接钱包后闪兑";
}

function openModal(id) {
  $(id).classList.remove("hidden");
}

function closeModal(id) {
  $(id).classList.add("hidden");
}

function renderPicker() {
  const q = $("pickerSearch").value.trim().toLowerCase();
  const list = $("pickerList");
  list.innerHTML = "";
  CHAINS.forEach((chain) => {
    chain.tokens.forEach((token) => {
      const label = `${token} ${chain.name}`.toLowerCase();
      if (q && !label.includes(q)) return;
      const el = document.createElement("button");
      el.className = "pick-item";
      el.innerHTML = `<span><span class="dot" data-chain="${chain.id}"></span> ${token}</span><small>${chain.name}</small>`;
      el.addEventListener("click", () => {
        state[state.picking] = { chain: chain.id, token };
        closeModal("picker");
        refreshLabels();
      });
      list.appendChild(el);
    });
  });
}

function renderChains() {
  $("chainGrid").innerHTML = CHAINS.map(
    (c) =>
      `<div class="chain-card"><strong>${c.name}</strong><br /><small>${c.tokens.join(" · ")}</small></div>`
  ).join("");
}

function renderHistory() {
  const list = $("historyList");
  if (!state.history.length) {
    list.innerHTML = "<li>暂无记录。完成一次模拟闪兑后会出现在这里。</li>";
    return;
  }
  list.innerHTML = state.history
    .map(
      (h) =>
        `<li><div><strong>${h.fromAmt} ${h.fromToken}</strong> → ${h.toAmt} ${h.toToken}<br /><small>${h.route}</small></div><small>${h.time}</small></li>`
    )
    .join("");
}

function switchView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  $(`view-${name}`).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  if (name === "history") renderHistory();
}

async function connectInjected() {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return accounts[0];
  }
  return "0xDemoC01d...a1b2";
}

function setWallet(addr) {
  state.wallet = addr;
  $("connectBtn").textContent = addr.slice(0, 6) + "…" + addr.slice(-4);
  refreshLabels();
}

$("fromAmount").addEventListener("input", refreshQuote);
$("fromAssetBtn").addEventListener("click", () => {
  state.picking = "from";
  $("pickerTitle").textContent = "选择支付资产";
  $("pickerSearch").value = "";
  renderPicker();
  openModal("picker");
});
$("toAssetBtn").addEventListener("click", () => {
  state.picking = "to";
  $("pickerTitle").textContent = "选择到账资产";
  $("pickerSearch").value = "";
  renderPicker();
  openModal("picker");
});
$("pickerSearch").addEventListener("input", renderPicker);
$("flipBtn").addEventListener("click", () => {
  const tmp = state.from;
  state.from = state.to;
  state.to = tmp;
  refreshLabels();
});
document.querySelectorAll(".quick button").forEach((b) => {
  b.addEventListener("click", () => {
    const bal = demoBalance(state.from.token);
    $("fromAmount").value = ((Number(b.dataset.pct) / 100) * bal).toString();
    refreshQuote();
  });
});
$("settingsBtn").addEventListener("click", () => openModal("settings"));
$("connectBtn").addEventListener("click", () => openModal("wallet"));
document.querySelectorAll("[data-close]").forEach((b) => {
  b.addEventListener("click", () => closeModal(b.dataset.close));
});
document.querySelectorAll(".chip").forEach((c) => {
  c.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((x) => x.classList.remove("active"));
    c.classList.add("active");
    state.slippage = Number(c.dataset.slip);
    refreshLabels();
  });
});
$("customSlip").addEventListener("input", () => {
  const v = Number($("customSlip").value);
  if (v > 0) {
    state.slippage = v;
    document.querySelectorAll(".chip").forEach((x) => x.classList.remove("active"));
    refreshLabels();
  }
});
document.querySelectorAll(".wallet-opt").forEach((b) => {
  b.addEventListener("click", async () => {
    const addr = b.dataset.wallet === "demo" ? "0xA11cE0ffee...d00d" : await connectInjected();
    setWallet(addr);
    closeModal("wallet");
  });
});
document.querySelectorAll(".nav-btn").forEach((b) => {
  b.addEventListener("click", () => switchView(b.dataset.view));
});
$("swapBtn").addEventListener("click", () => {
  if (!state.wallet) {
    openModal("wallet");
    return;
  }
  const amount = $("fromAmount").value;
  const q = state.quote;
  $("confirmBody").innerHTML = `
    <div><span>支付</span><strong>${amount} ${state.from.token}</strong></div>
    <div><span>到账</span><strong>≥ ${(q.out * (1 - state.slippage / 100)).toPrecision(8)} ${state.to.token}</strong></div>
    <div><span>路径</span><strong>${q.route}</strong></div>
    <div><span>收款</span><strong>${($("recvAddr").value || state.wallet).slice(0, 18)}…</strong></div>
  `;
  openModal("confirm");
});
$("confirmBtn").addEventListener("click", () => {
  const rec = {
    fromAmt: $("fromAmount").value,
    fromToken: state.from.token,
    toAmt: Number($("toAmount").value).toPrecision(6),
    toToken: state.to.token,
    route: state.quote.route,
    time: new Date().toLocaleString("zh-CN"),
  };
  state.history.unshift(rec);
  localStorage.setItem("flashbridge.history", JSON.stringify(state.history.slice(0, 20)));
  closeModal("confirm");
  $("fromAmount").value = "";
  refreshQuote();
  switchView("history");
});

renderChains();
refreshLabels();
renderHistory();
