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
    document.title = "Thoothukudi Energy Hub · " + slides[n].dataset.title;
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

  function drawTN(svg) {
    el("path", { d: d(coast.concat(inland), true), class: "land" }, svg);
    el("path", { d: d(coast), class: "coast" }, svg);
    const [mx, my] = P([78.15, 8.79]);
    el("circle", { cx: mx, cy: my, r: 12, class: "pulse" }, svg);
    el("circle", { cx: mx, cy: my, r: 11, class: "pilot" }, svg);
    el("text", { x: mx - 22, y: my + 12, class: "pilot-t", "text-anchor": "end", text: "Thoothukudi", style: "font-size:40px" }, svg);
  }
  drawTN(document.getElementById("tn-small"));

  /* ---------- vision: Thoothukudi -> Tamil Nadu, then Tamil Nadu joins India (schematic, not to scale) ----------
     Scene A is the Tamil Nadu close-up (P coords). It shrinks into Tamil Nadu's place on the
     India map (Q coords), which fades in underneath, then the network spreads across India. */
  const Q = ([lon, lat]) => [(lon - 68) * 18.5, (37.2 - lat) * 20];
  const dq = (pts, close) => pts.map((p, i) => (i ? "L" : "M") + Q(p).map((v) => v.toFixed(1)).join(",")).join("") + (close ? "Z" : "");
  // Mainland outline, clockwise from Kutch; the Tamil Nadu coast above is spliced in.
  const north = [[68.2, 23.7], [68.8, 24.3], [71.0, 24.6], [70.6, 25.7], [70.0, 26.6], [69.5, 27.1], [70.4, 28.0], [71.9, 27.9], [72.9, 29.0], [73.4, 29.9], [74.6, 31.0], [74.6, 31.9], [75.3, 32.3], [74.6, 32.8], [73.9, 33.6], [73.6, 34.6], [72.6, 35.4], [72.5, 36.0], [73.6, 36.6], [74.6, 37.1], [75.6, 36.8], [76.9, 35.8], [78.0, 35.5], [79.5, 35.6], [80.2, 35.3], [80.3, 34.3], [79.4, 33.1], [78.8, 32.5], [78.8, 31.5], [79.8, 30.9], [80.6, 30.2], [80.1, 28.8], [81.6, 27.9], [83.3, 27.4], [84.6, 27.1], [85.8, 26.6], [87.0, 26.4], [88.1, 26.4], [88.1, 27.8], [88.9, 28.0], [88.8, 27.1], [89.8, 26.7], [92.1, 26.8], [91.7, 27.8], [92.6, 27.9], [94.0, 28.6], [95.4, 29.3], [96.6, 28.9], [97.4, 28.2], [97.0, 27.2], [95.4, 26.6], [94.7, 25.4], [94.6, 24.6], [94.0, 23.8], [93.4, 22.9], [93.2, 22.2], [92.6, 22.0], [92.3, 23.4], [91.9, 24.2], [92.4, 24.9], [92.0, 25.2], [90.0, 25.2], [89.8, 25.9], [89.0, 26.3], [88.4, 26.4], [88.1, 25.6], [88.6, 25.2], [88.0, 24.6], [88.8, 24.1], [88.6, 23.2], [89.0, 22.2], [88.9, 21.6]];
  const east = [[88.2, 21.6], [87.4, 21.6], [86.9, 21.2], [86.9, 20.6], [86.4, 20.0], [85.4, 19.6], [84.8, 19.2], [84.1, 18.3], [83.3, 17.7], [82.3, 16.8], [82.2, 16.5], [81.3, 16.3], [80.9, 15.8], [80.1, 15.2], [80.05, 14.4], [80.2, 13.9]];
  const west = [[76.95, 8.6], [76.6, 8.9], [76.3, 9.5], [76.2, 10.0], [75.8, 11.0], [75.5, 11.7], [74.9, 12.8], [74.6, 13.7], [74.3, 14.5], [73.9, 15.3], [73.6, 15.9], [73.3, 16.8], [73.0, 17.8], [72.85, 18.9], [72.75, 19.9], [72.85, 21.0], [72.6, 21.6], [72.6, 22.2], [72.2, 21.8], [72.1, 21.3], [71.2, 20.8], [70.4, 20.9], [69.5, 21.7], [69.0, 22.3], [69.7, 22.8], [70.4, 22.95], [69.6, 22.95], [68.9, 23.0], [68.4, 23.4]];

  // a link between two points, bowed out to sea (side +1 / -1)
  function arc(proj, a, b, side) {
    const [x1, y1] = proj(a), [x2, y2] = proj(b);
    const dx = x2 - x1, dy = y2 - y1;
    const cx = (x1 + x2) / 2 - dy * 0.22 * side, cy = (y1 + y2) / 2 + dx * 0.22 * side;
    return "M" + x1.toFixed(1) + "," + y1.toFixed(1) + "Q" + cx.toFixed(1) + "," + cy.toFixed(1) + " " + x2.toFixed(1) + "," + y2.toFixed(1);
  }

  function drawIndia(svg) {
    // Every village and hub sits on a vertex of the shoreline, and links follow the shoreline
    // between them (illustrative sites, none identified). Only the island links cross the sea.
    const shore = east.concat(coast, west);
    const at = (pt) => shore.findIndex((q) => q[0] === pt[0] && q[1] === pt[1]);
    const man = coast[22], chennai = coast[1];
    // Tamil Nadu coastal villages, Thoothukudi -> Chennai
    const tn = [man, coast[19], coast[13], coast[10], coast[7], coast[4], coast[2], chennai];
    // fishing hubs up the west coast (Kochi ... Gujarat) and the east coast (... West Bengal)
    const westHubs = [man, [76.2, 10.0], [74.9, 12.8], [73.9, 15.3], [72.85, 18.9], [70.4, 20.9]];
    const eastHubs = [chennai, [80.05, 14.4], [83.3, 17.7], [86.4, 20.0], [87.4, 21.6]];
    const t2 = 1.0, zt = t2 + (tn.length - 2) * 0.35 + 1.1, t3 = zt + 1.9;
    svg.style.setProperty("--zt", zt.toFixed(2) + "s");
    const along = (g, proj, a, b, cls, t) => {
      const i = at(a), j = at(b);
      const pts = i < j ? shore.slice(i, j + 1) : shore.slice(j, i + 1).reverse();
      return el("path", { d: pts.map((p, k) => (k ? "L" : "M") + proj(p).map((v) => v.toFixed(1)).join(",")).join(""), class: "net " + cls, pathLength: 1, style: "--fd:" + t.toFixed(2) + "s" }, g);
    };
    const link = (g, proj, a, b, side, cls, t) => el("path", { d: arc(proj, a, b, side), class: "net " + cls, pathLength: 1, style: "--fd:" + t.toFixed(2) + "s" }, g);
    const pilot = (g, proj, r, lx, ly) => {
      const [mx, my] = proj(man);
      el("circle", { cx: mx, cy: my, r: r, class: "pulse" }, g);
      el("circle", { cx: mx, cy: my, r: r, class: "pilot" }, g);
      el("text", { x: mx + lx, y: my + ly, class: "pilot-t", "text-anchor": "end", text: "Thoothukudi" }, g);
    };

    // India (fades in as Tamil Nadu shrinks into place)
    const B = el("g", { class: "vz-b" }, svg);
    el("path", { d: dq(north.concat(east, coast, west), true), class: "land" }, B);
    el("path", { d: dq(east.concat(coast, west)), class: "coast" }, B);
    [[92.75, 12.5, 4, 26], [92.75, 9.1, 3, 18], [72.7, 10.8, 3, 8]].forEach(([lon, lat, rx, ry]) => {
      const [x, y] = Q([lon, lat]);
      el("ellipse", { cx: x, cy: y, rx: rx, ry: ry, class: "isle" }, B);
    });
    el("path", { d: dq(coast.concat(inland), true), class: "tn-hi" }, B);
    el("text", { x: Q([79.3, 23.3])[0], y: Q([79.3, 23.3])[1], class: "country-t", "text-anchor": "middle", text: "INDIA" }, B);

    // Tamil Nadu network at India scale (appears once the zoom lands)
    const BT = el("g", { class: "vz-bt" }, svg);
    el("text", { x: Q([80.75, 10.4])[0], y: Q([80.75, 10.4])[1], class: "state-t", text: "TAMIL NADU" }, BT);
    for (let i = 1; i < tn.length; i++) along(BT, Q, tn[i - 1], tn[i], "net-tn done", 0);
    tn.slice(1, -1).forEach((c) => {
      const [x, y] = Q(c);
      el("circle", { cx: x, cy: y, r: 7, class: "future done" }, BT);
    });

    // India network
    for (let i = 1; i < westHubs.length; i++) along(svg, Q, westHubs[i - 1], westHubs[i], "net-in", t3 + (i - 1) * 0.3);
    for (let i = 1; i < eastHubs.length; i++) along(svg, Q, eastHubs[i - 1], eastHubs[i], "net-in", t3 + (i - 1) * 0.3);
    link(svg, Q, chennai, [92.72, 11.65], -1, "net-in sea", t3 + 1.3);
    link(svg, Q, westHubs[1], [72.64, 10.57], 1, "net-in sea", t3 + 0.5);
    const hubs = [...westHubs.slice(1).map((c, i) => [c, i]), ...eastHubs.slice(1).map((c, i) => [c, i]), [[92.72, 11.65], 4.3], [[72.64, 10.57], 1.7]];
    hubs.forEach(([c, i]) => {
      const [x, y] = Q(c);
      el("circle", { cx: x, cy: y, r: 7, class: "hub", style: "--fd:" + (t3 + i * 0.3 + 0.25).toFixed(2) + "s" }, svg);
    });
    const NL = el("g", { class: "vz-bt" }, svg);
    [[chennai, "Chennai", 12], [westHubs[4], "Mumbai", -12], [westHubs[1], "Kochi", -12], [eastHubs[2], "Visakhapatnam", 12], [eastHubs[4], "West Bengal", 12]].forEach(([c, t, dx]) => {
      const [x, y] = Q(c);
      el("text", { x: x + dx, y: y + 6, class: "city-t", "text-anchor": dx < 0 ? "end" : "start", text: t }, NL);
    });
    pilot(NL, Q, 9, -16, 26);

    // Tamil Nadu close-up (the opening view, same look as before)
    const A = el("g", { class: "vz-a" }, svg);
    el("path", { d: d(coast.concat(inland), true), class: "land" }, A);
    el("path", { d: d(coast), class: "coast" }, A);
    [[80.27, 13.08, "Chennai", 14]].forEach(([lon, lat, t, dx]) => {
      const [x, y] = P([lon, lat]);
      el("circle", { cx: x, cy: y, r: 5, class: "city" }, A);
      el("text", { x: x + dx, y: y + 7, class: "city-t", text: t }, A);
    });
    for (let i = 1; i < tn.length; i++) along(A, P, tn[i - 1], tn[i], "net-tn", t2 + (i - 1) * 0.35);
    tn.slice(1, -1).forEach((c, i) => {
      const [x, y] = P(c);
      el("circle", { cx: x, cy: y, r: 11, class: "future", style: "--fd:" + (t2 + i * 0.35 + 0.3).toFixed(2) + "s" }, A);
    });
    pilot(A, P, 11, -22, 12);
  }
  drawIndia(document.getElementById("india-map"));

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
