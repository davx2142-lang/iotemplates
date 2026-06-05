/* ============================================================
   IO Motion — build script (zéró függőség, Node 16+)
   A src/ modulokat helyes kaszkád-sorrendben fűzi össze:
     dist/io.css       – olvasható, kommentezett build
     dist/io.min.css   – egyszerű minifikált build
     io.css            – root másolat (XAMPP / közvetlen <link> kompatibilitás)
   Futtatás:  node build.mjs
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// FONTOS: a 03-modifiers a végére kerül, hogy a duration/ease módosítók
// felülírják a komponensek alap-időzítését a kaszkádban.
const ORDER = [
  "01-tokens.css",
  "02-engine.css",
  "04-reveal.css",
  "05-attention.css",
  "06-text.css",
  "07-hover.css",
  "08-path.css",
  "09-effects.css",
  "20-legacy.css",
  "03-modifiers.css",
];

const banner =
  "/*!\n" +
  " * IO Motion v2.3.0 — utility-first CSS motion library\n" +
  " * https://github.com/davx2142-lang/iotemplates  ·  MIT License\n" +
  " * Build: concatenated from src/ (do not edit dist directly)\n" +
  " */\n\n";

const bundle =
  banner +
  ORDER.map((f) => readFileSync(join(__dirname, "src", f), "utf8")).join("\n");

function minify(css) {
  // a /*! banner megmarad, minden más komment törlődik
  var banner = css.match(/^\/\*![\s\S]*?\*\//);
  var body = banner ? css.slice(banner[0].length) : css;
  body = body
    .replace(/\/\*[\s\S]*?\*\//g, "")          // összes komment
    .replace(/\s+/g, " ")                       // whitespace össze
    .replace(/\s*([{}:;,>])\s*/g, "$1")        // szóköz a tokenek körül
    .replace(/;}/g, "}")                        // felesleges utolsó ;
    .replace(/:0px\b/g, ":0")                   // 0px → 0 (érték-pozícióban)
    .replace(/\b0\.([0-9])/g, ".$1")            // 0.5 → .5
    .trim();
  return (banner ? banner[0] + "\n" : "") + body;
}

mkdirSync(join(__dirname, "dist"), { recursive: true });
writeFileSync(join(__dirname, "dist", "io.css"), bundle);
writeFileSync(join(__dirname, "dist", "io.min.css"), minify(bundle));
writeFileSync(join(__dirname, "io.css"), bundle);

console.log("✓ dist/io.css, dist/io.min.css, io.css megírva (" + ORDER.length + " modul).");
