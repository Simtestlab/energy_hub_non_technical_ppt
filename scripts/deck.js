/* Manapad Energy Hub — non-technical deck: navigation, scaling, maps. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const stage = document.getElementById("stage");
  const slides = Array.from(stage.querySelectorAll(".slide"));
  const count = document.getElementById("count");
  const bar = document.getElementById("bar");
  const ctrl = document.getElementById("ctrl");
  let cur = -1;

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(n);
    return n;
  };

  /* ---------- scale the 1600 x 900 stage to the window ---------- */
  function fit() {
    const s = Math.min(innerWidth / 1600, innerHeight / 900);
    stage.style.transform = "translate(-50%,-50%) scale(" + s + ")";
  }
  addEventListener("resize", fit);
  fit();

  /* ---------- navigation ---------- */
  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur) return;
    if (cur >= 0) slides[cur].classList.remove("on");
    // force restart of entry animations when a slide is revisited
    void slides[n].offsetWidth;
    slides[n].classList.add("on");
    cur = n;
    count.textContent = n + 1 + " / " + slides.length;
    bar.style.width = ((n + 1) / slides.length) * 100 + "%";
    history.replaceState(null, "", "#s" + (n + 1));
    document.title = "Manapad Energy Hub · " + slides[n].dataset.title;
  }
  const next = () => go(cur + 1);
  const prev = () => go(cur - 1);

  function toggleFs() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }

  addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    switch (e.key) {
      case "ArrowRight": case "PageDown": case "ArrowDown": next(); break;
      case " ": e.shiftKey ? prev() : next(); break;
      case "ArrowLeft": case "PageUp": case "ArrowUp": prev(); break;
      case "Home": go(0); break;
      case "End": go(slides.length - 1); break;
      case "f": case "F": toggleFs(); break;
      default: return;
    }
    e.preventDefault();
    wake();
  });
  document.getElementById("next").onclick = next;
  document.getElementById("prev").onclick = prev;
  document.getElementById("fs").onclick = toggleFs;

  let tx = null;
  addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener("touchend", (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    tx = null;
  });

  let idleT;
  function wake() {
    ctrl.classList.remove("idle");
    clearTimeout(idleT);
    idleT = setTimeout(() => { if (!ctrl.matches(":hover")) ctrl.classList.add("idle"); }, 3000);
  }
  addEventListener("mousemove", wake);

  addEventListener("hashchange", () => {
    const m = location.hash.match(/^#s(\d+)$/);
    if (m) go(+m[1] - 1);
  });

  /* ---------- slide 3: fuel drops (1 of 8 does useful work) ---------- */
  const drops = document.getElementById("drops");
  for (let i = 0; i < 8; i++) {
    const s = el("svg", { viewBox: "0 0 30 40", class: i === 0 ? "used" : "", style: "--i:" + i }, drops);
    el("use", { href: "#i-drop" }, s);
  }

  /* ---------- Tamil Nadu outline (schematic, not to scale) ---------- */
  const P = ([lon, lat]) => [(lon - 76.1) * 108, (13.75 - lat) * 108];
  const coast = [[80.33, 13.55], [80.29, 13.08], [80.19, 12.62], [79.98, 12.15], [79.85, 11.93], [79.77, 11.75], [79.78, 11.45], [79.84, 10.92], [79.85, 10.6], [79.87, 10.29], [79.55, 10.3], [79.3, 10.2], [79.12, 9.98], [79.02, 9.74], [79.1, 9.4], [79.18, 9.28], [79.42, 9.18], [79.15, 9.24], [78.8, 9.22], [78.5, 9.13], [78.3, 9.03], [78.15, 8.79], [78.13, 8.55], [78.06, 8.38], [77.85, 8.22], [77.55, 8.08], [77.3, 8.15], [77.15, 8.3]];
  const inland = [[77.2, 8.6], [77.3, 9.1], [77.2, 9.6], [77.3, 10.1], [76.85, 10.6], [76.75, 11.25], [76.4, 11.6], [76.6, 11.85], [77.1, 11.9], [77.6, 12.25], [77.8, 12.75], [78.4, 12.62], [78.7, 12.9], [79.3, 13.15], [79.8, 13.45], [80.33, 13.55]];
  const d = (pts, close) => pts.map((p, i) => (i ? "L" : "M") + P(p).map((v) => v.toFixed(1)).join(",")).join("") + (close ? "Z" : "");

  function drawTN(svg, big) {
    el("path", { d: d(coast.concat(inland), true), class: "land" }, svg);
    el("path", { d: d(coast), class: "coast" }, svg);
    if (big) {
      [[80.27, 13.08, "Chennai", 14], [78.13, 8.79, "Thoothukudi", 14]].forEach(([lon, lat, t, dx]) => {
        const [x, y] = P([lon, lat]);
        el("circle", { cx: x, cy: y, r: 5, class: "city" }, svg);
        el("text", { x: x + dx, y: y + 7, class: "city-t", text: t }, svg);
      });
      // illustrative future villages along the coast (none identified)
      [[78.6, 9.15], [79.25, 9.95], [79.85, 10.7], [79.84, 11.3], [80.1, 12.4], [79.06, 9.55]].forEach((c, i) => {
        const [x, y] = P(c);
        el("circle", { cx: x, cy: y, r: 11, class: "future", style: "--fd:" + (1.4 + i * 0.35).toFixed(2) + "s" }, svg);
      });
    }
    const [mx, my] = P([78.06, 8.38]);
    el("circle", { cx: mx, cy: my, r: 12, class: "pulse" }, svg);
    el("circle", { cx: mx, cy: my, r: 11, class: "pilot" }, svg);
    el("text", { x: mx - 22, y: my + 12, class: "pilot-t", "text-anchor": "end", text: "Manapad", style: big ? "" : "font-size:56px" }, svg);
  }
  drawTN(document.getElementById("tn-small"), false);
  drawTN(document.getElementById("tn-big"), true);

  /* ---------- slide 6: Manapad site concept on the satellite image ---------- */
  const S = window.SITE;
  const layers = document.getElementById("site-layers");
  if (S && layers) {
    const L = (delay) => el("g", { class: "site-layer", style: "--ld:" + delay + "s" }, layers);

    const zone = L(0.6);
    el("polygon", { points: S.yellowZone, class: "zone" }, zone);
    Object.keys(S.solarBlocks).forEach((k) => S.solarBlocks[k].forEach(([x, y]) => {
      el("rect", { x: x - 7, y: y - 3, width: 14, height: 6, class: "panel", transform: "rotate(" + S.solarAngle + " " + x + " " + y + ")" }, zone);
    }));

    const jetty = L(1.2);
    el("path", { d: S.jetty.spine, class: "spine" }, jetty);
    el("path", { d: S.jetty.pontoon, class: "spine", style: "stroke-width:2.5" }, jetty);
    const hulls = ["#ffffff", "#5fb0e8", "#f2b33d", "#e2603f"];
    S.jetty.boats.forEach(([x, y, a, c]) => {
      el("rect", { x: x - 5, y: y - 1.3, width: 10, height: 2.6, rx: 1.2, class: "berth", fill: hulls[c % hulls.length], transform: "rotate(" + a + " " + x + " " + y + ")" }, jetty);
    });

    const route = L(1.8);
    const pts = S.boatRoute.split(" ").reverse().join(" "); // channel mouth -> sea
    el("polyline", { points: pts, class: "route" }, route);
    el("path", { d: "M1426,722 L1434,700 L1442,722", fill: "none", stroke: "#4fb3c9", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round" }, route);

    const labels = L(2.3);
    const callout = (tx, ty, px, py, text, anchor) => {
      el("line", { x1: tx, y1: ty + 6, x2: px, y2: py, class: "lead" }, labels);
      el("circle", { cx: px, cy: py, r: 4, class: "lbl-dot" }, labels);
      el("text", { x: tx, y: ty, class: "lbl", "text-anchor": anchor || "start", text }, labels);
    };
    callout(1270, 470, S.solarHub[0], S.solarHub[1] - 30, "Solar + battery hub");
    callout(880, 735, 1010, 640, "Boat jetty with charging");
    callout(1460, 676, 1434, 700, "To the sea", "middle");
  }

  /* ---------- start ---------- */
  const m = location.hash.match(/^#s(\d+)$/);
  go(m ? +m[1] - 1 : 0);
  wake();
})();
