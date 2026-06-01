/* ============================================================
   IO Motion — React adapter (ESM)
   import { useIOMotion, Reveal, SplitText } from "iotemplates/react";
   import "iotemplates/css";   // a stílusok külön importtal jönnek

   React-biztos: a hook mountkor inicializál, unmountkor takarít,
   a SplitText React-ben bontja a szöveget (nem nyúl a DOM-hoz kézzel).
   ============================================================ */
import { useEffect, useRef, createElement } from "react";
import IOMotion from "../io.js";

export { IOMotion };

/* A megadott hatókörben (ref) inicializálja az IO Motion triggereket,
   és unmountkor / újrarendereléskor rendesen leállítja őket.
   FONTOS: az io.js init(scope) a scope LESZÁRMAZOTTAIT figyeli — ezért a ref
   egy wrapperre kerül, a motion-elem pedig BELÜL van (lásd Reveal). */
export function useIOMotion(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !IOMotion) return;
    IOMotion.init(el);
    return () => { IOMotion.destroy && IOMotion.destroy(el); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/* Kombinálható belépő. A külső wrapper (display:contents → nincs layout-hatása)
   hordozza a ref-et; a tényleges motion-elem belül van, így az init() megtalálja. */
export function Reveal({
  as = "div",
  effect = "io-fade io-slide-up",
  trigger = "io-scroll",
  speed = "",
  ease = "",
  className = "",
  children,
  ...rest
}) {
  const ref = useIOMotion([effect, trigger, speed, ease]);
  const cls = ["io", effect, trigger, speed, ease, className].filter(Boolean).join(" ");
  return createElement(
    "span",
    { ref, style: { display: "contents" } },
    createElement(as, { className: cls, ...rest }, children)
  );
}

/* Kinetikus szöveg React-módra: a szavakat/betűket React rendereli,
   így nincs DOM-ütközés. mode: "words" | "chars". */
export function SplitText({
  as = "span",
  mode = "words",
  effect = "io-fade io-slide-up",
  stagger = 60,
  trigger = "io-scroll",
  className = "",
  children,
  ...rest
}) {
  const ref = useIOMotion([mode, effect, stagger, trigger, String(children)]);
  const text = typeof children === "string" ? children : "";
  const parts =
    mode === "chars" ? Array.from(text) : text.split(/(\s+)/);
  let i = 0;
  const nodes = parts.map((p, idx) => {
    if (/^\s+$/.test(p)) return p;
    const node = createElement(
      "span",
      {
        key: idx,
        className: (mode === "chars" ? "io-c io " : "io-w io ") + effect,
        style: { "--io-delay": i * stagger + "ms", display: "inline-block", whiteSpace: "pre" },
      },
      p
    );
    i++;
    return node;
  });
  const cls = [trigger === "io-hover" ? "" : "io-reveal", className].filter(Boolean).join(" ");
  // wrapper hordozza a ref-et, a szöveg-elem belül → init() látja a spaneket
  return createElement(
    "span",
    { ref, style: { display: "contents" } },
    createElement(as, { className: cls, ...rest }, nodes)
  );
}

export default { useIOMotion, Reveal, SplitText, IOMotion };
