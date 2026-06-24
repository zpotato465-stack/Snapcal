/* SnapCal — main app logic (vanilla JS, no build step). */
(function () {
  "use strict";

  // ---------------------------------------------------------------- storage
  var STORE_KEY = "snapcal.v1";
  var DEFAULT = {
    onboarded: false,
    lang: null, // resolved at boot
    units: "metric",
    profile: { sex: "male", age: 30, heightCm: 175, weightKg: 75, activity: "moderate", goalType: "maintain" },
    goal: 2000,
    macroSplit: { p: 0.30, c: 0.40, f: 0.30 },
    log: {}, // { "YYYY-MM-DD": [entry, ...] }
  };

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign({}, DEFAULT, JSON.parse(raw));
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {} }

  var S = load();
  window.SnapState = S; // expose for i18n helpers

  // auto-detect language on first run
  if (!S.lang) {
    var nav = (navigator.language || "en").toLowerCase();
    S.lang = nav.indexOf("ar") === 0 ? "ar" : "en";
  }

  // ---------------------------------------------------------------- helpers
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }
  function todayKey(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function round(n) { return Math.round(n); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  // run a callback after the element is painted (two rAFs) so CSS transitions play
  function animateIn(fn) {
    requestAnimationFrame(function () { requestAnimationFrame(fn); });
  }
  // count a number up from 0 -> target inside a text node
  function countUp(node, target, dur) {
    var start = null;
    function frame(ts) {
      if (start == null) start = ts;
      var p = clamp((ts - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      node.textContent = String(round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // unit conversions
  var LB_PER_KG = 2.2046226218;
  function kgToLb(kg) { return kg * LB_PER_KG; }
  function lbToKg(lb) { return lb / LB_PER_KG; }
  function cmToFtIn(cm) { var totalIn = cm / 2.54; var ft = Math.floor(totalIn / 12); return { ft: ft, in: Math.round(totalIn - ft * 12) }; }
  function ftInToCm(ft, inch) { return ((ft * 12) + inch) * 2.54; }

  // ---------------------------------------------------------------- nutrition math
  var ACTIVITY = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
  var GOAL_ADJ = { lose: -500, maintain: 0, gain: 500 };

  function calcGoal(p) {
    // Mifflin–St Jeor
    var bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === "male" ? 5 : -161);
    var tdee = bmr * (ACTIVITY[p.activity] || 1.55);
    var goal = tdee + (GOAL_ADJ[p.goalType] || 0);
    return Math.max(1200, round(goal / 10) * 10);
  }
  function macroTargets() {
    var g = S.goal, m = S.macroSplit;
    return {
      p: round((g * m.p) / 4),  // 4 kcal/g protein
      c: round((g * m.c) / 4),  // 4 kcal/g carbs
      f: round((g * m.f) / 9),  // 9 kcal/g fat
    };
  }

  // ---------------------------------------------------------------- emoji
  var EMOJI = {
    apple: "🍎", banana: "🍌", orange: "🍊", lemon: "🍋", strawberry: "🍓", pineapple: "🍍",
    pomegranate: "🍎", fig: "🟣", grapes: "🍇", watermelon: "🍉", dates: "🌴",
    egg: "🥚", chicken_breast: "🍗", beef: "🥩", salmon: "🐟", tuna: "🐟", shrimp: "🦐",
    rice: "🍚", pasta: "🍝", bread: "🍞", arabic_bread: "🫓", bagel: "🥯", pretzel: "🥨",
    oats: "🥣", potato: "🥔", fries: "🍟", corn: "🌽",
    broccoli: "🥦", cauliflower: "🥬", cucumber: "🥒", tomato: "🍅", carrot: "🥕",
    pepper: "🫑", mushroom: "🍄", zucchini: "🥒", salad: "🥗", avocado: "🥑", guacamole: "🥑",
    milk: "🥛", yogurt: "🥛", cheese: "🧀", hummus: "🥣", falafel: "🧆", nuts: "🥜", peanut_butter: "🥜",
    pizza: "🍕", burger: "🍔", hotdog: "🌭", sandwich: "🥪", burrito: "🌯", shawarma: "🌯",
    kebab: "🍢", rice_chicken: "🍛", soup: "🍲", meatloaf: "🍖", mashed_potato: "🥔",
    ice_cream: "🍦", popsicle: "🍡", chocolate: "🍫", cookie: "🍪", cake: "🍰", donut: "🍩", trifle: "🍮",
    coffee: "☕", espresso: "☕", tea: "🍵", juice: "🧃", soda: "🥤", wine: "🍷", eggnog: "🥛",
  };
  function emojiFor(id) { return EMOJI[id] || "🍽️"; }

  // ---------------------------------------------------------------- log ops
  function dayLog(key) { return S.log[key || todayKey()] || []; }
  function dayTotals(key) {
    return dayLog(key).reduce(function (a, e) {
      a.kcal += e.kcal; a.p += e.p; a.c += e.c; a.f += e.f; return a;
    }, { kcal: 0, p: 0, c: 0, f: 0 });
  }
  function addEntry(entry) {
    var key = todayKey();
    if (!S.log[key]) S.log[key] = [];
    entry.id = Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    entry.ts = Date.now();
    S.log[key].push(entry);
    save();
  }
  function removeEntry(id) {
    var key = todayKey();
    S.log[key] = dayLog(key).filter(function (e) { return e.id !== id; });
    save();
  }

  // build an entry from a DB food + serving + qty
  function entryFromFood(food, serving, qty) {
    var grams = serving.grams * qty;
    var factor = grams / 100;
    return {
      kind: "food", foodId: food.id, emoji: emojiFor(food.id),
      detailEn: qty + "× " + serving.en, detailAr: qty + "× " + serving.ar,
      grams: grams,
      kcal: round(food.kcal * factor), p: round(food.p * factor), c: round(food.c * factor), f: round(food.f * factor),
    };
  }

  // ---------------------------------------------------------------- root render
  var route = "today";
  var lastRoute = null;
  function setLang(lang) {
    S.lang = lang; window.SnapState = S; save();
    document.documentElement.lang = lang;
    document.documentElement.dir = window.I18N[lang].dir;
    render();
  }

  function render() {
    document.documentElement.lang = S.lang;
    document.documentElement.dir = window.I18N[S.lang].dir;
    var root = $("#app");
    root.innerHTML = "";
    if (!S.onboarded) { root.appendChild(Onboarding()); return; }
    var screen;
    if (route === "today") screen = TodayScreen();
    else if (route === "add") screen = AddScreen();
    else if (route === "history") screen = HistoryScreen();
    else screen = SettingsScreen();
    if (route !== lastRoute) { screen.classList.add("screen-in"); lastRoute = route; }
    root.appendChild(screen);
    root.appendChild(TabBar());
  }

  // ---------------------------------------------------------------- Onboarding (one-question-at-a-time wizard)
  var onb = null;
  var STEPS = ["language", "units", "sex", "age", "height", "weight", "activity", "goal"];

  function Onboarding() {
    if (!onb) onb = { i: 0, slideDir: 1, units: S.units, profile: Object.assign({}, S.profile), goal: S.goal, done: false };
    var wrap = el("div", { class: "screen onb" });

    var brand = el("div", { class: "brand brand-sm" }, [
      el("img", { src: "icons/icon-192.png", alt: "SnapCal" }),
      el("div", { class: "name", text: window.I18N[S.lang].appName }),
    ]);
    wrap.appendChild(brand);

    // ----- result screen -----
    if (onb.done) {
      var rcard = el("div", { class: "card goal-result step-card dir-next" });
      rcard.appendChild(el("div", { class: "muted", text: t("yourGoal") }));
      var gnum = el("div", { class: "goal-number", text: "0" });
      rcard.appendChild(gnum);
      rcard.appendChild(el("div", { class: "muted", text: t("kcalPerDay") }));
      wrap.appendChild(rcard);
      countUp(gnum, onb.goal, 900);

      var mt = withGoal(onb.goal, macroTargets);
      wrap.appendChild(el("div", { class: "stats step-card dir-next", style: "animation-delay:.1s" }, [
        statBox(mt.p + "g", t("protein")), statBox(mt.c + "g", t("carbs")), statBox(mt.f + "g", t("fat")),
      ]));
      wrap.appendChild(el("button", { class: "btn pulse", onclick: function () {
        S.units = onb.units; S.profile = onb.profile; S.goal = onb.goal; S.onboarded = true; save();
        onb = null; route = "today"; lastRoute = null; render();
      } }, [t("startTracking")]));
      wrap.appendChild(el("button", { class: "btn ghost", style: "margin-top:10px", onclick: function () {
        onb.done = false; onb.i = STEPS.length - 1; onb.slideDir = -1; render();
      } }, [t("back")]));
      return wrap;
    }

    // ----- progress bar + counter -----
    var total = STEPS.length;
    var pct = ((onb.i + 1) / total) * 100;
    var pbarFill = el("i");
    wrap.appendChild(el("div", { class: "pbar" }, [pbarFill]));
    wrap.appendChild(el("div", { class: "pcount muted", text: t("stepOf").replace("{n}", onb.i + 1).replace("{t}", total) }));
    animateIn(function () { pbarFill.style.width = pct + "%"; });

    // ----- the single question card -----
    var dirClass = onb.slideDir < 0 ? "dir-prev" : (onb.slideDir > 0 ? "dir-next" : "");
    onb.slideDir = 0; // consume; seg/select re-renders don't re-slide
    var c = el("div", { class: "card step-card " + dirClass });
    var key = STEPS[onb.i];
    var enterInput = null; // input that should submit on Enter

    if (key === "language") {
      c.appendChild(stepHead(t("language"), t("welcomeSub")));
      c.appendChild(seg([
        { v: "en", label: "English", active: S.lang === "en" },
        { v: "ar", label: "العربية", active: S.lang === "ar" },
      ], function (v) { setLang(v); }));
    } else if (key === "units") {
      c.appendChild(stepHead(t("units")));
      c.appendChild(seg([
        { v: "metric", label: t("metric"), active: onb.units === "metric" },
        { v: "imperial", label: t("imperial"), active: onb.units === "imperial" },
      ], function (v) { onb.units = v; render(); }));
    } else if (key === "sex") {
      c.appendChild(stepHead(t("sex")));
      c.appendChild(seg([
        { v: "male", label: t("male"), active: onb.profile.sex === "male" },
        { v: "female", label: t("female"), active: onb.profile.sex === "female" },
      ], function (v) { onb.profile.sex = v; }));
    } else if (key === "age") {
      c.appendChild(stepHead(t("age")));
      var ageF = numField("", onb.profile.age, function (v) { onb.profile.age = clamp(parseInt(v) || 0, 5, 120); });
      enterInput = ageF.querySelector("input");
      c.appendChild(ageF);
    } else if (key === "height") {
      c.appendChild(stepHead(t("height")));
      if (onb.units === "metric") {
        var hF = numField(t("cm"), round(onb.profile.heightCm), function (v) { onb.profile.heightCm = clamp(parseFloat(v) || 0, 80, 250); });
        enterInput = hF.querySelector("input");
        c.appendChild(hF);
      } else {
        var fi = cmToFtIn(onb.profile.heightCm);
        c.appendChild(el("div", { class: "row" }, [
          numField(t("ft"), fi.ft, function (v) { fi.ft = parseInt(v) || 0; onb.profile.heightCm = ftInToCm(fi.ft, fi.in); }),
          numField(t("in"), fi.in, function (v) { fi.in = parseInt(v) || 0; onb.profile.heightCm = ftInToCm(fi.ft, fi.in); }),
        ]));
      }
    } else if (key === "weight") {
      c.appendChild(stepHead(t("weight")));
      var wF = onb.units === "metric"
        ? numField(t("kg"), round(onb.profile.weightKg), function (v) { onb.profile.weightKg = clamp(parseFloat(v) || 0, 25, 350); })
        : numField(t("lb"), round(kgToLb(onb.profile.weightKg)), function (v) { onb.profile.weightKg = lbToKg(clamp(parseFloat(v) || 0, 50, 800)); });
      enterInput = wF.querySelector("input");
      c.appendChild(wF);
    } else if (key === "activity") {
      c.appendChild(stepHead(t("activity")));
      c.appendChild(selectField([
        ["sedentary", t("act_sedentary")], ["light", t("act_light")], ["moderate", t("act_moderate")],
        ["active", t("act_active")], ["very", t("act_very")],
      ], onb.profile.activity, function (v) { onb.profile.activity = v; }));
    } else if (key === "goal") {
      c.appendChild(stepHead(t("goal")));
      c.appendChild(selectField([
        ["lose", t("goal_lose")], ["maintain", t("goal_maintain")], ["gain", t("goal_gain")],
      ], onb.profile.goalType, function (v) { onb.profile.goalType = v; }));
    }
    wrap.appendChild(c);

    // ----- nav -----
    var isLast = onb.i === STEPS.length - 1;
    function goNext() {
      if (isLast) { onb.goal = calcGoal(onb.profile); onb.done = true; onb.slideDir = 1; render(); }
      else { onb.i++; onb.slideDir = 1; render(); }
    }
    function goBack() { onb.i--; onb.slideDir = -1; render(); }
    if (enterInput) enterInput.addEventListener("keydown", function (e) { if (e.key === "Enter") goNext(); });

    var nav = el("div", { class: "row onb-nav" });
    if (onb.i > 0) nav.appendChild(el("button", { class: "btn ghost", onclick: goBack }, [t("back")]));
    nav.appendChild(el("button", { class: "btn", onclick: goNext }, [isLast ? t("calculate") : t("next")]));
    wrap.appendChild(nav);
    return wrap;
  }

  function stepHead(title, sub) {
    return el("div", { class: "step-head" }, [
      el("h2", { text: title }),
      sub ? el("div", { class: "muted", text: sub }) : null,
    ]);
  }
  function withGoal(g, fn) { var sv = S.goal; S.goal = g; var r = fn(); S.goal = sv; return r; }

  function fieldLabel(label, control) {
    return el("label", { class: "field" }, [el("span", { text: label }), control]);
  }
  function numField(label, value, onChange) {
    var input = el("input", { type: "number", inputmode: "numeric", value: value });
    input.addEventListener("input", function () { onChange(input.value); });
    return el("label", { class: "field", style: "flex:1" }, [el("span", { text: label }), input]);
  }
  function selectField(options, current, onChange) {
    var sel = el("select");
    options.forEach(function (o) {
      var opt = el("option", { value: o[0], text: o[1] });
      if (o[0] === current) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener("change", function () { onChange(sel.value); });
    return sel;
  }
  function seg(items, onPick) {
    var box = el("div", { class: "seg" });
    items.forEach(function (it) {
      box.appendChild(el("button", { class: it.active ? "active" : "", onclick: function () {
        onPick(it.v);
        if (!it._norender) { Array.prototype.forEach.call(box.children, function (b) { b.classList.remove("active"); }); }
      } }, [it.label]));
    });
    return box;
  }
  function statBox(v, l) { return el("div", { class: "stat" }, [el("div", { class: "v", text: v }), el("div", { class: "l", text: l })]); }

  // ---------------------------------------------------------------- Today
  function TodayScreen() {
    var wrap = el("div", { class: "screen" });
    var tot = dayTotals();
    var goal = S.goal;
    var remaining = goal - tot.kcal;
    var over = remaining < 0;

    wrap.appendChild(el("div", { class: "topbar" }, [
      el("h1", { text: window.I18N[S.lang].appName }),
      el("div", { class: "date", text: new Date().toLocaleDateString(S.lang === "ar" ? "ar" : undefined, { weekday: "long", month: "short", day: "numeric" }) }),
    ]));

    // progress ring
    wrap.appendChild(progressRing(tot.kcal, goal));

    // stats row
    wrap.appendChild(el("div", { class: "stats" }, [
      statBox(round(tot.kcal) + "", t("eaten")),
      statBox((over ? "+" + round(-remaining) : round(remaining) + "") + "", over ? t("over") : t("remaining")),
      statBox(round(goal) + "", t("goalLabel")),
    ]));

    // macros
    var mt = macroTargets();
    wrap.appendChild(el("div", { class: "macros" }, [
      macroBar("p", t("protein"), tot.p, mt.p),
      macroBar("c", t("carbs"), tot.c, mt.c),
      macroBar("f", t("fat"), tot.f, mt.f),
    ]));

    // log
    wrap.appendChild(el("h2", { text: t("todaysLog") }));
    var log = dayLog();
    if (!log.length) {
      wrap.appendChild(el("div", { class: "empty", text: t("emptyLog") }));
    } else {
      log.slice().reverse().forEach(function (e) { wrap.appendChild(logItem(e)); });
    }
    return wrap;
  }

  function progressRing(value, goal) {
    var pct = clamp(value / goal, 0, 1);
    var over = value > goal;
    var R = 96, C = 2 * Math.PI * R;
    var dash = C * pct;
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "220"); svg.setAttribute("height", "220"); svg.setAttribute("viewBox", "0 0 220 220");
    function circle(stroke, dashArr, width) {
      var c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", "110"); c.setAttribute("cy", "110"); c.setAttribute("r", String(R));
      c.setAttribute("fill", "none"); c.setAttribute("stroke", stroke); c.setAttribute("stroke-width", width || "16");
      c.setAttribute("stroke-linecap", "round");
      if (dashArr) c.setAttribute("stroke-dasharray", dashArr);
      return c;
    }
    svg.appendChild(circle("#273449"));
    var fg = circle(over ? "#f87171" : "#22c55e");
    fg.setAttribute("stroke-dasharray", String(C));
    fg.setAttribute("stroke-dashoffset", String(C)); // start empty
    fg.style.transition = "stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)";
    svg.appendChild(fg);
    animateIn(function () { fg.setAttribute("stroke-dashoffset", String(C - dash)); });
    var remaining = goal - value;
    var bigNum = el("span", { text: "0" });
    var big = el("div", { class: "big" }, [over ? el("span", { text: "+" }) : null, bigNum]);
    countUp(bigNum, over ? -remaining : remaining, 800);
    var center = el("div", { class: "ring-center" }, [
      big,
      el("div", { class: "small", text: over ? t("over") : t("remaining") }),
      el("div", { class: "small", text: round(value) + " / " + round(goal) + " " + t("units_kcal") }),
    ]);
    var ring = el("div", { class: "ring" + (over ? " over" : "") });
    ring.appendChild(svg); ring.appendChild(center);
    return el("div", { class: "ring-wrap" }, [ring]);
  }

  function macroBar(cls, label, val, target) {
    var pct = clamp(target ? val / target : 0, 0, 1) * 100;
    var fill = el("i", { style: "width:0%" });
    animateIn(function () { fill.style.width = pct + "%"; });
    return el("div", { class: "macro " + cls }, [
      el("div", { class: "l" }, [el("span", { text: label }), el("span", { text: round(val) + "/" + target + "g" })]),
      el("div", { class: "bar" }, [fill]),
    ]);
  }

  function logItem(e) {
    var name = e.kind === "food" ? foodName(window.getFoodById(e.foodId) || { en: e.foodId }) : (S.lang === "ar" && e.nameAr ? e.nameAr : e.name);
    var detail = S.lang === "ar" ? (e.detailAr || e.detailEn || "") : (e.detailEn || "");
    return el("div", { class: "log-item" }, [
      el("div", { class: "emoji", text: e.emoji || "🍽️" }),
      el("div", { class: "info" }, [
        el("div", { class: "nm", text: name }),
        el("div", { class: "sub", text: detail + (detail ? " · " : "") + e.p + "P " + e.c + "C " + e.f + "F" }),
      ]),
      el("div", { class: "kc", text: round(e.kcal) + " " + t("units_kcal") }),
      el("button", { class: "del", "aria-label": t("delete"), onclick: function () { removeEntry(e.id); render(); } }, ["✕"]),
    ]);
  }

  // ---------------------------------------------------------------- Add
  function AddScreen() {
    var wrap = el("div", { class: "screen" });
    wrap.appendChild(el("h1", { text: t("addFood") }));

    wrap.appendChild(actionCard("📷", t("snapPhoto"), t("snapDesc"), startPhotoFlow));
    wrap.appendChild(actionCard("🏷️", t("scanBarcode"), t("scanDesc"), startBarcodeFlow));

    // search
    wrap.appendChild(el("h2", { style: "margin-top:18px", text: t("searchFood") }));
    var results = el("div", { class: "search-results" });
    var input = el("input", { type: "search", placeholder: t("searchPlaceholder"), autocomplete: "off" });
    function doSearch() {
      var q = input.value.trim().toLowerCase();
      results.innerHTML = "";
      if (!q) return;
      var matches = window.FOODS.filter(function (f) {
        return f.en.toLowerCase().indexOf(q) >= 0 || (f.ar && f.ar.indexOf(input.value.trim()) >= 0) || f.id.indexOf(q) >= 0;
      }).slice(0, 25);
      matches.forEach(function (f) {
        results.appendChild(el("div", { class: "log-item", onclick: function () { openServingPicker(f); } }, [
          el("div", { class: "emoji", text: emojiFor(f.id) }),
          el("div", { class: "info" }, [
            el("div", { class: "nm", text: foodName(f) }),
            el("div", { class: "sub", text: f.kcal + " " + t("units_kcal") + " / 100" + t("units_g") }),
          ]),
          el("div", { class: "kc", text: "＋" }),
        ]));
      });
    }
    input.addEventListener("input", doSearch);
    wrap.appendChild(input);
    wrap.appendChild(results);
    return wrap;
  }
  function actionCard(ico, title, desc, onClick) {
    return el("button", { class: "action-card", onclick: onClick }, [
      el("div", { class: "ico", text: ico }),
      el("div", {}, [el("div", { class: "t", text: title }), el("div", { class: "d", text: desc })]),
    ]);
  }

  // ---------------------------------------------------------------- Serving picker modal
  function openServingPicker(food, presetGramsKcal) {
    var qty = 1;
    var servingIdx = 0;
    var bg = el("div", { class: "modal-bg" });
    bg.addEventListener("click", function (e) { if (e.target === bg) document.body.removeChild(bg); });

    var calcEl = el("div", { class: "calc" });
    var servingSel = el("select");
    food.servings.forEach(function (sv, i) {
      servingSel.appendChild(el("option", { value: String(i), text: servingName(sv) + " (" + sv.grams + t("units_g") + ")" }));
    });
    servingSel.addEventListener("change", function () { servingIdx = parseInt(servingSel.value); update(); });

    var qtyInput = el("input", { type: "number", inputmode: "decimal", value: "1", min: "0.25", step: "0.25" });
    qtyInput.addEventListener("input", function () { qty = parseFloat(qtyInput.value) || 0; update(); });

    function currentEntry() { return entryFromFood(food, food.servings[servingIdx], qty); }
    function update() { calcEl.textContent = round(currentEntry().kcal) + " " + t("units_kcal"); }

    var modal = el("div", { class: "modal" }, [
      el("div", { class: "mhead" }, [
        el("div", { class: "emoji", text: emojiFor(food.id) }),
        el("h2", { text: foodName(food), style: "margin:0" }),
      ]),
      fieldLabel(t("serving"), servingSel),
      fieldLabel(t("quantity"), qtyInput),
      calcEl,
      el("button", { class: "btn", onclick: function () {
        addEntry(currentEntry()); document.body.removeChild(bg); route = "today"; render(); toast("＋ " + foodName(food));
      } }, [t("addToLog")]),
      el("button", { class: "btn ghost", style: "margin-top:10px", onclick: function () { document.body.removeChild(bg); } }, [t("cancel")]),
    ]);
    update();
    bg.appendChild(modal);
    document.body.appendChild(bg);
  }

  // custom (barcode) entry picker — fixed per-100g values
  function openCustomPicker(item) {
    // item: { name, nameAr, emoji, per100: {kcal,p,c,f}, servingGrams }
    var grams = item.servingGrams || 100;
    var bg = el("div", { class: "modal-bg" });
    bg.addEventListener("click", function (e) { if (e.target === bg) document.body.removeChild(bg); });
    var calcEl = el("div", { class: "calc" });
    var gInput = el("input", { type: "number", inputmode: "decimal", value: String(grams), min: "1", step: "1" });
    gInput.addEventListener("input", function () { grams = parseFloat(gInput.value) || 0; update(); });
    function entry() {
      var fac = grams / 100;
      return { kind: "custom", name: item.name, nameAr: item.nameAr || item.name, emoji: item.emoji || "🏷️",
        detailEn: round(grams) + " g", detailAr: round(grams) + " غ", grams: grams,
        kcal: round(item.per100.kcal * fac), p: round(item.per100.p * fac), c: round(item.per100.c * fac), f: round(item.per100.f * fac) };
    }
    function update() { calcEl.textContent = round(entry().kcal) + " " + t("units_kcal"); }
    var modal = el("div", { class: "modal" }, [
      el("div", { class: "mhead" }, [el("div", { class: "emoji", text: item.emoji || "🏷️" }), el("h2", { text: item.name, style: "margin:0" })]),
      fieldLabel(t("quantity") + " (" + t("units_g") + ")", gInput),
      calcEl,
      el("button", { class: "btn", onclick: function () { addEntry(entry()); document.body.removeChild(bg); route = "today"; render(); toast("＋ " + item.name); } }, [t("addToLog")]),
      el("button", { class: "btn ghost", style: "margin-top:10px", onclick: function () { document.body.removeChild(bg); } }, [t("cancel")]),
    ]);
    update();
    bg.appendChild(modal); document.body.appendChild(bg);
  }

  // ---------------------------------------------------------------- Photo detection (on-device)
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (loadScript._loaded[src]) return resolve();
      var s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = function () { loadScript._loaded[src] = true; resolve(); };
      s.onerror = function () { reject(new Error("Failed to load " + src)); };
      document.head.appendChild(s);
    });
  }
  loadScript._loaded = {};

  var mobilenetModel = null;
  function startPhotoFlow() {
    // hidden file input -> camera; image processed entirely on-device
    var input = el("input", { type: "file", accept: "image/*", capture: "environment", style: "display:none" });
    document.body.appendChild(input);
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      document.body.removeChild(input);
      if (file) analyzePhoto(file);
    });
    input.click();
  }

  function analyzePhoto(file) {
    var ov = photoOverlay();
    var url = URL.createObjectURL(file);
    var img = ov.img; img.src = url;
    setStatus(ov, t("loadingModel"));
    var TF = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js";
    var MN = "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js";
    loadScript(TF).then(function () { return loadScript(MN); }).then(function () {
      setStatus(ov, t("analyzing"));
      if (mobilenetModel) return mobilenetModel;
      return window.mobilenet.load({ version: 2, alpha: 1.0 }).then(function (m) { mobilenetModel = m; return m; });
    }).then(function (model) {
      return new Promise(function (res) {
        if (img.complete && img.naturalWidth) return res();
        img.onload = function () { res(); };
      }).then(function () { return model.classify(img, 5); });
    }).then(function (preds) {
      URL.revokeObjectURL(url);
      var foodId = matchPrediction(preds);
      closeOverlay(ov);
      if (foodId) { openServingPicker(window.getFoodById(foodId)); }
      else { toast(t("noMatch")); }
    }).catch(function (err) {
      console.error(err); closeOverlay(ov); toast(t("noMatch"));
    });
  }

  function matchPrediction(preds) {
    for (var i = 0; i < preds.length; i++) {
      var name = (preds[i].className || "").toLowerCase();
      for (var j = 0; j < window.MOBILENET_FOOD_MAP.length; j++) {
        var key = window.MOBILENET_FOOD_MAP[j][0];
        if (name.indexOf(key) >= 0) return window.MOBILENET_FOOD_MAP[j][1];
      }
    }
    return null;
  }

  function photoOverlay() {
    var img = el("img", { class: "preview", style: "width:100%;flex:1;object-fit:contain;background:#000" });
    var status = el("div", { class: "ovstatus" }, [el("span", { class: "spinner" }), el("span", { text: " " })]);
    var ov = el("div", { class: "overlay" }, [
      status, img,
      el("div", { class: "ovbar" }, [el("button", { class: "btn secondary", onclick: function () { closeOverlay(ov); } }, [t("cancel")])]),
    ]);
    ov.img = img; ov.status = status;
    document.body.appendChild(ov);
    return ov;
  }
  function setStatus(ov, text) { ov.status.innerHTML = ""; ov.status.appendChild(el("span", { class: "spinner" })); ov.status.appendChild(document.createTextNode(" " + text)); }
  function closeOverlay(ov) { if (ov && ov.parentNode) { if (ov._stop) ov._stop(); ov.parentNode.removeChild(ov); } }

  // ---------------------------------------------------------------- Barcode scanning
  function startBarcodeFlow() {
    var ZX = "https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js";
    var video = el("video", { autoplay: "", muted: "", playsinline: "" });
    var status = el("div", { class: "ovstatus", text: t("scanning") });
    var frame = el("div", { class: "scan-frame" });
    var ov = el("div", { class: "overlay" }, [
      status, video, frame,
      el("div", { class: "ovbar" }, [el("button", { class: "btn secondary", onclick: function () { closeOverlay(ov); } }, [t("cancel")])]),
    ]);
    document.body.appendChild(ov);

    loadScript(ZX).then(function () {
      var reader = new window.ZXing.BrowserMultiFormatReader();
      ov._stop = function () { try { reader.reset(); } catch (e) {} };
      reader.decodeFromVideoDevice(null, video, function (result, err) {
        if (result) {
          var code = result.getText();
          ov._stop();
          status.textContent = t("lookingUp");
          lookupBarcode(code, ov);
        }
      });
    }).catch(function () { closeOverlay(ov); toast(t("cameraError")); });
  }

  function lookupBarcode(code, ov) {
    fetch("https://world.openfoodfacts.org/api/v0/product/" + encodeURIComponent(code) + ".json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        closeOverlay(ov);
        if (data.status !== 1 || !data.product) { toast(t("notFound")); return; }
        var p = data.product;
        var n = p.nutriments || {};
        var kcal = num(n["energy-kcal_100g"]);
        if (kcal == null && n["energy_100g"] != null) kcal = num(n["energy_100g"]) / 4.184; // kJ -> kcal
        if (kcal == null) { toast(t("notFound")); return; }
        var servingGrams = parseFloat((p.serving_quantity || "").toString()) || 100;
        openCustomPicker({
          name: p.product_name || p.generic_name || ("#" + code),
          nameAr: p.product_name_ar || p.product_name || ("#" + code),
          emoji: "🏷️",
          servingGrams: servingGrams,
          per100: { kcal: round(kcal), p: num(n.proteins_100g) || 0, c: num(n.carbohydrates_100g) || 0, f: num(n.fat_100g) || 0 },
        });
      })
      .catch(function () { closeOverlay(ov); toast(t("notFound")); });
  }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : null; }

  // ---------------------------------------------------------------- History
  function HistoryScreen() {
    var wrap = el("div", { class: "screen" });
    wrap.appendChild(el("h1", { text: t("last7") }));

    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var key = todayKey(d);
      days.push({ key: key, date: d, total: dayTotals(key).kcal });
    }
    var maxV = Math.max(S.goal, days.reduce(function (m, d) { return Math.max(m, d.total); }, 0)) * 1.1;
    var logged = days.filter(function (d) { return d.total > 0; });
    var avg = logged.length ? round(logged.reduce(function (a, d) { return a + d.total; }, 0) / logged.length) : 0;

    wrap.appendChild(el("div", { class: "stats" }, [
      statBox(avg + " " + t("units_kcal"), t("avgIntake")),
      statBox(S.goal + " " + t("units_kcal"), t("goalLabel")),
    ]));

    if (!logged.length) {
      wrap.appendChild(el("div", { class: "empty", text: t("noHistory") }));
      return wrap;
    }

    var chart = el("div", { class: "chart card" });
    days.forEach(function (d, idx) {
      var h = clamp(d.total / maxV, 0, 1) * 100;
      var over = d.total > S.goal;
      var dayLbl = d.date.toLocaleDateString(S.lang === "ar" ? "ar" : undefined, { weekday: "short" });
      var bar = el("div", { class: "bar" + (over ? " over" : ""), style: "height:0%;transition-delay:" + (idx * 60) + "ms" }, [
        d.total ? el("span", { class: "val", text: round(d.total) }) : null,
      ]);
      animateIn(function () { bar.style.height = h + "%"; });
      chart.appendChild(el("div", { class: "col" }, [bar, el("div", { class: "lbl", text: dayLbl })]));
    });
    wrap.appendChild(chart);
    return wrap;
  }

  // ---------------------------------------------------------------- Settings
  function SettingsScreen() {
    var wrap = el("div", { class: "screen" });
    wrap.appendChild(el("h1", { text: t("settings") }));

    // language
    var c1 = el("div", { class: "card" });
    c1.appendChild(fieldLabel(t("language"), seg([
      { v: "en", label: "English", active: S.lang === "en" },
      { v: "ar", label: "العربية", active: S.lang === "ar" },
    ], function (v) { setLang(v); })));
    c1.appendChild(fieldLabel(t("units"), seg([
      { v: "metric", label: t("metric"), active: S.units === "metric" },
      { v: "imperial", label: t("imperial"), active: S.units === "imperial" },
    ], function (v) { S.units = v; save(); render(); })));
    wrap.appendChild(c1);

    // goal / profile
    var c2 = el("div", { class: "card" });
    c2.appendChild(el("h2", { text: t("profile") }));
    c2.appendChild(setRow(t("dailyGoal"), S.goal + " " + t("units_kcal")));
    c2.appendChild(setRow(t("sex"), t(S.profile.sex)));
    c2.appendChild(setRow(t("age"), String(S.profile.age)));
    var hDisp = S.units === "metric" ? round(S.profile.heightCm) + " " + t("cm") : (function () { var fi = cmToFtIn(S.profile.heightCm); return fi.ft + "'" + fi.in + '"'; })();
    var wDisp = S.units === "metric" ? round(S.profile.weightKg) + " " + t("kg") : round(kgToLb(S.profile.weightKg)) + " " + t("lb");
    c2.appendChild(setRow(t("height"), hDisp));
    c2.appendChild(setRow(t("weight"), wDisp));
    c2.appendChild(el("button", { class: "btn secondary", style: "margin-top:12px", onclick: function () {
      onb = { step: "form", units: S.units, profile: Object.assign({}, S.profile), goal: S.goal };
      S.onboarded = false; save(); render();
    } }, [t("editProfile")]));
    c2.appendChild(el("button", { class: "btn ghost", style: "margin-top:10px", onclick: function () {
      S.goal = calcGoal(S.profile); save(); render(); toast(S.goal + " " + t("units_kcal"));
    } }, [t("recalc")]));
    wrap.appendChild(c2);

    // install
    var c3 = el("div", { class: "card" });
    c3.appendChild(el("h2", { text: t("install") }));
    c3.appendChild(el("div", { class: "muted", text: t("installHint") }));
    wrap.appendChild(c3);

    // about
    var c4 = el("div", { class: "card" });
    c4.appendChild(el("h2", { text: t("about") }));
    c4.appendChild(el("div", { class: "muted", text: t("aboutText") }));
    wrap.appendChild(c4);

    // reset
    wrap.appendChild(el("button", { class: "btn danger", onclick: function () {
      if (confirm(t("resetConfirm"))) { localStorage.removeItem(STORE_KEY); S = load(); window.SnapState = S; if (!S.lang) S.lang = "en"; onb = null; route = "today"; render(); }
    } }, [t("resetData")]));

    return wrap;
  }
  function setRow(label, value) { return el("div", { class: "set-row" }, [el("span", { text: label }), el("span", { class: "v", text: value })]); }

  // ---------------------------------------------------------------- Tab bar
  function TabBar() {
    var tabs = [
      { id: "today", ic: "🏠", label: t("tab_today") },
      { id: "history", ic: "📊", label: t("tab_history") },
      { id: "add", ic: "＋", label: t("tab_add"), fab: true },
      { id: "settings", ic: "⚙️", label: t("tab_settings") },
    ];
    var bar = el("div", { class: "tabbar" });
    tabs.forEach(function (tb) {
      bar.appendChild(el("button", { class: (route === tb.id ? "active " : "") + (tb.fab ? "fab" : ""), onclick: function () { route = tb.id; render(); window.scrollTo(0, 0); } }, [
        el("div", { class: "ic", text: tb.ic }),
        el("div", { text: tb.label }),
      ]));
    });
    return bar;
  }

  // ---------------------------------------------------------------- toast
  function toast(msg) {
    var t0 = el("div", { class: "toast", text: msg });
    document.body.appendChild(t0);
    setTimeout(function () { if (t0.parentNode) t0.parentNode.removeChild(t0); }, 1600);
  }

  // ---------------------------------------------------------------- boot
  document.documentElement.lang = S.lang;
  document.documentElement.dir = window.I18N[S.lang].dir;
  save();
  render();
})();
