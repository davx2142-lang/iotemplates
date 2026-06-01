# IO Motion

**Utility-first, combinable CSS motion library.** Trigger and combine modern web
animations with `io-` classes — the Tailwind way, but for *motion*.

🌐 **Website, live demo, playground & full docs → [www.iotemplates.com](https://www.iotemplates.com)**

```html
<!-- fade + slide-in from the left + zoom, revealed on scroll -->
<div class="io io-reveal io-fade io-slide-right io-zoom-in io-700 io-ease-spring">
  Hello, motion.
</div>
```

- 🧩 **Composable** — stack effects (`io-fade io-slide-up io-blur`) instead of picking one baked animation.
- 🎚️ **Tunable** — duration, delay, easing, distance as separate classes (`io-700 io-delay-200 io-ease-spring io-dist-lg`).
- 👁️ **Scroll reveal** — `io-reveal` elements animate in when they enter the viewport (IntersectionObserver, ~3 KB JS).
- ✍️ **Text in motion** — per-word / per-character staggered reveals, animated gradient & shimmer text.
- 🖱️ **Interactions** — hover lift/glow/tilt, magnetic buttons, sweeps.
- ♿ **Respectful** — honors `prefers-reduced-motion` out of the box.
- 📦 **Drop-in** — one CSS file (+ optional JS). No build step required. CDN, npm, or a plain `<link>`.

---

## Why / 2026 motion trends behind it

This library is shaped by where web motion is heading in 2026 — distilled from current
design-trend research:

- **Restraint over spectacle.** Short distances (16–48px), 400–800ms, soft easing. Motion guides attention, it doesn't perform. → `io-dist-sm`, `io-ease-smooth`.
- **Spring / physical easing.** "Real-feeling" overshoot instead of linear ramps. → `io-ease-spring`.
- **Scroll-driven reveals & staggering.** Content arrives in choreographed sequence. → `io-reveal`, `io-stagger`.
- **Kinetic typography.** Headlines assemble word-by-word or character-by-character. → `io-words`, `io-chars`.
- **Blur / frosted transitions.** Elements sharpen into place. → `io-blur`.
- **Clip / mask reveals.** Lines and blocks "wipe" into view. → `io-mask-up`.
- **Tactile micro-interactions.** Magnetic buttons, tilt, light sweeps on hover. → `io-magnetic`, `io-tilt`, `io-hover-sweep`.
- **Accessibility-first.** Reduced-motion is a baseline expectation, not an afterthought.

---

## Install

### CDN (fastest)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/io-motion/dist/io.min.css">
<script src="https://cdn.jsdelivr.net/npm/io-motion/io.js" defer></script>
```

### npm

```bash
npm install io-motion
```

```js
import "io-motion";          // dist/io.css
import "io-motion/js";       // optional runtime (scroll reveal, stagger, text split)
```

### Plain file / XAMPP

Copy `dist/io.css` (or `io.css`) and `io.js` next to your HTML:

```html
<link rel="stylesheet" href="io.css">
<script src="io.js" defer></script>
```

---

## The model

Every entrance is **base + state(s) + modifiers + trigger**:

| Part | Classes | Example |
|------|---------|---------|
| **Base** | `io` | enables the reveal engine on the element |
| **State** (combinable) | `io-fade` `io-slide-up/down/left/right` `io-zoom-in/out` `io-blur` `io-rotate-in` `io-flip-up/down/left/right` `io-mask-up/down/left/right` | what it animates *from* |
| **Modifiers** | `io-100…io-2000` · `io-delay-*` · `io-ease-*` · `io-dist-sm/md/lg/xl` · `io-origin-*` | timing & strength |
| **Trigger** | `io-reveal` / `io-scroll` (on scroll) · `io-hover` (on hover) · `io-now` (on load) | when it plays |

### Triggers (combinable with any entrance)

| Trigger | Plays when | Needs JS |
|---------|-----------|----------|
| `io-now` | immediately on load | yes (io.js) |
| `io-reveal` / `io-scroll` | element enters the viewport | yes (io.js) |
| `io-hover` | element (or its direct parent) is hovered | no — pure CSS |
| `io-click` | element is clicked | yes (io.js) |
| `io-scrub` | **scroll-linked** — progresses continuously as the element moves toward the viewport centre | yes (io.js) |

**Scroll-linked (`io-scrub`)** differs from the one-shot `io-scroll`: the effect is tied to scroll *position*, so it advances and reverses as you scroll. Combine with any direction/effect; tune travel with `io-dist-*` or `data-io-scrub="120"`.

```html
<div class="io-scrub io-fade io-slide-left">slides in as you scroll</div>
<div class="io-scrub io-scrub-color" style="--io-scrub-from:#475569; --io-scrub-to:#38bdf8">colour shifts with scroll</div>
```

```html
<div class="io io-fade io-slide-up io-scroll io-slow">scroll in, slowly</div>
<div class="io io-fade io-zoom-in io-hover io-fast">hover to play, fast</div>
<div class="io io-fade io-slide-right io-blur io-now io-ease-spring">on load, springy</div>
```

### Speed

Numeric: `io-100 … io-2000`. Semantic aliases: `io-instant` (150ms) · `io-fast` (300ms) ·
`io-normal` (600ms) · `io-slow` (1000ms) · `io-slower` (1600ms).
Continuous text effects have their own speed (independent of entrance duration):
`io-text-slow` / `io-text-normal` / `io-text-fast`.

### Gradient text colors

Pick a palette class, or set your own 2–3 colors with CSS variables:

```html
<span class="io-gradient-text io-grad-sunset">Sunset</span>
<span class="io-gradient-text" style="--io-grad-1:#22d3ee; --io-grad-2:#a855f7; --io-grad-3:#f43f5e">Custom</span>
```

Palettes: `io-grad-aurora` · `io-grad-sunset` · `io-grad-ocean` · `io-grad-mint` · `io-grad-fire` · `io-grad-candy` · `io-grad-gold`.

Because states only set the *starting* offset and `io-in` resets every channel at once,
**any combination just works**:

```html
<div class="io io-reveal io-fade io-slide-up">fade up</div>
<div class="io io-reveal io-fade io-slide-right io-blur io-800">fade, slide right, sharpen</div>
<div class="io io-reveal io-zoom-in io-rotate-in io-ease-spring">zoom + tilt with spring</div>
```

### Stagger

```html
<ul class="io-stagger" data-io-stagger="90">
  <li class="io io-reveal io-fade io-slide-up">One</li>
  <li class="io io-reveal io-fade io-slide-up">Two</li>
  <li class="io io-reveal io-fade io-slide-up">Three</li>
</ul>
```

### Kinetic text

```html
<h1 class="io-words" data-io-effect="io-fade io-slide-up" data-io-stagger="60">
  Designed to move
</h1>
<h2 class="io-chars" data-io-effect="io-fade io-blur">Character by character</h2>

<span class="io-gradient-text">animated gradient</span>
<span class="io-shimmer-text">shimmer sweep</span>
```

### Attention loops (work standalone)

`io-pulse` `io-heartbeat` `io-float` `io-spin` `io-ping` `io-flash` `io-bounce` `io-shake`
`io-wobble` `io-jello` `io-vibrate` `io-swing` `io-rubber` `io-tada`

```html
<span class="io-pulse">●</span>
<button class="io-motion io-shake io-hover">Hover me</button>  <!-- play on hover -->
```

### Hover & interaction

`io-hover-lift` `io-hover-grow` `io-hover-shrink` `io-hover-rotate` `io-hover-tilt`
`io-hover-glow` `io-hover-float` `io-hover-pop` `io-hover-press` `io-hover-underline`
`io-hover-sweep` `io-hover-border` · `io-magnetic` · `io-tilt`

```html
<button class="io-hover-pop io-hover-sweep">Buy now</button>
<a class="io-magnetic" data-io-strength="0.4">Magnetic link</a>
```

### Effects

`io-confetti` (burst on hover) · `io-kenburns` · `io-bg-pan` · `io-color-cycle`
· `io-marquee` · `io-skeleton` · motion paths (`io-path io-path-move io-path-arc …`).

---

## JavaScript API

The runtime auto-initializes on `DOMContentLoaded`. For dynamically added content:

```js
IOMotion.init(container);        // run everything within a scope
IOMotion.reveal(container);      // (re)bind scroll reveal
IOMotion.stagger(container);
IOMotion.splitText(container);
IOMotion.pointer(container);     // magnetic / tilt
IOMotion.confetti(container);
```

Pure-CSS effects (hover, loops, gradient text, paths) need **no JS** at all.

---

## Accessibility

When the user has `prefers-reduced-motion: reduce`, all animations and transitions are
disabled and content is shown in its final state immediately — no flashing, no movement.

---

## Build from source

The source of truth lives in [`src/`](src/). Regenerate the bundles with:

```bash
npm run build        # Node
# or
sh build.sh          # no Node required
```

This produces `dist/io.css`, `dist/io.min.css`, and a root `io.css` copy.

---

## Releases & CDN

Every published version is permanent and pinnable on the CDN:

```html
<!-- pin a version (recommended for production) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/io-motion@2.2.0/dist/io.min.css">
<!-- or always-latest -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/io-motion/dist/io.min.css">
```

Maintainers — to cut a release (bumps version, tags, pushes):

```bash
npm run release:patch   # 2.2.0 → 2.2.1   (or release:minor / release:major)
npm publish             # publishes to npm; jsDelivr/unpkg pick it up automatically
```

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

[MIT](LICENSE) © iotemplates · [www.iotemplates.com](https://www.iotemplates.com)
