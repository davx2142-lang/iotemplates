import type { ComponentType, ReactNode, Ref } from "react";
import type { IOMotionAPI } from "../io";

export const IOMotion: IOMotionAPI;

/** Initializes IO Motion triggers within the returned ref's subtree;
 *  tears them down on unmount / when `deps` change. */
export function useIOMotion<T extends HTMLElement = HTMLElement>(
  deps?: ReadonlyArray<unknown>
): Ref<T>;

export interface RevealProps {
  /** Element/tag to render. Default "div". */
  as?: keyof JSX.IntrinsicElements | ComponentType<any>;
  /** Combinable effect classes, e.g. "io-fade io-slide-up io-blur". */
  effect?: string;
  /** Trigger class: io-now | io-reveal | io-scroll | io-scrub | io-hover | io-click. */
  trigger?: string;
  /** Speed class, e.g. "io-700" or "io-fast". */
  speed?: string;
  /** Easing class, e.g. "io-ease-spring". */
  ease?: string;
  className?: string;
  children?: ReactNode;
  [prop: string]: unknown;
}
export const Reveal: ComponentType<RevealProps>;

export interface SplitTextProps {
  as?: keyof JSX.IntrinsicElements | ComponentType<any>;
  /** "words" or "chars". */
  mode?: "words" | "chars";
  effect?: string;
  /** Per-item delay in ms. */
  stagger?: number;
  trigger?: string;
  className?: string;
  children?: string;
  [prop: string]: unknown;
}
export const SplitText: ComponentType<SplitTextProps>;

declare const _default: {
  useIOMotion: typeof useIOMotion;
  Reveal: typeof Reveal;
  SplitText: typeof SplitText;
  IOMotion: IOMotionAPI;
};
export default _default;
