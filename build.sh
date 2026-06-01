#!/bin/sh
# IO Motion — build (Node nélkül, sima shell).
# Ugyanazt állítja elő, mint a build.mjs.
set -e
cd "$(dirname "$0")"
mkdir -p dist

ORDER="src/01-tokens.css src/02-engine.css src/04-reveal.css src/05-attention.css src/06-text.css src/07-hover.css src/08-path.css src/09-effects.css src/20-legacy.css src/03-modifiers.css"

{
  printf '/*!\n * IO Motion v2.0.0 — utility-first CSS motion library\n * https://github.com/iotemplates/io-motion  ·  MIT License\n * Build: concatenated from src/ (do not edit dist directly)\n */\n\n'
  cat $ORDER
} > dist/io.css

cp dist/io.css io.css

sed -E 's#/\*[^*]*\*+([^/*][^*]*\*+)*/##g' dist/io.css \
  | tr '\n' ' ' \
  | sed -E 's/[[:space:]]+/ /g; s/ *([{}:;,>]) */\1/g; s/;}/}/g' \
  > dist/io.min.css

echo "✓ dist/io.css, dist/io.min.css, io.css kész."
