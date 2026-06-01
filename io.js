/* ============================================================
   IO Motion — Runtime (io.js)  ·  v2.2.0
   Zéró függőség. Működik <script>-ként, ES module-ként és CJS-ként.

   Publikus API (window.IOMotion / default export):
     init(scope)      – minden trigger inicializálása egy hatókörön belül
     destroy(scope)   – observerek/listenerek leállítása (SPA/React unmount)
     refresh()        – scrub/reveal újraszámolása (pl. layout után)
     reveal/scroll/scrub/stagger/splitText/pointer/click/confetti(scope)

   Triggerek: io-reveal | io-scroll (egyszer), io-scrub (görgetés-követő),
   io-hover (CSS), io-click, io-now. Effektek: lásd io.css / io-catalog.json
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else if (typeof define === "function" && define.amd) define(factory);
  else root.IOMotion = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var hasWin = typeof window !== "undefined";
  var prefersReduced =
    hasWin && window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- elem-szintű cleanup nyilvántartás ---------- */
  function reg(el, fn) { (el.__ioClean || (el.__ioClean = [])).push(fn); }
  function clean(el) {
    if (el.__ioClean) { el.__ioClean.forEach(function (f) { try { f(); } catch (e) {} }); el.__ioClean = []; }
  }

  /* ---------- Stagger ---------- */
  function initStagger(scope) {
    (scope || document).querySelectorAll(".io-stagger").forEach(function (parent) {
      var step = parseInt(parent.dataset.ioStagger || "80", 10);
      var base = parseInt(parent.dataset.ioStaggerBase || "0", 10);
      Array.prototype.forEach.call(parent.children, function (child, i) {
        child.style.setProperty("--io-delay", base + i * step + "ms");
        child.style.animationDelay = base + i * step + "ms";
      });
    });
  }

  /* ---------- Szöveg szavakra / betűkre bontása ---------- */
  function splitText(scope) {
    var root = scope || document;
    root.querySelectorAll(".io-words").forEach(function (el) {
      if (el.dataset.ioSplit) return;
      el.dataset.ioSplit = "1";
      var step = parseInt(el.dataset.ioStagger || "60", 10);
      var words = el.textContent.split(/(\s+)/);
      el.textContent = "";
      var idx = 0;
      words.forEach(function (w) {
        if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(w)); return; }
        var span = document.createElement("span");
        span.className = "io-w io " + (el.dataset.ioEffect || "io-fade io-slide-up");
        span.style.setProperty("--io-delay", idx * step + "ms");
        span.textContent = w;
        el.appendChild(span);
        idx++;
      });
      el.classList.add("io-reveal");
    });
    root.querySelectorAll(".io-chars").forEach(function (el) {
      if (el.dataset.ioSplit) return;
      el.dataset.ioSplit = "1";
      var step = parseInt(el.dataset.ioStagger || "30", 10);
      var chars = Array.from(el.textContent);
      el.textContent = "";
      chars.forEach(function (c, i) {
        var span = document.createElement("span");
        span.className = "io-c io " + (el.dataset.ioEffect || "io-fade io-slide-up");
        span.style.setProperty("--io-delay", i * step + "ms");
        span.textContent = c;
        el.appendChild(span);
      });
      el.classList.add("io-reveal");
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  var revealIO = null;
  function setInState(el, on) {
    var kids = el.querySelectorAll(".io-w, .io-c");
    if (kids.length) kids.forEach(function (k) { k.classList.toggle("io-in", on); });
    else el.classList.toggle("io-in", on);
  }
  function initReveal(scope) {
    var root = scope || document;
    var targets = root.querySelectorAll(".io-reveal, .io-scroll");

    root.querySelectorAll(".io-now").forEach(function (el) { el.classList.add("io-in"); });

    if (prefersReduced || !hasWin || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("io-in"); });
      root.querySelectorAll(".io-w, .io-c").forEach(function (el) { el.classList.add("io-in"); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            if (entry.target.classList.contains("io-repeat")) setInState(entry.target, false);
            return;
          }
          setInState(entry.target, true);
          if (!entry.target.classList.contains("io-repeat")) revealIO.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });
    }
    targets.forEach(function (el) {
      if (el.dataset.ioRevealBound) return;
      el.dataset.ioRevealBound = "1";
      revealIO.observe(el);
      reg(el, function () { if (revealIO) revealIO.unobserve(el); el.dataset.ioRevealBound = ""; });
    });
  }

  /* ---------- Scroll-linked motion (io-scrub) ---------- */
  var SCRUB = [], scrubReady = false, scrubTicking = false;
  function scrubAmount(el) {
    var c = el.classList, d = parseFloat(el.dataset.ioScrub) || 60;
    if (c.contains("io-dist-sm")) d = 20;
    else if (c.contains("io-dist-lg")) d = 120;
    else if (c.contains("io-dist-xl")) d = 200;
    // felugró szövegnél kisebb az alap-elmozdulás (betűnként finomabb)
    var isText = c.contains("io-scrub-words") || c.contains("io-scrub-chars");
    if (isText && !el.dataset.ioScrub && !c.contains("io-dist-sm") && !c.contains("io-dist-lg") && !c.contains("io-dist-xl")) d = 28;
    var f = { tx: 0, ty: 0, rot: 0, scale: 1, blur: 0, opacity: 1 };
    var hasDir = c.contains("io-slide-up") || c.contains("io-slide-down") ||
                 c.contains("io-slide-left") || c.contains("io-slide-right") ||
                 c.contains("io-move-up") || c.contains("io-move-down") ||
                 c.contains("io-move-left") || c.contains("io-move-right") ||
                 c.contains("io-zoom-in") || c.contains("io-zoom-out");
    if (c.contains("io-fade")) f.opacity = 0;
    if (c.contains("io-slide-up") || c.contains("io-move-up")) f.ty = d;
    if (c.contains("io-slide-down") || c.contains("io-move-down")) f.ty = -d;
    if (c.contains("io-slide-left") || c.contains("io-move-left")) f.tx = d;
    if (c.contains("io-slide-right") || c.contains("io-move-right")) f.tx = -d;
    if (c.contains("io-zoom-in")) f.scale = 0.8;
    if (c.contains("io-zoom-out")) f.scale = 1.2;
    if (c.contains("io-blur")) f.blur = 14;
    if (c.contains("io-rotate-in")) f.rot = -8;
    // felugró szöveg alapértelmezett iránya, ha nincs megadva: alulról fel + fade
    if (isText && !hasDir) { f.ty = d; f.opacity = 0; }
    return f;
  }
  function scrubProgress(el, vh) {
    var r = el.getBoundingClientRect();
    var center = r.top + r.height / 2;
    var p = 1 - (center - vh * 0.5) / (vh * 0.5);
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }
  function applyScrub(el, f, p) {
    var q = 1 - p;
    el.style.transform =
      "translate3d(" + (f.tx * q) + "px," + (f.ty * q) + "px,0) rotate(" +
      (f.rot * q) + "deg) scale(" + (1 + (f.scale - 1) * q) + ")";
    el.style.opacity = (f.opacity + (1 - f.opacity) * p).toFixed(3);
    el.style.filter = f.blur ? "blur(" + (f.blur * q).toFixed(2) + "px)" : "";
    el.style.setProperty("--io-p", p.toFixed(3));
  }
  function scrubUpdate() {
    scrubTicking = false;
    var vh = (hasWin && window.innerHeight) || document.documentElement.clientHeight;
    for (var i = 0; i < SCRUB.length; i++) {
      var el = SCRUB[i], f = el.__ioFrom;
      if (!f || !el.isConnected) continue;
      var base = scrubProgress(el, vh);

      // per-span (szavanként/betűnként): minden span a saját haladásával ugrik fel
      if (el.__ioScrubKids) {
        el.style.setProperty("--io-p", base.toFixed(3)); // aláhúzáshoz a konténer-progress
        var kids = el.__ioScrubKids, n = kids.length;
        for (var k = 0; k < n; k++) {
          // a span-saját progress: a konténer-haladásból időeltolással (stagger)
          var spread = 0.55;                       // mekkora szakaszon fusson végig a stagger
          var startK = (k / Math.max(1, n)) * spread;
          var pk = (base - startK) / (1 - spread);
          if (pk < 0) pk = 0; else if (pk > 1) pk = 1;
          applyScrub(kids[k], f, pk);
        }
        continue;
      }
      applyScrub(el, f, base);
    }
  }
  function onScrubScroll() { if (!scrubTicking) { scrubTicking = true; requestAnimationFrame(scrubUpdate); } }
  // io-scrub-words / io-scrub-chars → spanekre bontás (görgetésre felugró szöveg)
  function splitScrubText(el) {
    if (el.dataset.ioSplit) return;
    el.dataset.ioSplit = "1";
    var byChar = el.classList.contains("io-scrub-chars");
    var cls = byChar ? "io-sc" : "io-sw";
    var parts = byChar ? Array.from(el.textContent) : el.textContent.split(/(\s+)/);
    el.textContent = "";
    var kids = [];
    parts.forEach(function (t) {
      if (/^\s+$/.test(t)) { el.appendChild(document.createTextNode(t)); return; }
      var span = document.createElement("span");
      span.className = cls;
      span.textContent = t;
      el.appendChild(span);
      kids.push(span);
    });
    el.__ioScrubKids = kids;
  }

  function initScrub(scope) {
    var els = (scope || document).querySelectorAll(".io-scrub"), added = 0;
    els.forEach(function (el) {
      if (el.dataset.ioScrubBound) return;
      el.dataset.ioScrubBound = "1";
      if (el.classList.contains("io-scrub-words") || el.classList.contains("io-scrub-chars")) {
        splitScrubText(el);
      }
      el.__ioFrom = scrubAmount(el);
      SCRUB.push(el);
      added++;
      reg(el, function () {
        var idx = SCRUB.indexOf(el); if (idx > -1) SCRUB.splice(idx, 1);
        el.dataset.ioScrubBound = ""; el.style.transform = ""; el.style.filter = ""; el.style.opacity = "";
      });
    });
    if (prefersReduced) {
      SCRUB.forEach(function (el) {
        el.style.transform = "none"; el.style.opacity = "1"; el.style.filter = "none"; el.style.setProperty("--io-p", "1");
        if (el.__ioScrubKids) el.__ioScrubKids.forEach(function (k) { k.style.transform = "none"; k.style.opacity = "1"; k.style.filter = "none"; });
      });
      return;
    }
    if (!scrubReady && hasWin) {
      scrubReady = true;
      window.addEventListener("scroll", onScrubScroll, { passive: true });
      window.addEventListener("resize", onScrubScroll);
    }
    if (added) scrubUpdate();
  }

  /* ---------- io-click / io-replay helper: belépő újrajátszása ----------
     Web Animations API-val determinisztikus (nem a CSS @property/transition
     finomságoktól függ). Kiolvassa a from-állapotot a class-listából. */
  function ioReplayWAAPI(el) {
    if (prefersReduced) { el.classList.add("io-in"); return; }
    var c = el.classList, d = 24;
    if (c.contains("io-dist-lg")) d = 48; else if (c.contains("io-dist-xl")) d = 96; else if (c.contains("io-dist-sm")) d = 8;
    var tx = 0, ty = 0, sc = 1, rot = 0, blur = 0, op = 1;
    if (c.contains("io-fade")) op = 0;
    if (c.contains("io-slide-up") || c.contains("io-move-up")) ty = d;
    if (c.contains("io-slide-down") || c.contains("io-move-down")) ty = -d;
    if (c.contains("io-slide-left") || c.contains("io-move-left")) tx = d;
    if (c.contains("io-slide-right") || c.contains("io-move-right")) tx = -d;
    if (c.contains("io-zoom-in")) sc = 0.85;
    if (c.contains("io-zoom-out")) sc = 1.15;
    if (c.contains("io-rotate-in")) rot = -6;
    if (c.contains("io-blur")) blur = 12;
    var m = el.className.match(/io-(\d{3,4})\b/);
    var dur = m ? parseInt(m[1], 10)
      : c.contains("io-fast") ? 300 : c.contains("io-slow") ? 1000 : c.contains("io-slower") ? 1600 : 600;
    el.classList.add("io-in");
    if (!el.animate) return; // nagyon régi böngésző: marad a végállapotban
    el.animate(
      [{ transform: "translate(" + tx + "px," + ty + "px) scale(" + sc + ") rotate(" + rot + "deg)", opacity: op, filter: "blur(" + blur + "px)" },
       { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1, filter: "blur(0px)" }],
      { duration: dur, easing: "cubic-bezier(0.22,0.61,0.36,1)", fill: "both" }
    );
  }

  /* ---------- Click trigger (io-click) ---------- */
  function initClick(scope) {
    (scope || document).querySelectorAll(".io-click").forEach(function (el) {
      if (el.dataset.ioClickBound) return;
      el.dataset.ioClickBound = "1";
      el.style.cursor = "pointer";
      el.classList.add("io-in"); // alapból látható; kattintásra újrajátszik
      var handler = function () { ioReplayWAAPI(el); };
      el.addEventListener("click", handler);
      reg(el, function () { el.removeEventListener("click", handler); el.dataset.ioClickBound = ""; });
    });
  }

  /* ---------- Magnetic / Tilt ---------- */
  function initPointer(scope) {
    if (prefersReduced) return;
    var root = scope || document;
    root.querySelectorAll(".io-magnetic").forEach(function (el) {
      if (el.dataset.ioMagBound) return; el.dataset.ioMagBound = "1";
      var strength = parseFloat(el.dataset.ioStrength || "0.3");
      var move = function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--io-mx", (e.clientX - (r.left + r.width / 2)) * strength + "px");
        el.style.setProperty("--io-my", (e.clientY - (r.top + r.height / 2)) * strength + "px");
      };
      var leave = function () { el.style.setProperty("--io-mx", "0px"); el.style.setProperty("--io-my", "0px"); };
      el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
      reg(el, function () { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); el.dataset.ioMagBound = ""; });
    });
    root.querySelectorAll(".io-tilt").forEach(function (el) {
      if (el.dataset.ioTiltBound) return; el.dataset.ioTiltBound = "1";
      var max = parseFloat(el.dataset.ioMax || "10");
      var move = function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--io-ry", px * max * 2 + "deg");
        el.style.setProperty("--io-rx", -py * max * 2 + "deg");
      };
      var leave = function () { el.style.setProperty("--io-rx", "0deg"); el.style.setProperty("--io-ry", "0deg"); };
      el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
      reg(el, function () { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); el.dataset.ioTiltBound = ""; });
    });
  }

  /* ---------- Confetti ---------- */
  function initConfetti(scope) {
    (scope || document).querySelectorAll(".io-confetti").forEach(function (el) {
      if (el.querySelector(".io-confetti__spots")) return;
      var count = parseInt(el.dataset.ioConfetti || "24", 10);
      var wrapper = document.createElement("span");
      wrapper.className = "io-confetti__spots";
      wrapper.setAttribute("aria-hidden", "true");
      for (var i = 0; i < count; i++) {
        var spot = document.createElement("span");
        spot.className = "io-confetti__spot";
        wrapper.appendChild(spot);
      }
      el.prepend(wrapper);
    });
  }

  /* ---------- Fő API ---------- */
  function init(scope) {
    splitText(scope);
    initStagger(scope);
    initConfetti(scope);
    initPointer(scope);
    initClick(scope);
    initScrub(scope);
    initReveal(scope);
  }
  function destroy(scope) {
    var root = scope || document;
    var list = [].slice.call(root.querySelectorAll("*"));
    if (root.nodeType === 1) list.unshift(root);
    list.forEach(clean);
  }
  function refresh() { scrubUpdate(); }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", function () { init(); });
    else init();
  }

  return {
    init: init, destroy: destroy, refresh: refresh,
    reveal: initReveal, scroll: initReveal, scrub: initScrub,
    stagger: initStagger, splitText: splitText, pointer: initPointer,
    click: initClick, confetti: initConfetti
  };
});
