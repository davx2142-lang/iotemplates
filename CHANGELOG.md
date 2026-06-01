# Changelog

All notable changes to **IO Motion** are documented here.
This project follows [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

Every published version stays available forever via npm and CDN, e.g.
`https://cdn.jsdelivr.net/npm/io-motion@2.2.0/dist/io.min.css`.

## [2.2.0] — 2026-06-01

### Added
- **Scroll-linked text**: `io-scrub-words`, `io-scrub-chars` (word/char pop-in tied to scroll, combinable with `io-slide-*` / `io-fade` for direction) and `io-scrub-underline`.
- **`io-underline`** — animated underline draw (one-shot / hover).
- React adapter shipped as ESM (`react/index.mjs`) with `useIOMotion`, `<Reveal>`, `<SplitText>` and TypeScript types.
- `io-catalog.json` — machine-readable catalog of every class (powers the docs site and AI generation).

### Changed
- Replaced fragile rAF-based replay with deterministic **Web Animations API** playback across the demo & docs.
- Slimmer npm package: build sources (`src/`) excluded from the published tarball; improved CSS minifier.
- Versions unified to 2.2.0 across build banner, runtime and `package.json`.

### Fixed
- Gradient/shimmer text no longer flickers; shimmer keeps the text visible.
- `io-click` and kinetic-text effects now replay reliably.
- ESM/CJS resolution (removed `type: module`; `require()` and `<script>` both work).

[2.2.0]: https://github.com/davx2142-lang/iotemplates/releases/tag/v2.2.0
