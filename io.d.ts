/** IO Motion runtime API (io.js). */
export interface IOMotionAPI {
  /** Initialize all triggers within an optional scope (default: document). */
  init(scope?: Element | Document): void;
  /** Tear down observers/listeners within a scope (for SPA/React unmount). */
  destroy(scope?: Element | Document): void;
  /** Recompute scroll-linked (io-scrub) values, e.g. after layout changes. */
  refresh(): void;
  reveal(scope?: Element | Document): void;
  scroll(scope?: Element | Document): void;
  scrub(scope?: Element | Document): void;
  stagger(scope?: Element | Document): void;
  splitText(scope?: Element | Document): void;
  pointer(scope?: Element | Document): void;
  click(scope?: Element | Document): void;
  confetti(scope?: Element | Document): void;
}
declare const IOMotion: IOMotionAPI;
export default IOMotion;
