(function () {
  "use strict";

  var CATS = ["推荐", "手机", "数码", "电脑", "家电", "服饰", "美妆", "家居", "运动", "图书", "母婴", "其他"];
  var CONDITIONS = ["全新", "几乎全新", "轻微使用痕迹", "明显使用痕迹"];
  var STATUS = {
    pending_pay: "待付款",
    pending_ship: "待发货",
    pending_recv: "待收货",
    done: "已完成",
    cancelled: "已取消"
  };
  var LOOKS = {
    手机: ["📱", "linear-gradient(160deg,#d9ecff,#f4f9ff)"],
    数码: ["🎧", "linear-gradient(160deg,#ffe7c2,#fff8ee)"],
    电脑: ["💻", "linear-gradient(160deg,#d7e4f5,#f7fbff)"],
    家电: ["🔌", "linear-gradient(160deg,#d9f5ea,#f4fffb)"],
    服饰: ["👕", "linear-gradient(160deg,#ffd6e0,#fff5f7)"],
    美妆: ["💄", "linear-gradient(160deg,#ffd0ea,#fff0f7)"],
    家居: ["🪑", "linear-gradient(160deg,#f0e2cf,#fbf7f2)"],
    运动: ["👟", "linear-gradient(160deg,#d9f0ff,#f3fbff)"],
    图书: ["📚", "linear-gradient(160deg,#ffe8c7,#fffaf2)"],
    母婴: ["🧸", "linear-gradient(160deg,#ffe1c4,#fff6ee)"],
    其他: ["📦", "linear-gradient(160deg,#e6e6e6,#fafafa)"]
  };
  var CITIES = ["深圳", "广州", "上海", "北京", "杭州", "成都", "武汉", "南京", "重庆", "西安", "苏州", "郑州", "长沙", "天津", "青岛"];

  var state = {
    route: { name: "home" },
    keyword: "",
    category: "推荐",
    sort: "rank",
    orderFilter: "all",
    products: [],
    orders: [],
    threads: [],
    profile: null,
    pendingImage: "",
    renderedRoute: "",
    lastViewed: "",
    modalResolve: null,
    busy: false
  };

  function defaultProfile() {
    return {
      name: "Leo",
      phone: "13800008888",
      city: "深圳",
      address: "广东省深圳市南山区科技园科苑路1号"
    };
  }

  function sellers() {
    return {
      s1: { id: "s1", name: "南风旧物", city: "深圳", years: 3, sold: 128, rate: 99 },
      s2: { id: "s2", name: "阿橙数码", city: "广州", years: 5, sold: 860, rate: 99 },
      s3: { id: "s3", name: "周末出闲置", city: "上海", years: 2, sold: 64, rate: 100 },
      s4: { id: "s4", name: "慢慢买", city: "杭州", years: 4, sold: 210, rate: 98 },
      s5: { id: "s5", name: "小鱼干", city: "北京", years: 1, sold: 23, rate: 100 },
      s6: { id: "s6", name: "清仓日记", city: "成都", years: 6, sold: 1402, rate: 99 }
    };
  }

  function seedProducts() {
    var S = sellers();
    var now = Date.now();
    var h = function (hours) { return now - hours * 3600000; };
    function item(row) {
      return {
        id: row.id,
        title: row.title,
        desc: row.desc,
        price: row.price,
        compareAt: row.compareAt || 0,
        category: row.category,
        condition: row.condition,
        city: row.city,
        shipType: row.shipType,
        freight: row.freight || 0,
        emoji: row.emoji,
        cover: row.cover,
        image: "",
        status: "on",
        createdAt: row.createdAt,
        rank: row.rank,
        views: row.views,
        wants: row.wants,
        wanted: false,
        seller: Object.assign({}, row.seller)
      };
    }
    return [
      item({ id: "p1", title: "苹果 MacBook Air M1 8+256 深空灰 九成新", desc: "自用一年，循环约 180 次，电池健康 89%。无拆无修，功能正常。配件有原装充电器和盒子。同城可面交，外地包邮。", price: 3200, compareAt: 7999, category: "电脑", condition: "几乎全新", city: "深圳", shipType: "包邮", emoji: "💻", cover: LOOKS["电脑"][1], createdAt: h(2), rank: 1, views: 328, wants: 46, seller: S.s1 }),
      item({ id: "p2", title: "iPhone 13 128G 星光色 电池88%", desc: "日常使用，屏幕无划痕，电池健康 88%。已退出 Apple ID，配件齐全。可小刀，诚心出。", price: 2180, compareAt: 5199, category: "手机", condition: "轻微使用痕迹", city: "广州", shipType: "包邮", emoji: "📱", cover: LOOKS["手机"][1], createdAt: h(3), rank: 2, views: 512, wants: 73, seller: S.s2 }),
      item({ id: "p3", title: "索尼 WH-1000XM4 黑色 几乎全新", desc: "买来出差用了两次，降噪正常，耳罩无破损。原盒、收纳包、飞机转接头都在。", price: 899, compareAt: 2299, category: "数码", condition: "几乎全新", city: "上海", shipType: "包邮", emoji: "🎧", cover: LOOKS["数码"][1], createdAt: h(5), rank: 3, views: 201, wants: 38, seller: S.s3 }),
      item({ id: "p4", title: "戴森 V8 无线吸尘器 轻微使用", desc: "吸头和滚筒都在，滤网刚换过。续航大约 20 分钟。不包邮，运费到付按页面金额。", price: 980, compareAt: 2990, category: "家电", condition: "轻微使用痕迹", city: "杭州", shipType: "运费", freight: 18, emoji: "🧹", cover: LOOKS["家电"][1], createdAt: h(8), rank: 4, views: 166, wants: 21, seller: S.s4 }),
      item({ id: "p5", title: "优衣库男款羽绒服 M码 几乎全新", desc: "去年冬天买的，只穿过两次，无污渍。吊牌已剪，洗过一次。", price: 199, compareAt: 599, category: "服饰", condition: "几乎全新", city: "北京", shipType: "运费", freight: 12, emoji: "🧥", cover: LOOKS["服饰"][1], createdAt: h(12), rank: 5, views: 89, wants: 11, seller: S.s5 }),
      item({ id: "p6", title: "SK-II 神仙水 230ml 全新未拆", desc: "专柜购入，塑封未拆，日期新鲜。不议价，拍下当天发。", price: 680, compareAt: 1540, category: "美妆", condition: "全新", city: "成都", shipType: "包邮", emoji: "💄", cover: LOOKS["美妆"][1], createdAt: h(20), rank: 6, views: 274, wants: 55, seller: S.s6 }),
      item({ id: "p7", title: "宜家学习书桌 1.2米 自提", desc: "白色桌面有轻微使用痕迹，结构稳。仅限深圳南山区自提，不邮寄。", price: 150, compareAt: 399, category: "家居", condition: "轻微使用痕迹", city: "深圳", shipType: "自提", emoji: "🪑", cover: LOOKS["家居"][1], createdAt: h(26), rank: 7, views: 77, wants: 9, seller: S.s1 }),
      item({ id: "p8", title: "耐克飞马跑鞋 42码 有使用痕迹", desc: "跑了大概 200 公里，鞋底还厚，鞋面干净。适合练跑，不适合收藏。", price: 260, compareAt: 899, category: "运动", condition: "明显使用痕迹", city: "武汉", shipType: "运费", freight: 10, emoji: "👟", cover: LOOKS["运动"][1], createdAt: h(30), rank: 8, views: 64, wants: 7, seller: S.s5 }),
      item({ id: "p9", title: "《三体》全集 九成新", desc: "三册都在，内页无笔记，书脊轻微磨损。包邮出。", price: 48, compareAt: 168, category: "图书", condition: "轻微使用痕迹", city: "南京", shipType: "包邮", emoji: "📚", cover: LOOKS["图书"][1], createdAt: h(40), rank: 9, views: 143, wants: 19, seller: S.s6 }),
      item({ id: "p10", title: "任天堂 Switch OLED 白色 带两张游戏", desc: "主机、底座、手柄正常，送塞尔达和马里奥。账号已退出。几乎全新，贴了膜。", price: 1450, compareAt: 2099, category: "数码", condition: "几乎全新", city: "重庆", shipType: "包邮", emoji: "🎮", cover: "linear-gradient(160deg,#e7f0ff,#f7fbff)", createdAt: h(48), rank: 10, views: 390, wants: 61, seller: S.s2 }),
      item({ id: "p11", title: "iPad Air 5 64G 紫色 轻微使用", desc: "Wi-Fi 版，电池健康 94%，无弯无修。带原装充电头和保护套。", price: 2399, compareAt: 4799, category: "电脑", condition: "轻微使用痕迹", city: "深圳", shipType: "包邮", emoji: "📱", cover: "linear-gradient(160deg,#efe4ff,#fbf8ff)", createdAt: h(55), rank: 11, views: 256, wants: 33, seller: S.s1 }),
      item({ id: "p12", title: "小米空气净化器 4 几乎全新", desc: "滤芯还很新，APP 可绑定。功能正常，外地运费按页面算。", price: 420, compareAt: 899, category: "家电", condition: "几乎全新", city: "西安", shipType: "运费", freight: 15, emoji: "💨", cover: LOOKS["家电"][1], createdAt: h(70), rank: 12, views: 98, wants: 14, seller: S.s4 }),
      item({ id: "p13", title: "佳能 M50 微单套机 快门约8千", desc: "15-45 套头，快门约 8000 次，传感器干净。送两块电池和包。", price: 2680, compareAt: 5499, category: "数码", condition: "轻微使用痕迹", city: "上海", shipType: "包邮", emoji: "📷", cover: "linear-gradient(160deg,#e8eef5,#f8fbff)", createdAt: h(80), rank: 13, views: 188, wants: 27, seller: S.s3 }),
      item({ id: "p14", title: "儿童平衡车 2-6岁 几乎全新", desc: "孩子骑了两周就不骑了，车况新。仅苏州自提。", price: 180, compareAt: 399, category: "母婴", condition: "几乎全新", city: "苏州", shipType: "自提", emoji: "🚲", cover: LOOKS["母婴"][1], createdAt: h(96), rank: 14, views: 54, wants: 6, seller: S.s6 })
    ];
  }

  function seedThreads() {
    var now = Date.now();
    return [
      {
        id: "t1",
        peerId: "s2",
        peerName: "阿橙数码",
        itemId: "p2",
        itemTitle: "iPhone 13 128G 星光色 电池88%",
        unread: 1,
        autoReplied: true,
        logs: [
          { from: "me", text: "你好，电池健康还剩多少？", time: now - 5 * 3600000 },
          { from: "peer", text: "88%，无拆无修，可以小刀一点。", time: now - 5 * 3600000 + 60000 }
        ]
      },
      {
        id: "t2",
        peerId: "s1",
        peerName: "南风旧物",
        itemId: "p1",
        itemTitle: "苹果 MacBook Air M1 8+256 深空灰 九成新",
        unread: 0,
        autoReplied: true,
        logs: [
          { from: "peer", text: "这台电脑还在的，同城可以约在科技园面交。", time: now - 86400000 }
        ]
      }
    ];
  }

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      toast("浏览器存储空间不足");
      return false;
    }
  }

  function persistAll() {
    writeJSON("xy_products", state.products);
    writeJSON("xy_orders", state.orders);
    writeJSON("xy_threads", state.threads);
    writeJSON("xy_profile", state.profile);
  }

  function load() {
    if (!localStorage.getItem("xy_inited")) {
      state.products = seedProducts();
      state.orders = [];
      state.threads = seedThreads();
      state.profile = defaultProfile();
      persistAll();
      localStorage.setItem("xy_inited", "1");
      return;
    }
    var products = readJSON("xy_products", null);
    var orders = readJSON("xy_orders", null);
    var threads = readJSON("xy_threads", null);
    if (!Array.isArray(products) || !Array.isArray(orders) || !Array.isArray(threads)) {
      localStorage.removeItem("xy_inited");
      load();
      return;
    }
    state.products = products;
    state.orders = orders;
    state.threads = threads;
    state.profile = Object.assign(defaultProfile(), readJSON("xy_profile", {}));
  }

  function saveProducts() { return writeJSON("xy_products", state.products); }
  function saveOrders() { return writeJSON("xy_orders", state.orders); }
  function saveThreads() { return writeJSON("xy_threads", state.threads); }
  function saveProfile() { return writeJSON("xy_profile", state.profile); }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function money(n) {
    var v = Math.round(Number(n) * 100) / 100;
    if (!isFinite(v)) return "0";
    var parts = v.toFixed(2).split(".");
    var withComma = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts[1] === "00") return withComma;
    return withComma + "." + parts[1].replace(/0$/, "");
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function fmt(ts) {
    var d = new Date(ts);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function ago(ts) {
    var s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return "刚刚";
    if (s < 3600) return Math.floor(s / 60) + "分钟前";
    if (s < 86400) return Math.floor(s / 3600) + "小时前";
    if (s < 86400 * 7) return Math.floor(s / 86400) + "天前";
    return fmt(ts).slice(0, 10);
  }

  function maskPhone(phone) {
    var s = String(phone || "");
    if (s.length < 7) return s;
    return s.slice(0, 3) + "****" + s.slice(-4);
  }

  function avatarColor(name) {
    var colors = ["#ffe60f", "#ffd7bf", "#cfe8ff", "#d8f5c8", "#ffd6ea", "#e4ddff"];
    var hash = 0;
    var text = String(name || "鱼");
    for (var i = 0; i < text.length; i++) hash = (hash + text.charCodeAt(i)) % colors.length;
    return colors[hash];
  }

  function avatarHTML(name, cls) {
    var text = String(name || "鱼");
    return '<span class="' + (cls || "pav") + '" style="background:' + avatarColor(text) + '">' + esc(text.slice(0, 1)) + "</span>";
  }

  function itemById(id) {
    return state.products.filter(function (p) { return p.id === id; })[0] || null;
  }

  function orderById(id) {
    return state.orders.filter(function (o) { return o.id === id; })[0] || null;
  }

  function mySoldCount() {
    return state.orders.filter(function (o) { return o.sellerId === "me" && o.status === "done"; }).length;
  }

  function sellerOf(p) {
    if (!p || !p.seller || p.seller.id !== "me") return p.seller;
    return {
      id: "me",
      name: state.profile.name,
      city: p.city,
      years: 1,
      sold: mySoldCount(),
      rate: 100
    };
  }

  function shortCond(c) {
    return { "全新": "全新", "几乎全新": "几乎全新", "轻微使用痕迹": "轻微使用", "明显使用痕迹": "明显使用" }[c] || c;
  }

  function shipText(p) {
    if (p.shipType === "包邮") return "包邮";
    if (p.shipType === "自提") return (p.city || "") + "自提";
    return "运费 ¥" + money(p.freight || 0);
  }

  function totalOf(o) {
    return Number(o.price) + (o.shipType === "运费" ? Number(o.freight) || 0 : 0);
  }

  function tradeState(p) {
    if (!p) return { type: "missing" };
    if (p.status === "sold") return { type: "sold" };
    var active = state.orders.filter(function (o) {
      return o.productId === p.id && (o.status === "pending_pay" || o.status === "pending_ship" || o.status === "pending_recv");
    })[0];
    if (active) return { type: "order", order: active };
    return { type: "sale" };
  }

  function badgeOf(p) {
    var t = tradeState(p);
    if (t.type === "sold") return "已售出";
    if (t.type === "order") return "交易中";
    return "";
  }

  function unreadCount() {
    return state.threads.reduce(function (sum, t) { return sum + (t.unread || 0); }, 0);
  }

  function todoCount() {
    return state.orders.filter(function (o) {
      if (o.status === "pending_pay" && o.sellerId !== "me") return true;
      if (o.status === "pending_ship" && o.sellerId === "me") return true;
      if (o.status === "pending_recv" && o.sellerId !== "me") return true;
      return false;
    }).length;
  }

  function filtered() {
    var kw = state.keyword.trim().toLowerCase();
    var list = state.products.filter(function (p) {
      if (state.category !== "推荐" && p.category !== state.category) return false;
      if (!kw) return true;
      var blob = (p.title + " " + p.desc + " " + p.category + " " + p.city + " " + (p.seller && p.seller.name || "")).toLowerCase();
      return blob.indexOf(kw) !== -1;
    });
    var sorters = {
      rank: function (a, b) { return a.rank - b.rank || b.createdAt - a.createdAt; },
      new: function (a, b) { return b.createdAt - a.createdAt; },
      low: function (a, b) { return a.price - b.price; },
      high: function (a, b) { return b.price - a.price; }
    };
    return list.sort(sorters[state.sort] || sorters.rank);
  }

  function coverHTML(p, className) {
    if (p.image && String(p.image).indexOf("data:image") === 0) {
      return '<img class="' + className + '" src="' + p.image + '" alt="' + esc(p.title) + '">';
    }
    return '<div class="' + className + ' ph" style="background:' + (p.cover || LOOKS["其他"][1]) + '"><span>' + (p.emoji || "📦") + "</span></div>";
  }

  function icon(name) {
    var paths = {
      home: '<path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5z"/>',
      msg: '<path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/>',
      order: '<path d="M7 4h10l1 3H6l1-3zm-1 5h12v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9z"/>',
      me: '<path d="M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12zm-6 8a6 6 0 0 1 12 0"/>'
    };
    return '<svg class="ico" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">' + paths[name] + "</svg>";
  }

  function badge(type, n) {
    return '<span class="badge" data-badge="' + type + '"' + (n ? "" : " hidden") + ">" + (n > 99 ? "99+" : String(n || "")) + "</span>";
  }

  function on(name) {
    if (name === "orders") return state.route.name === "orders" || state.route.name === "order" ? "on" : "";
    if (name === "messages") return state.route.name === "messages" || state.route.name === "chat" ? "on" : "";
    return state.route.name === name ? "on" : "";
  }

  function parseRoute() {
    var raw = (location.hash || "#/").slice(1);
    var qIndex = raw.indexOf("?");
    var path = (qIndex >= 0 ? raw.slice(0, qIndex) : raw) || "/";
    var qs = qIndex >= 0 ? raw.slice(qIndex + 1) : "";
    var params = new URLSearchParams(qs);
    var parts = path.split("/").filter(Boolean);
    var head = parts[0] || "";
    var id = parts[1] ? decodeURIComponent(parts[1]) : "";
    if (!head) state.route = { name: "home" };
    else if (head === "item" && id) state.route = { name: "item", id: id };
    else if (head === "publish") state.route = { name: "publish" };
    else if (head === "checkout" && id) state.route = { name: "checkout", id: id };
    else if (head === "orders") state.route = { name: "orders", role: params.get("role") === "sell" ? "sell" : "buy" };
    else if (head === "order" && id) state.route = { name: "order", id: id };
    else if (head === "messages") state.route = { name: "messages" };
    else if (head === "chat" && id) state.route = { name: "chat", id: id };
    else if (head === "me") state.route = { name: "me" };
    else state.route = { name: "missing" };
  }

  function touchRouteEffects() {
    if (state.route.name === "publish" && state.renderedRoute !== "publish") state.pendingImage = "";
    state.renderedRoute = state.route.name;
    if (state.route.name === "item") {
      if (state.lastViewed !== state.route.id) {
        var product = itemById(state.route.id);
        if (product) {
          product.views += 1;
          saveProducts();
        }
        state.lastViewed = state.route.id;
      }
    } else {
      state.lastViewed = "";
    }
    if (state.route.name === "chat") {
      var thread = state.threads.filter(function (t) { return t.peerId === state.route.id; })[0];
      if (thread && thread.unread) {
        thread.unread = 0;
        saveThreads();
      }
    }
  }

  function toast(message) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  function closeModal(result) {
    var modal = document.getElementById("modal");
    if (modal) modal.hidden = true;
    document.body.classList.remove("modal-open");
    var resolve = state.modalResolve;
    state.modalResolve = null;
    if (resolve) resolve(result);
  }

  function ask(text) {
    return new Promise(function (resolve) {
      state.modalResolve = resolve;
      document.getElementById("modal-text").textContent = text;
      document.getElementById("modal").hidden = false;
      document.body.classList.add("modal-open");
    });
  }

  function confirmAct(text, fn) {
    if (state.busy) return;
    state.busy = true;
    ask(text).then(function (ok) {
      if (ok) fn();
    }).catch(function () {
      toast("操作失败");
    }).then(function () {
      state.busy = false;
    });
  }

  function topbar() {
    var msg = unreadCount();
    var od = todoCount();
    return '' +
      '<header class="topbar"><div class="wrap bar">' +
        '<a class="brand" href="#/">' +
          '<span class="logo-mark" aria-hidden="true">鱼</span>' +
          '<span class="logo-word">闲鱼</span>' +
        "</a>" +
        '<div class="search' + (state.keyword ? " has" : "") + '" role="search">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
          '<input id="q" type="text" placeholder="搜索宝贝、品牌或卖家" value="' + esc(state.keyword) + '" autocomplete="off">' +
          '<button type="button" class="clear" data-act="clear-q" aria-label="清空搜索">×</button>' +
        "</div>" +
        '<nav class="desk-nav">' +
          '<a class="nav-item ' + on("home") + '" href="#/">首页</a>' +
          '<a class="nav-item ' + on("messages") + '" href="#/messages">消息' + badge("msg", msg) + "</a>" +
          '<a class="nav-item ' + on("orders") + '" href="#/orders?role=buy">订单' + badge("order", od) + "</a>" +
          '<a class="nav-item ' + on("me") + '" href="#/me">我的</a>' +
          '<a class="btn pub-btn" href="#/publish">发布闲置</a>' +
        "</nav>" +
      "</div></header>";
  }

  function tabbar() {
    return '' +
      '<nav class="tabbar">' +
        '<a class="' + on("home") + '" href="#/">' + icon("home") + "<span>首页</span></a>" +
        '<a class="' + on("messages") + '" href="#/messages">' + icon("msg") + "<span>消息</span>" + badge("msg", unreadCount()) + "</a>" +
        '<a class="tab-pub ' + on("publish") + '" href="#/publish" aria-label="发布闲置"><span>+</span></a>' +
        '<a class="' + on("orders") + '" href="#/orders?role=buy">' + icon("order") + "<span>订单</span>" + badge("order", todoCount()) + "</a>" +
        '<a class="' + on("me") + '" href="#/me">' + icon("me") + "<span>我的</span></a>" +
      "</nav>";
  }

  function crumb(items) {
    return '<nav class="crumb">' + items.map(function (it, i) {
      if (i === items.length - 1) return "<span>" + esc(it.text) + "</span>";
      return '<a href="' + it.href + '">' + esc(it.text) + '</a><span>/</span>';
    }).join("") + "</nav>";
  }

  function notFound(text) {
    return '<div class="empty"><div class="empty-ico">🐟</div><p>' + esc(text) + '</p><a class="btn" href="#/">回首页</a></div>';
  }

  function cardHTML(p) {
    var s = sellerOf(p);
    var badgeText = badgeOf(p);
    return '' +
      '<a class="pcard" href="#/item/' + encodeURIComponent(p.id) + '">' +
        '<div class="cover-wrap">' +
          coverHTML(p, "cover") +
          (p.shipType === "包邮" ? '<em class="tag-ship">包邮</em>' : "") +
          (badgeText ? '<em class="ribbon">' + badgeText + "</em>" : "") +
        "</div>" +
        '<div class="pinfo">' +
          '<div class="ptitle">' + esc(p.title) + "</div>" +
          '<div class="pmeta">' + esc(shortCond(p.condition)) + " · " + esc(p.city) + "</div>" +
          '<div class="pprice"><small>¥</small>' + money(p.price) + '<span class="want">' + p.wants + "人想要</span></div>" +
          '<div class="pseller">' + avatarHTML(s.name) + '<span class="name">' + esc(s.name) + '</span><span class="loc">' + esc(p.city) + "</span></div>" +
        "</div>" +
      "</a>";
  }

  function cardsHTML(list) {
    if (!list.length) {
      return '<div class="empty"><div class="empty-ico">🐟</div><p>没有找到相关宝贝</p><a class="btn" href="#/publish">发布闲置</a></div>';
    }
    return list.map(cardHTML).join("");
  }

  function rail() {
    var mine = state.products.filter(function (p) { return p.seller && p.seller.id === "me"; }).length;
    var buyN = state.orders.filter(function (o) { return o.sellerId !== "me"; }).length;
    var sellN = state.orders.filter(function (o) { return o.sellerId === "me"; }).length;
    return '' +
      '<aside class="rail">' +
        '<div class="panel user-card">' +
          '<div class="user-line">' + avatarHTML(state.profile.name, "pav lg") +
            "<div><b>" + esc(state.profile.name) + "</b><div class=\"muted\">" + esc(state.profile.city) + "</div></div>" +
          "</div>" +
          '<a class="btn btn-block" href="#/publish">发布闲置</a>' +
        "</div>" +
        '<div class="panel rail-menu">' +
          '<a href="#/me">我发布的<b>' + mine + "</b></a>" +
          '<a href="#/orders?role=buy">我买到的<b>' + buyN + "</b></a>" +
          '<a href="#/orders?role=sell">我卖出的<b>' + sellN + "</b></a>" +
          '<a href="#/messages">消息<b>' + state.threads.length + "</b></a>" +
        "</div>" +
        '<div class="panel tips"><b>交易提示</b><p>先在站内把成色和邮寄说清楚。这个页面是本地演示，不会真实扣款或发货。</p></div>' +
      "</aside>";
  }

  function viewHome() {
    var list = filtered();
    var sorts = [["rank", "综合"], ["new", "最新"], ["low", "价格低到高"], ["high", "价格高到低"]];
    return '' +
      '<div class="catbar">' + CATS.map(function (c) {
        return '<button type="button" class="cat' + (state.category === c ? " on" : "") + '" data-act="cat" data-cat="' + c + '">' + c + "</button>";
      }).join("") + "</div>" +
      '<div class="layout"><div>' +
        '<div class="sortbar">' + sorts.map(function (pair) {
          return '<button type="button" data-act="sort" data-sort="' + pair[0] + '"' + (state.sort === pair[0] ? ' class="on"' : "") + ">" + pair[1] + "</button>";
        }).join("") + '<span class="result-count" id="result-count">共 ' + list.length + " 件</span></div>" +
        '<div id="grid" class="grid">' + cardsHTML(list) + "</div>" +
      "</div>" + rail() + "</div>";
  }

  function buyActions(p) {
    if (p.seller.id === "me") {
      var mineState = tradeState(p);
      if (mineState.type === "sale") {
        return '<button type="button" class="btn btn-line" data-act="mock-buy" data-id="' + p.id + '">模拟买家下单</button><a class="btn" href="#/me">管理发布</a>';
      }
      if (mineState.type === "order") return '<a class="btn btn-block" href="#/order/' + mineState.order.id + '">查看交易</a>';
      return '<a class="btn btn-block" href="#/me">管理发布</a>';
    }
    var t = tradeState(p);
    if (t.type === "sold") return '<button class="btn btn-block" type="button" disabled>已售出</button>';
    if (t.type === "order") {
      var label = t.order.status === "pending_pay" ? "去支付" : "查看订单";
      return '<a class="btn btn-block" href="#/order/' + t.order.id + '">' + label + "</a>";
    }
    return '<button type="button" class="btn btn-line" data-act="chat" data-id="' + p.id + '">聊一聊</button><a class="btn" href="#/checkout/' + encodeURIComponent(p.id) + '">立即购买</a>';
  }

  function viewItem() {
    var p = itemById(state.route.id);
    if (!p) return notFound("宝贝不存在或已删除");
    var s = sellerOf(p);
    var ribbon = badgeOf(p);
    return '' +
      crumb([{ href: "#/", text: "首页" }, { text: "宝贝详情" }]) +
      '<div class="detail detail-page">' +
        '<div class="gallery"><div class="cover-wrap">' + coverHTML(p, "hero") + (ribbon ? '<em class="ribbon">' + ribbon + "</em>" : "") + "</div></div>" +
        '<div class="buybox">' +
          '<div class="dprice"><small>¥</small>' + money(p.price) + (p.compareAt > p.price ? '<span class="origin">¥' + money(p.compareAt) + "</span>" : "") + "</div>" +
          "<h1>" + esc(p.title) + "</h1>" +
          '<div class="tags"><span>' + esc(p.condition) + "</span><span>" + esc(p.category) + "</span><span>" + esc(shipText(p)) + "</span><span>" + esc(p.city) + "</span></div>" +
          '<p class="desc">' + esc(p.desc || "卖家没有填写描述") + "</p>" +
          '<div class="seller-card">' + avatarHTML(s.name, "pav lg") +
            "<div><b>" + esc(s.name) + '</b><span class="credit">信用极好</span><div class="meta">来闲鱼' + s.years + "年 · 卖出" + s.sold + "件 · 好评率" + s.rate + "%</div></div>" +
          "</div>" +
          '<div class="buy-actions"><button type="button" class="btn btn-line" data-act="want" data-id="' + p.id + '">' + (p.wanted ? "已想要" : "想要") + "</button>" + buyActions(p) + "</div>" +
          '<div class="fine">浏览 ' + p.views + " · " + ago(p.createdAt) + "发布</div>" +
        "</div>" +
      "</div>";
  }

  function chips(name, values, current) {
    return '<div class="chips">' + values.map(function (value, index) {
      var checked = current ? value === current : index === 0;
      return '<label class="chip"><input type="radio" name="' + name + '" value="' + esc(value) + '"' + (checked ? " checked" : "") + "><span>" + esc(value) + "</span></label>";
    }).join("") + "</div>";
  }

  function viewPublish() {
    return '' +
      "<h1 class=\"page-title\">发布闲置</h1>" +
      '<form id="pub-form" class="panel form-card" novalidate>' +
        '<label class="uploader"><input id="pic" type="file" accept="image/*" hidden><div id="preview">' +
          (state.pendingImage ? '<img src="' + state.pendingImage + '" alt="">' : "<span>上传封面，可不传</span>") +
        "</div></label>" +
        '<label class="field"><span>标题</span><input name="title" maxlength="60" placeholder="品牌、型号、成色，一眼能看懂"></label>' +
        '<label class="field"><span>价格</span><input name="price" inputmode="decimal" placeholder="0.00"></label>' +
        '<p class="hint">标一个你能接受的价格，买家还可以再聊。</p>' +
        '<div class="field"><span>分类</span>' + chips("category", CATS.slice(1), "数码") + "</div>" +
        '<div class="field"><span>成色</span>' + chips("condition", CONDITIONS, "几乎全新") + "</div>" +
        '<label class="field"><span>描述</span><textarea name="desc" maxlength="500" placeholder="入手渠道、使用时长、配件、瑕疵"></textarea></label>' +
        '<label class="field"><span>城市</span><input name="city" maxlength="10" list="cities" value="' + esc(state.profile.city) + '"></label>' +
        "<datalist id=\"cities\">" + CITIES.map(function (c) { return '<option value="' + c + '">'; }).join("") + "</datalist>" +
        '<div class="field"><span>发货方式</span>' + chips("shipType", ["包邮", "运费", "自提"], "包邮") + "</div>" +
        '<label class="field" id="freight-row" hidden><span>运费</span><input name="freight" inputmode="decimal" placeholder="0"></label>' +
        '<button class="btn btn-block" type="submit">确认发布</button>' +
      "</form>";
  }

  function viewCheckout() {
    var p = itemById(state.route.id);
    if (!p) return notFound("宝贝不存在或已删除");
    if (p.seller.id === "me") return notFound("不能购买自己发布的宝贝");
    var t = tradeState(p);
    if (t.type === "sold") return notFound("这个宝贝已经售出");
    if (t.type === "order") {
      return '<div class="empty"><div class="empty-ico">🐟</div><p>这件宝贝已有进行中的订单</p><a class="btn" href="#/order/' + t.order.id + '">查看订单</a></div>';
    }
    var freight = p.shipType === "运费" ? Number(p.freight) || 0 : 0;
    var total = Number(p.price) + freight;
    var profile = state.profile;
    return '' +
      crumb([{ href: "#/", text: "首页" }, { href: "#/item/" + encodeURIComponent(p.id), text: "宝贝详情" }, { text: "确认订单" }]) +
      '<h1 class="page-title">确认订单</h1>' +
      '<form id="checkout-form" class="checkout" novalidate>' +
        '<div class="stack">' +
          '<div class="panel">' +
            '<h2>收货地址</h2>' +
            '<label class="field"><span>收货人</span><input name="recvName" maxlength="12" value="' + esc(profile.name) + '" autocomplete="name"></label>' +
            '<label class="field"><span>手机号</span><input name="recvPhone" maxlength="11" inputmode="numeric" value="' + esc(profile.phone) + '" autocomplete="tel"></label>' +
            '<label class="field"><span>详细地址</span><textarea name="recvAddr" maxlength="80">' + esc(profile.address) + "</textarea></label>" +
            (p.shipType === "自提" ? '<p class="hint">这件宝贝只支持自提，下单后请和卖家约定面交地点。</p>' : "") +
          "</div>" +
          '<div class="panel">' +
            '<h2>卖家：' + esc(sellerOf(p).name) + "</h2>" +
            '<a class="order-mini" href="#/item/' + encodeURIComponent(p.id) + '">' + coverHTML(p, "thumb") +
              '<div><div class="ptitle">' + esc(p.title) + '</div><div class="pprice"><small>¥</small>' + money(p.price) + "</div></div></a>" +
            '<div class="rowline"><span>配送</span><span>' + esc(shipText(p)) + "</span></div>" +
            '<label class="field"><span>买家留言</span><input name="note" maxlength="80" placeholder="选填，请先和卖家协商一致"></label>' +
            '<div class="field"><span>支付方式</span>' + chips("payMethod", ["支付宝", "微信支付"], "支付宝") + "</div>" +
          "</div>" +
        "</div>" +
        '<aside class="panel summary">' +
          "<h2>付款详情</h2>" +
          '<div class="rowline"><span>宝贝金额</span><span>¥' + money(p.price) + "</span></div>" +
          '<div class="rowline"><span>运费</span><span>' + (freight ? "¥" + money(freight) : "¥0") + "</span></div>" +
          '<div class="rowline total"><span>实付款</span><span>¥' + money(total) + "</span></div>" +
          '<button class="btn btn-block" type="submit">提交订单</button>' +
          '<p class="hint" style="margin-top:10px">演示订单只保存在本机，不会真实扣款。</p>' +
        "</aside>" +
      "</form>";
  }

  function orderActions(o) {
    var btns = [];
    var isSell = o.sellerId === "me";
    if (!isSell && o.status === "pending_pay") {
      btns.push('<button type="button" class="btn" data-act="pay" data-id="' + o.id + '">去支付</button>');
      btns.push('<button type="button" class="btn btn-line" data-act="cancel" data-id="' + o.id + '">取消订单</button>');
    }
    if (!isSell && o.status === "pending_ship") {
      btns.push('<button type="button" class="btn btn-line" data-act="mock-ship" data-id="' + o.id + '">模拟卖家发货</button>');
    }
    if (!isSell && o.status === "pending_recv") {
      btns.push('<button type="button" class="btn" data-act="recv" data-id="' + o.id + '">确认收货</button>');
    }
    if (isSell && o.status === "pending_pay") {
      btns.push('<button type="button" class="btn" data-act="mock-pay" data-id="' + o.id + '">模拟买家付款</button>');
      btns.push('<button type="button" class="btn btn-line" data-act="cancel" data-id="' + o.id + '">关闭订单</button>');
    }
    if (isSell && o.status === "pending_ship") {
      btns.push('<button type="button" class="btn" data-act="ship" data-id="' + o.id + '">发货</button>');
    }
    if (isSell && o.status === "pending_recv") {
      btns.push('<button type="button" class="btn btn-line" data-act="mock-recv" data-id="' + o.id + '">模拟买家收货</button>');
    }
    if (o.status === "done") btns.push('<span class="muted">交易成功</span>');
    if (o.status === "cancelled") btns.push('<span class="muted">订单已关闭</span>');
    return btns.join("");
  }

  function orderSummary(o) {
    return '' +
      '<div class="order-top"><span>' + esc(o.id) + " · " + fmt(o.createdAt) + '</span><span class="st">' + (STATUS[o.status] || "") + "</span></div>" +
      '<a class="order-mini" href="#/item/' + encodeURIComponent(o.productId) + '">' + coverHTML(o, "thumb") +
        '<div><div class="ptitle">' + esc(o.title) + '</div><div class="muted">' + esc(o.sellerId === "me" ? "买家 " + o.buyerName : "卖家 " + o.sellerName) + '</div><div class="pprice"><small>¥</small>' + money(totalOf(o)) + "</div></div></a>";
  }

  function orderCard(o) {
    return '<article class="order-card">' +
      '<a href="#/order/' + encodeURIComponent(o.id) + '" style="text-decoration:none;color:inherit;display:block">' +
        '<div class="order-top"><span>' + esc(o.id) + " · " + fmt(o.createdAt) + '</span><span class="st">' + (STATUS[o.status] || "") + "</span></div>" +
        '<div class="order-mini">' + coverHTML(o, "thumb") +
          '<div><div class="ptitle">' + esc(o.title) + '</div><div class="muted">' + esc(o.sellerId === "me" ? "买家 " + o.buyerName : "卖家 " + o.sellerName) + '</div><div class="pprice"><small>¥</small>' + money(totalOf(o)) + "</div></div>" +
        "</div></a>" +
      '<div class="order-actions">' + orderActions(o) + "</div></article>";
  }

  function viewOrders() {
    var role = state.route.role === "sell" ? "sell" : "buy";
    var filters = [["all", "全部"], ["pending_pay", "待付款"], ["pending_ship", "待发货"], ["pending_recv", "待收货"], ["done", "已完成"]];
    var list = state.orders.filter(function (o) {
      var isSell = o.sellerId === "me";
      if (role === "sell" && !isSell) return false;
      if (role === "buy" && isSell) return false;
      if (state.orderFilter !== "all" && o.status !== state.orderFilter) return false;
      return true;
    });
    var emptyText = state.orderFilter === "all"
      ? (role === "sell" ? "还没有卖出的订单。可以在「我的」里模拟买家下单。" : "还没有买到的宝贝。")
      : "这个状态下没有订单";
    return '' +
      '<h1 class="page-title">我的订单</h1>' +
      '<div class="roles">' +
        '<a class="' + (role === "buy" ? "on" : "") + '" href="#/orders?role=buy">我买到的</a>' +
        '<a class="' + (role === "sell" ? "on" : "") + '" href="#/orders?role=sell">我卖出的</a>' +
      "</div>" +
      '<div class="filters">' + filters.map(function (pair) {
        return '<button type="button" data-act="ofilter" data-status="' + pair[0] + '"' + (state.orderFilter === pair[0] ? ' class="on"' : "") + ">" + pair[1] + "</button>";
      }).join("") + "</div>" +
      '<div class="stack" style="margin-top:12px">' +
        (list.length ? list.map(orderCard).join("") : '<div class="empty"><div class="empty-ico">🐟</div><p>' + emptyText + '</p>' + (role === "buy" ? '<a class="btn" href="#/">去首页看看</a>' : '<a class="btn" href="#/publish">去发布</a>') + "</div>") +
      "</div>";
  }

  function stepper(o) {
    if (o.status === "cancelled") return '<div class="banner">订单已取消</div>';
    var order = ["pending_pay", "pending_ship", "pending_recv", "done"];
    var labels = ["提交订单", "买家付款", "卖家发货", "确认收货"];
    var idx = order.indexOf(o.status);
    return '<div class="steps">' + labels.map(function (label, i) {
      var cls = "";
      if (o.status === "done" || i < idx) cls = "done";
      else if (i === idx) cls = "on";
      return '<div class="step ' + cls + '">' + label + "</div>";
    }).join("") + "</div>";
  }

  function viewOrder() {
    var o = orderById(state.route.id);
    if (!o) return notFound("订单不存在");
    var isSell = o.sellerId === "me";
    return '' +
      crumb([{ href: "#/", text: "首页" }, { href: "#/orders?role=" + (isSell ? "sell" : "buy"), text: "我的订单" }, { text: "订单详情" }]) +
      '<h1 class="page-title">订单详情</h1>' +
      '<div class="stack">' +
        '<div class="panel">' + stepper(o) + '<div class="muted">订单号 ' + esc(o.id) + " · " + fmt(o.createdAt) + "</div></div>" +
        '<div class="panel"><h2>收货信息</h2><p><b>' + esc(o.buyerName) + "</b> " + esc(maskPhone(o.buyerPhone)) + '</p><p class="muted">' + esc(o.buyerAddress) + "</p></div>" +
        '<div class="panel"><h2>' + (isSell ? "买家" : "卖家") + "：" + esc(isSell ? o.buyerName : o.sellerName) + "</h2>" + orderSummary(o) +
          '<div class="rowline"><span>配送</span><span>' + esc(shipText(o)) + "</span></div>" +
          '<div class="rowline"><span>留言</span><span>' + esc(o.note || "无") + "</span></div>" +
          '<div class="rowline"><span>支付方式</span><span>' + esc(o.payMethod || "未选择") + "</span></div>" +
          '<div class="rowline total"><span>实付款</span><span>¥' + money(totalOf(o)) + "</span></div>" +
          '<div class="order-actions">' + orderActions(o) + "</div>" +
        "</div>" +
      "</div>";
  }

  function viewMessages() {
    if (!state.threads.length) {
      return '<h1 class="page-title">消息</h1><div class="empty"><div class="empty-ico">💬</div><p>还没有会话，去宝贝页和卖家聊聊</p><a class="btn" href="#/">去首页</a></div>';
    }
    return '<h1 class="page-title">消息</h1><div class="panel">' + state.threads.map(function (t) {
      var last = t.logs[t.logs.length - 1];
      return '' +
        '<a class="thread" href="#/chat/' + encodeURIComponent(t.peerId) + '">' +
          avatarHTML(t.peerName, "pav lg") +
          '<span class="tmain"><span class="tname">' + esc(t.peerName) + (t.unread ? '<i class="dot"></i>' : "") + "</span>" +
            '<span class="tlast">' + esc(last ? last.text : "") + "</span>" +
            '<span class="titem">相关宝贝：' + esc(t.itemTitle || "") + "</span></span>" +
          '<span class="ttime">' + (last ? ago(last.time) : "") + "</span>" +
        "</a>";
    }).join("") + "</div>";
  }

  function viewChat() {
    var thread = state.threads.filter(function (t) { return t.peerId === state.route.id; })[0];
    if (!thread) return notFound("会话不存在");
    return '' +
      '<div class="chat">' +
        '<div class="chat-head"><a href="#/messages">返回</a><div><b>' + esc(thread.peerName) + '</b><div class="muted"><a href="#/item/' + encodeURIComponent(thread.itemId) + '">' + esc(thread.itemTitle) + "</a></div></div></div>" +
        '<div class="chat-log" id="chat-log">' + thread.logs.map(function (log) {
          return '<div class="bubble ' + (log.from === "me" ? "me" : "peer") + '">' + esc(log.text) + "</div>";
        }).join("") + "</div>" +
        '<form id="chat-form" class="chat-form" novalidate>' +
          '<input id="chat-input" name="text" maxlength="200" placeholder="想跟卖家说点什么" autocomplete="off">' +
          '<button class="btn" type="submit">发送</button>' +
        "</form>" +
      "</div>";
  }

  function itemStatusText(p) {
    var t = tradeState(p);
    if (t.type === "sold") return "已售出";
    if (t.type === "order") return STATUS[t.order.status] || "交易中";
    return "在售";
  }

  function viewMe() {
    var mine = state.products.filter(function (p) { return p.seller && p.seller.id === "me"; })
      .sort(function (a, b) { return b.createdAt - a.createdAt; });
    var buyN = state.orders.filter(function (o) { return o.sellerId !== "me"; }).length;
    var sellN = state.orders.filter(function (o) { return o.sellerId === "me"; }).length;
    var profile = state.profile;
    return '' +
      '<div class="panel">' +
        '<div class="me-head">' + avatarHTML(profile.name, "pav lg") +
          '<div><div class="me-name">' + esc(profile.name) + '<span class="credit">信用极好</span></div><div class="muted">' + esc(profile.city) + " · " + esc(maskPhone(profile.phone)) + "</div></div>" +
        "</div>" +
        '<div class="stats">' +
          '<a href="#/me"><b>' + mine.length + "</b><span>我发布的</span></a>" +
          '<a href="#/orders?role=buy"><b>' + buyN + "</b><span>我买到的</span></a>" +
          '<a href="#/orders?role=sell"><b>' + sellN + "</b><span>我卖出的</span></a>" +
          '<a href="#/messages"><b>' + state.threads.length + "</b><span>消息</span></a>" +
        "</div>" +
      "</div>" +
      '<div class="panel" style="margin-top:12px"><h2>我发布的</h2>' +
        (mine.length ? mine.map(function (p) {
          var t = tradeState(p);
          var actions = ['<a class="btn btn-line" href="#/item/' + encodeURIComponent(p.id) + '">查看</a>'];
          if (t.type === "order") actions.push('<a class="btn" href="#/order/' + t.order.id + '">查看订单</a>');
          else if (t.type === "sale") actions.push('<button type="button" class="btn" data-act="mock-buy" data-id="' + p.id + '">模拟买家下单</button>');
          if (t.type !== "order") actions.push('<button type="button" class="btn btn-line" data-act="delete" data-id="' + p.id + '">删除</button>');
          return '<div class="mine-row">' + coverHTML(p, "thumb") +
            '<div class="mine-main"><div class="ptitle">' + esc(p.title) + '</div><div class="pprice"><small>¥</small>' + money(p.price) + '</div><div class="muted">' + itemStatusText(p) + "</div></div>" +
            '<div class="order-actions">' + actions.join("") + "</div></div>";
        }).join("") : '<div class="empty"><p>还没有在卖的宝贝</p><a class="btn" href="#/publish">发布闲置</a></div>') +
      "</div>" +
      '<form id="profile-form" class="panel" style="margin-top:12px" novalidate>' +
        "<h2>编辑资料</h2>" +
        '<label class="field"><span>昵称</span><input name="name" maxlength="12" value="' + esc(profile.name) + '"></label>' +
        '<label class="field"><span>手机号</span><input name="phone" inputmode="numeric" maxlength="11" value="' + esc(profile.phone) + '"></label>' +
        '<label class="field"><span>城市</span><input name="city" maxlength="10" value="' + esc(profile.city) + '"></label>' +
        '<label class="field"><span>默认地址</span><textarea name="address" maxlength="80">' + esc(profile.address) + "</textarea></label>" +
        '<button class="btn" type="submit">保存资料</button>' +
      "</form>" +
      '<button type="button" class="text-btn" data-act="reset">恢复示例数据</button>';
  }

  function viewHTML() {
    var titles = {
      home: "闲鱼",
      item: "宝贝详情",
      publish: "发布闲置",
      checkout: "确认订单",
      orders: "我的订单",
      order: "订单详情",
      messages: "消息",
      chat: "聊天",
      me: "我的"
    };
    document.title = state.route.name === "home" ? "闲鱼" : (titles[state.route.name] || "闲鱼") + " - 闲鱼";
    if (state.route.name === "home") return viewHome();
    if (state.route.name === "item") return viewItem();
    if (state.route.name === "publish") return viewPublish();
    if (state.route.name === "checkout") return viewCheckout();
    if (state.route.name === "orders") return viewOrders();
    if (state.route.name === "order") return viewOrder();
    if (state.route.name === "messages") return viewMessages();
    if (state.route.name === "chat") return viewChat();
    if (state.route.name === "me") return viewMe();
    return notFound("页面不存在");
  }

  function paintBadges() {
    [["msg", unreadCount()], ["order", todoCount()]].forEach(function (pair) {
      document.querySelectorAll('[data-badge="' + pair[0] + '"]').forEach(function (el) {
        el.hidden = !pair[1];
        el.textContent = pair[1] > 99 ? "99+" : String(pair[1] || "");
      });
    });
  }

  function render() {
    parseRoute();
    touchRouteEffects();
    document.getElementById("app").innerHTML =
      topbar() +
      '<main id="view" class="wrap page">' + viewHTML() + "</main>" +
      '<footer class="foot wrap">本地演示：宝贝、订单和聊天只保存在这台浏览器里，支付不会真实扣款。</footer>' +
      tabbar();
    var log = document.getElementById("chat-log");
    if (log) log.scrollTop = log.scrollHeight;
    paintBadges();
  }

  function refreshHomeList() {
    var grid = document.getElementById("grid");
    if (!grid) return;
    var list = filtered();
    grid.innerHTML = cardsHTML(list);
    var count = document.getElementById("result-count");
    if (count) count.textContent = "共 " + list.length + " 件";
  }

  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 720;
        var width = img.width;
        var height = img.height;
        var scale = Math.min(1, max / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("read"));
      };
      img.src = url;
    });
  }

  function onPic(input) {
    var file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    if (file.type.indexOf("image/") !== 0) return toast("请选择图片");
    if (file.size > 8 * 1024 * 1024) return toast("图片请小于 8MB");
    resizeImage(file).then(function (url) {
      state.pendingImage = url;
      var box = document.getElementById("preview");
      if (box) box.innerHTML = '<img src="' + url + '" alt="">';
    }).catch(function () {
      toast("图片读取失败");
    });
  }

  function submitPublish(form) {
    var fd = new FormData(form);
    var title = String(fd.get("title") || "").trim();
    var price = Math.round(Number(fd.get("price")) * 100) / 100;
    var category = String(fd.get("category") || "");
    var condition = String(fd.get("condition") || "");
    var desc = String(fd.get("desc") || "").trim();
    var city = String(fd.get("city") || "").trim();
    var shipType = String(fd.get("shipType") || "包邮");
    var freight = 0;
    if (title.length < 4) return toast("标题至少 4 个字");
    if (!isFinite(price) || price <= 0 || price > 999999) return toast("请填写合理价格");
    if (!category) return toast("请选择分类");
    if (!condition) return toast("请选择成色");
    if (!city) return toast("请填写城市");
    if (shipType === "运费") {
      freight = Math.round(Number(fd.get("freight")) * 100) / 100;
      if (!isFinite(freight) || freight < 0 || freight > 999) return toast("请填写运费");
    }
    var look = LOOKS[category] || LOOKS["其他"];
    var product = {
      id: "u" + Date.now(),
      title: title.slice(0, 60),
      desc: desc.slice(0, 500),
      price: price,
      compareAt: 0,
      category: category,
      condition: condition,
      city: city.slice(0, 10),
      shipType: shipType,
      freight: shipType === "运费" ? freight : 0,
      emoji: look[0],
      cover: look[1],
      image: state.pendingImage || "",
      status: "on",
      createdAt: Date.now(),
      rank: 0,
      views: 0,
      wants: 0,
      wanted: false,
      seller: { id: "me", name: state.profile.name, city: city.slice(0, 10), years: 1, sold: 0, rate: 100 }
    };
    state.products.unshift(product);
    if (!saveProducts()) {
      state.products.shift();
      return;
    }
    state.pendingImage = "";
    toast("已上架");
    if (location.hash !== "#/") location.hash = "#/";
    else render();
  }

  function submitCheckout(form) {
    var p = itemById(state.route.id);
    if (!p) return toast("宝贝不存在");
    if (p.seller.id === "me") return toast("不能购买自己的宝贝");
    if (tradeState(p).type !== "sale") return toast("宝贝当前不可购买");
    var name = form.recvName.value.trim();
    var phone = form.recvPhone.value.trim();
    var addr = form.recvAddr.value.trim();
    var note = form.note.value.trim();
    var payMethod = form.payMethod.value || "支付宝";
    if (!name) return toast("请填写收货人");
    if (!/^1\d{10}$/.test(phone)) return toast("请填写 11 位手机号");
    if (addr.length < 6) return toast("请填写完整地址");
    state.profile.name = name.slice(0, 12);
    state.profile.phone = phone;
    state.profile.address = addr.slice(0, 80);
    saveProfile();
    var order = {
      id: "XY" + String(Date.now()).slice(-8) + Math.floor(Math.random() * 90 + 10),
      productId: p.id,
      title: p.title,
      price: p.price,
      freight: p.shipType === "运费" ? Number(p.freight) || 0 : 0,
      shipType: p.shipType,
      city: p.city,
      payMethod: payMethod,
      image: p.image,
      emoji: p.emoji,
      cover: p.cover,
      sellerId: p.seller.id,
      sellerName: sellerOf(p).name,
      buyerName: state.profile.name,
      buyerPhone: phone,
      buyerAddress: addr.slice(0, 80),
      note: note.slice(0, 80),
      status: "pending_pay",
      createdAt: Date.now()
    };
    state.orders.unshift(order);
    if (!saveOrders()) {
      state.orders.shift();
      return;
    }
    toast("订单已提交，请支付");
    location.hash = "#/order/" + order.id;
  }

  function createMockOrder(id) {
    var p = itemById(id);
    if (!p || p.seller.id !== "me") return toast("只能模拟自己宝贝的买家");
    if (tradeState(p).type !== "sale") return toast("这件宝贝当前不能下单");
    var order = {
      id: "XY" + String(Date.now()).slice(-8) + Math.floor(Math.random() * 90 + 10),
      productId: p.id,
      title: p.title,
      price: p.price,
      freight: p.shipType === "运费" ? Number(p.freight) || 0 : 0,
      shipType: p.shipType,
      city: p.city,
      payMethod: "支付宝",
      image: p.image,
      emoji: p.emoji,
      cover: p.cover,
      sellerId: "me",
      sellerName: state.profile.name,
      buyerName: "鱼友_小满",
      buyerPhone: "13900001111",
      buyerAddress: "浙江省杭州市西湖区文三路100号",
      note: "你好，我要了，今天能发货吗？",
      status: "pending_pay",
      createdAt: Date.now()
    };
    state.orders.unshift(order);
    saveOrders();
    toast("已模拟买家下单");
    location.hash = "#/order/" + order.id;
  }

  function doPay(id) {
    var o = orderById(id);
    if (!o || o.status !== "pending_pay") return toast("订单状态已变化");
    o.status = "pending_ship";
    o.paidAt = Date.now();
    saveOrders();
    toast("支付成功，等待卖家发货");
    render();
  }

  function markShipped(id) {
    var o = orderById(id);
    if (!o || o.status !== "pending_ship") return toast("订单状态已变化");
    o.status = "pending_recv";
    o.shippedAt = Date.now();
    saveOrders();
    toast("已发货，等待确认收货");
    render();
  }

  function finishOrder(id) {
    var o = orderById(id);
    if (!o || o.status !== "pending_recv") return toast("订单状态已变化");
    o.status = "done";
    o.doneAt = Date.now();
    var p = itemById(o.productId);
    if (p) p.status = "sold";
    saveOrders();
    saveProducts();
    toast("交易完成");
    render();
  }

  function cancelOrder(id) {
    var o = orderById(id);
    if (!o || o.status !== "pending_pay") return toast("当前状态不能取消");
    o.status = "cancelled";
    var p = itemById(o.productId);
    if (p && p.status !== "sold") p.status = "on";
    saveOrders();
    saveProducts();
    toast("订单已关闭");
    render();
  }

  function openChat(product) {
    if (!product || product.seller.id === "me") return toast("这是你自己的宝贝");
    var seller = product.seller;
    var thread = state.threads.filter(function (t) { return t.peerId === seller.id; })[0];
    if (!thread) {
      thread = {
        id: "t" + Date.now(),
        peerId: seller.id,
        peerName: seller.name,
        itemId: product.id,
        itemTitle: product.title,
        unread: 0,
        autoReplied: false,
        logs: [{ from: "peer", text: "你好，宝贝还在的，看中可以直接拍。", time: Date.now() }]
      };
      state.threads.unshift(thread);
    } else {
      thread.itemId = product.id;
      thread.itemTitle = product.title;
      thread.peerName = seller.name;
    }
    saveThreads();
    location.hash = "#/chat/" + encodeURIComponent(seller.id);
  }

  function autoReply(peerId) {
    var thread = state.threads.filter(function (t) { return t.peerId === peerId; })[0];
    if (!thread) return;
    thread.logs.push({ from: "peer", text: "在的，价格可以小刀一点，诚心要直接下单就行。", time: Date.now() });
    var onThis = state.route.name === "chat" && state.route.id === peerId;
    if (!onThis) thread.unread = (thread.unread || 0) + 1;
    saveThreads();
    if (onThis || state.route.name === "messages") render();
    else paintBadges();
  }

  function submitChat(form) {
    var text = form.text.value.trim();
    if (!text) return;
    var thread = state.threads.filter(function (t) { return t.peerId === state.route.id; })[0];
    if (!thread) return;
    thread.logs.push({ from: "me", text: text.slice(0, 200), time: Date.now() });
    var peerId = thread.peerId;
    var needReply = !thread.autoReplied;
    if (needReply) thread.autoReplied = true;
    saveThreads();
    render();
    var input = document.getElementById("chat-input");
    if (input) input.focus();
    if (needReply) setTimeout(function () { autoReply(peerId); }, 700);
  }

  function saveProfileForm(form) {
    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var city = form.city.value.trim();
    var address = form.address.value.trim();
    if (!name) return toast("请填写昵称");
    if (!/^1\d{10}$/.test(phone)) return toast("请填写 11 位手机号");
    if (!city) return toast("请填写城市");
    if (address.length < 6) return toast("请填写完整地址");
    state.profile.name = name.slice(0, 12);
    state.profile.phone = phone;
    state.profile.city = city.slice(0, 10);
    state.profile.address = address.slice(0, 80);
    saveProfile();
    toast("资料已保存");
    render();
  }

  function restoreDemo() {
    localStorage.removeItem("xy_products");
    localStorage.removeItem("xy_orders");
    localStorage.removeItem("xy_threads");
    localStorage.removeItem("xy_profile");
    localStorage.removeItem("xy_inited");
    state.keyword = "";
    state.category = "推荐";
    state.sort = "rank";
    state.orderFilter = "all";
    state.pendingImage = "";
    load();
    toast("已恢复示例数据");
    if ((location.hash || "#/") !== "#/") location.hash = "#/";
    else render();
  }

  function onClick(e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    var act = el.dataset.act;
    var id = el.dataset.id;
    if (act === "modal-yes" || act === "modal-no") {
      closeModal(act === "modal-yes");
      return;
    }
    if (act === "cat") {
      state.category = el.dataset.cat;
      render();
      return;
    }
    if (act === "sort") {
      state.sort = el.dataset.sort;
      render();
      return;
    }
    if (act === "clear-q") {
      state.keyword = "";
      if (state.route.name !== "home") location.hash = "#/";
      else {
        var q = document.getElementById("q");
        if (q) {
          q.value = "";
          q.parentElement.classList.remove("has");
          q.focus();
        }
        refreshHomeList();
      }
      return;
    }
    if (act === "ofilter") {
      state.orderFilter = el.dataset.status;
      render();
      return;
    }
    if (act === "want") {
      var product = itemById(id);
      if (!product) return;
      product.wanted = !product.wanted;
      product.wants = Math.max(0, product.wants + (product.wanted ? 1 : -1));
      saveProducts();
      toast(product.wanted ? "已加入想要" : "已取消想要");
      render();
      return;
    }
    if (act === "chat") {
      openChat(itemById(id));
      return;
    }
    if (act === "mock-buy") {
      confirmAct("模拟一位买家拍下这件宝贝？", function () { createMockOrder(id); });
      return;
    }
    if (act === "pay") {
      var paying = orderById(id);
      if (!paying) return;
      confirmAct("确认支付 ¥" + money(totalOf(paying)) + "？这是本地演示，不会真实扣款。", function () { doPay(id); });
      return;
    }
    if (act === "mock-pay") {
      confirmAct("模拟买家完成付款？", function () { doPay(id); });
      return;
    }
    if (act === "ship") {
      confirmAct("确认发货？演示环境不会生成真实物流。", function () { markShipped(id); });
      return;
    }
    if (act === "mock-ship") {
      confirmAct("模拟卖家发货？", function () { markShipped(id); });
      return;
    }
    if (act === "recv" || act === "mock-recv") {
      confirmAct(act === "recv" ? "确认已经收到宝贝？" : "模拟买家确认收货？", function () { finishOrder(id); });
      return;
    }
    if (act === "cancel") {
      confirmAct("确定取消这个订单？", function () { cancelOrder(id); });
      return;
    }
    if (act === "delete") {
      confirmAct("确定删除这件宝贝？", function () {
        var target = itemById(id);
        if (!target || !target.seller || target.seller.id !== "me") return;
        if (tradeState(target).type === "order") return toast("交易进行中，不能删除");
        state.products = state.products.filter(function (p) { return p.id !== id; });
        saveProducts();
        toast("已删除");
        render();
      });
      return;
    }
    if (act === "reset") {
      confirmAct("恢复示例数据会清空你发布的宝贝和订单，确定继续？", restoreDemo);
    }
  }

  function onInput(e) {
    if (e.target.id !== "q" || e.isComposing) return;
    state.keyword = e.target.value.trim();
    e.target.parentElement.classList.toggle("has", !!state.keyword);
    if (state.route.name !== "home") {
      location.hash = "#/";
      return;
    }
    refreshHomeList();
  }

  function onSubmit(e) {
    var form = e.target;
    if (!form || !form.id) return;
    if (form.id !== "pub-form" && form.id !== "checkout-form" && form.id !== "chat-form" && form.id !== "profile-form") return;
    e.preventDefault();
    if (form.id === "pub-form") submitPublish(form);
    if (form.id === "checkout-form") submitCheckout(form);
    if (form.id === "chat-form") submitChat(form);
    if (form.id === "profile-form") saveProfileForm(form);
  }

  function onChange(e) {
    if (e.target.id === "pic") onPic(e.target);
    if (e.target.name === "shipType") {
      var row = document.getElementById("freight-row");
      if (row) row.hidden = e.target.value !== "运费";
    }
  }

  function init() {
    load();
    document.addEventListener("click", onClick);
    document.addEventListener("input", onInput);
    document.addEventListener("submit", onSubmit);
    document.addEventListener("change", onChange);
    window.addEventListener("hashchange", function () { render(); });
    if (!location.hash || location.hash === "#") location.hash = "#/";
    else render();
  }

  init();
})();
