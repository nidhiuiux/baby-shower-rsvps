"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function getScrollParent(el: HTMLElement): HTMLElement | Window {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const style = window.getComputedStyle(node);
    const oy = style.overflowY;
    const canScroll =
      (oy === "auto" || oy === "scroll" || oy === "overlay") &&
      node.scrollHeight > node.clientHeight + 1;
    if (canScroll) {
      if (node === document.documentElement || node === document.body) {
        return window;
      }
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

function isElementScrollRoot(
  root: HTMLElement | Window,
): root is HTMLElement {
  return typeof HTMLElement !== "undefined" && root instanceof HTMLElement;
}

function readScrollProgress(
  track: HTMLElement,
  scrollRoot: HTMLElement | Window,
): number {
  const useWindowScroll =
    !(scrollRoot instanceof HTMLElement) ||
    (typeof document !== "undefined" &&
      (scrollRoot === document.documentElement || scrollRoot === document.body));

  if (useWindowScroll) {
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const scrollable = track.offsetHeight - vh;
    if (scrollable <= 0) return 1;
    return clamp01(-rect.top / scrollable);
  }

  const rootRect = scrollRoot.getBoundingClientRect();
  const trackRect = track.getBoundingClientRect();
  const scrollable = track.offsetHeight - scrollRoot.clientHeight;
  if (scrollable <= 0) return 1;
  return clamp01((rootRect.top - trackRect.top) / scrollable);
}

// Uses the site's own fonts (Nunito for text, Fraunces for the heading)
const FONT_UI = 'var(--font-nunito), "Helvetica Neue", Arial, sans-serif';
const FONT_HEADING = 'var(--font-fraunces), ui-serif, Georgia, serif';

const COLOR_FIELD = "transparent";
const COLOR_INK = "#2f3d34";
const COLOR_HEADING = "#b76e6a";

export type MusicVideoPinStackItem = {
  id: string;
  title: string;
  label: string;
  released: string;
  imageSrc?: string;
  imageAlt?: string;
  youtubeUrl?: string;
  href?: string;
  /** Card background shown behind transparent artwork */
  tint?: string;
  /** "contain" keeps whole artwork visible (default for local artwork) */
  fit?: "cover" | "contain";
  /** Small pill in the middle of the card */
  badge?: string;
};

function youtubeVideoId(input?: string): string | null {
  const raw = input?.trim();
  if (!raw) return null;
  if (/^[\w-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
    }
  } catch {
    /* not a URL */
  }
  return null;
}

function youtubeThumbSrc(id: string, quality: "max" | "hq" = "max") {
  return quality === "max"
    ? `https://i.ytimg.com/vi/${id}/hq720.jpg`
    : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function resolveItemMedia(item: MusicVideoPinStackItem) {
  const id = youtubeVideoId(item.youtubeUrl ?? item.href);
  const href = item.href ?? item.youtubeUrl;
  const imageSrc = item.imageSrc ?? (id ? youtubeThumbSrc(id) : undefined);
  return { id, href, imageSrc };
}

export type MusicVideoPinStackProps = {
  heading?: string;
  items?: MusicVideoPinStackItem[];
  fieldColor?: string;
  inkColor?: string;
  headingColor?: string;
  forceProgress?: number;
  className?: string;
};

export function MusicVideoPinStack({
  heading = "MUSIC VIDEO",
  items = [],
  fieldColor = COLOR_FIELD,
  inkColor = COLOR_INK,
  headingColor = COLOR_HEADING,
  forceProgress,
  className,
}: MusicVideoPinStackProps) {
  const rootRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const metaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pinned = forceProgress != null;
  const count = items.length;

  useEffect(() => {
    const root = rootRef.current;
    const runway = runwayRef.current;
    const stage = stageRef.current;
    const list = listRef.current;
    if (!root || !stage || !list || count === 0) return;

    const cards = Array.from(
      list.querySelectorAll<HTMLElement>("[data-mv-item]"),
    );
    const overlays = cards.map((card) =>
      card.querySelector<HTMLElement>("[data-mv-overlay]"),
    );
    if (cards.length !== count) return;

    let activeIndex = -1;

    const setActive = (index: number) => {
      if (index === activeIndex) return;
      activeIndex = index;

      titleRefs.current.forEach((el, i) => {
        if (!el) return;
        const on = i === index;
        el.toggleAttribute("data-active", on);
        el.style.opacity = on ? "1" : "0";
      });
      metaRefs.current.forEach((el, i) => {
        if (!el) return;
        const on = i === index;
        el.toggleAttribute("data-active", on);
        el.style.opacity = on ? "1" : "0";
      });
    };

    const cardLocal = (p: number, i: number) => {
      if (i === 0 || count <= 1) return 1;
      const incoming = count - 1;
      const start = (i - 1) / incoming;
      const end = i / incoming;
      return clamp01((p - start) / Math.max(0.0001, end - start));
    };

    const applyProgress = (raw: number) => {
      const p = clamp01(raw);

      cards.forEach((card, i) => {
        const local = cardLocal(p, i);
        const y = (1 - local) * 100;
        const scale = 0.6 + local * 0.4;
        const inset = (1 - local) * 10;

        gsap.set(card, {
          y: `${y}vh`,
          scale,
          clipPath: `inset(${inset}% ${inset}% ${inset}% ${inset}% round 22px)`,
          zIndex: i + 1,
          force3D: true,
        });

        const overlay = overlays[i];
        if (overlay) {
          let overlayOpacity = 0;
          if (i < count - 1) {
            const nextLocal = cardLocal(p, i + 1);
            overlayOpacity = nextLocal * 0.75;
          }
          gsap.set(overlay, { opacity: overlayOpacity });
        }
      });

      let nextActive = 0;
      for (let i = 0; i < count; i++) {
        if (cardLocal(p, i) >= 0.55) nextActive = i;
      }
      setActive(nextActive);

      cards.forEach((card, i) => {
        const op = Number.parseFloat(overlays[i]?.style.opacity || "0");
        card.toggleAttribute("data-prev", op > 0.05);
      });
    };

    if (pinned) {
      applyProgress(forceProgress);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      // No pinned scroll: show the first card in a single screen
      if (runway) {
        runway.style.minHeight = "0";
        runway.style.height = "auto";
      }
      stage.style.position = "relative";
      applyProgress(0);
      return () => {
        if (runway) {
          runway.style.minHeight = "";
          runway.style.height = "";
        }
        stage.style.position = "";
      };
    }

    if (!runway) return;

    const scrollRoot = getScrollParent(runway);

    const viewportHeight = () => {
      if (isElementScrollRoot(scrollRoot)) {
        const h = scrollRoot.clientHeight;
        if (h > 0) return h;
      }
      return window.innerHeight;
    };

    const sizeLayout = () => {
      const vh = viewportHeight();
      stage.style.height = `${vh}px`;
      runway.style.minHeight = `${(count + 1) * vh}px`;
      runway.style.height = `${(count + 1) * vh}px`;
    };
    sizeLayout();

    let target = 0;
    let current = 0;
    let settled = false;

    const tick = () => {
      if (settled) return;
      current += (target - current) * 0.2;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        settled = true;
      }
      applyProgress(current);
    };
    gsap.ticker.add(tick);

    const syncFromScroll = () => {
      target = readScrollProgress(runway, scrollRoot);
      settled = false;
    };

    if (isElementScrollRoot(scrollRoot)) {
      scrollRoot.addEventListener("scroll", syncFromScroll, { passive: true });
    } else {
      window.addEventListener("scroll", syncFromScroll, { passive: true });
    }

    const stepProgress = (deltaY: number) => {
      const span = Math.max(window.innerHeight, 1) * Math.max(count, 1) * 0.7;
      target = clamp01(target + deltaY / span);
      settled = false;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      const goingDown = event.deltaY > 0;
      if ((target <= 0.001 && !goingDown) || (target >= 0.999 && goingDown)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const raw =
        event.deltaMode === 1
          ? event.deltaY * 16
          : event.deltaMode === 2
            ? event.deltaY * window.innerHeight
            : event.deltaY;
      stepProgress(raw);
    };

    let touchY: number | null = null;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (touchY == null) return;
      const y = event.touches[0]?.clientY;
      if (y == null) return;
      const deltaY = touchY - y;
      touchY = y;
      const goingDown = deltaY > 0;
      if ((target <= 0.001 && !goingDown) || (target >= 0.999 && goingDown)) {
        return;
      }
      event.preventDefault();
      stepProgress(deltaY);
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchmove", onTouchMove, { passive: false });

    applyProgress(0);
    syncFromScroll();

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeLayout();
        syncFromScroll();
      }, 160);
    };
    window.addEventListener("resize", onResize);
    const containerObserver = new ResizeObserver(onResize);
    if (isElementScrollRoot(scrollRoot)) containerObserver.observe(scrollRoot);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      if (isElementScrollRoot(scrollRoot)) {
        scrollRoot.removeEventListener("scroll", syncFromScroll);
      } else {
        window.removeEventListener("scroll", syncFromScroll);
      }
      containerObserver.disconnect();
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchmove", onTouchMove);
      gsap.ticker.remove(tick);
      gsap.set(cards, { clearProps: "all" });
      overlays.forEach((el) => el && gsap.set(el, { clearProps: "opacity" }));
      stage.style.height = "";
      runway.style.height = "";
      runway.style.minHeight = "";
    };
  }, [items, forceProgress, pinned, count]);

  const cssVars = {
    "--mvp-field": fieldColor,
    "--mvp-ink": inkColor,
    "--mvp-heading": headingColor,
    "--mvp-font": FONT_UI,
  } as CSSProperties;

  return (
    <section
      ref={rootRef}
      data-tsuna-id="music-video-pin-stack"
      aria-label={heading}
      className={cn("mvp relative w-full", pinned && "is-preview", className)}
      style={cssVars}
    >
      <style>{`
[data-tsuna-id="music-video-pin-stack"].mvp {
  --mvp-field: ${COLOR_FIELD};
  --mvp-ink: ${COLOR_INK};
  --mvp-heading: ${COLOR_HEADING};
  --mvp-font: ${FONT_UI};
  background: var(--mvp-field);
  color: var(--mvp-ink);
  font-family: var(--mvp-font);
  -webkit-font-smoothing: antialiased;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-stage {
  --mvp-thumb-w: min(58vw, calc(100vw - 30rem), 760px);
  width: 100%;
  overflow: hidden;
  overscroll-behavior: contain;
  container-type: size;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-stage::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.18;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
[data-tsuna-id="music-video-pin-stack"] .mvp-heading {
  position: absolute;
  z-index: 2;
  top: clamp(1.5rem, 5cqh, 3rem);
  left: 0;
  right: 0;
  text-align: center;
  margin: 0;
  font-family: ${FONT_HEADING};
  font-size: clamp(2.4rem, 7.5cqw, 6.5rem);
  font-weight: 400;
  letter-spacing: -0.025em;
  line-height: 0.92;
  color: var(--mvp-heading);
  opacity: 0.85;
  pointer-events: none;
  transition: color 0.35s ease;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-titles,
[data-tsuna-id="music-video-pin-stack"] .mvp-metas {
  position: absolute;
  z-index: 4;
  top: 0;
  bottom: 0;
  margin: auto;
  height: fit-content;
  color: var(--mvp-ink);
  transition: color 0.35s ease;
  pointer-events: none;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-titles {
  left: calc(50% - (var(--mvp-thumb-w) / 2) - 0.9rem);
  transform: translateX(-100%);
  width: max-content;
  max-width: 12rem;
  font-family: ${FONT_HEADING};
  font-size: clamp(1.05rem, 1.7cqw, 1.5rem);
  text-align: right;
  white-space: normal;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-metas {
  left: calc(50% + (var(--mvp-thumb-w) / 2) + 0.9rem);
  width: max-content;
  max-width: 12rem;
  font-size: clamp(0.78rem, 1.2cqw, 1rem);
  letter-spacing: 0.06em;
  text-align: left;
  white-space: normal;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-title-item,
[data-tsuna-id="music-video-pin-stack"] .mvp-meta-item {
  display: block;
  opacity: 0;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-title-item:not(:first-of-type),
[data-tsuna-id="music-video-pin-stack"] .mvp-meta-item:not(:first-of-type) {
  position: absolute;
  inset: 0;
  margin: auto;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-title-item[data-active],
[data-tsuna-id="music-video-pin-stack"] .mvp-meta-item[data-active] {
  animation: mvp-flicker 0.075s steps(1) 4 forwards;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-meta-label,
[data-tsuna-id="music-video-pin-stack"] .mvp-meta-release {
  display: block;
  text-align: inherit;
  margin: 0;
  line-height: 1.45;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-list {
  position: absolute;
  z-index: 3;
  inset: 0;
  margin: auto;
  width: var(--mvp-thumb-w);
  aspect-ratio: 16 / 9;
  height: auto;
  max-width: min(92vw, 760px);
  max-height: none;
  border-radius: 22px;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-item {
  position: absolute;
  inset: 0;
  margin: auto;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 22px;
  will-change: transform, clip-path;
  transform-origin: 50% 50%;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-item[data-prev] {
  pointer-events: none;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 22px;
  transition: transform 0.35s ease;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-item[data-fit="contain"] img {
  object-fit: contain;
  padding: 6% 0;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-play {
  position: absolute;
  z-index: 6;
  left: 50%;
  bottom: 7%;
  transform: translateX(-50%);
  padding: 0.42rem 0.95rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: var(--mvp-ink);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
}
[data-tsuna-id="music-video-pin-stack"] .mvp-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: var(--mvp-ink);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
[data-tsuna-id="music-video-pin-stack"]:not(.is-preview) a.mvp-item:hover img {
  transform: scale(1.06);
}
@keyframes mvp-flicker {
  0% { opacity: 0; }
  25% { opacity: 1; }
  50% { opacity: 0; }
  75% { opacity: 1; }
  100% { opacity: 1; }
}
@media (max-width: 1100px) {
  [data-tsuna-id="music-video-pin-stack"] .mvp-play {
    display: none;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-stage {
    --mvp-thumb-w: min(86vw, 640px);
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-heading {
    top: clamp(3.5rem, 10cqh, 5rem);
    left: 1rem;
    right: 1rem;
    text-align: center;
    font-size: clamp(2.2rem, 12vw, 3.5rem);
    letter-spacing: 0;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-titles,
  [data-tsuna-id="music-video-pin-stack"] .mvp-metas {
    left: 1rem;
    right: 1rem;
    transform: none;
    width: auto;
    max-width: none;
    text-align: center;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-titles {
    top: auto;
    bottom: calc(50% + (var(--mvp-thumb-w) * 9 / 32) + 1rem);
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-metas {
    top: calc(50% + (var(--mvp-thumb-w) * 9 / 32) + 0.85rem);
    bottom: auto;
    letter-spacing: 0.06em;
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-tsuna-id="music-video-pin-stack"] .mvp-title-item[data-active],
  [data-tsuna-id="music-video-pin-stack"] .mvp-meta-item[data-active] {
    animation: none;
    opacity: 1;
  }
  [data-tsuna-id="music-video-pin-stack"] .mvp-item img {
    transition: none;
  }
}
      `}</style>

      <div
        ref={runwayRef}
        className={cn("relative w-full", pinned && "contents")}
        style={
          pinned
            ? undefined
            : { minHeight: `calc(${Math.max(count, 1) + 1} * 100svh)` }
        }
      >
        <div
          ref={stageRef}
          className={cn(
            "mvp-stage w-full",
            pinned
              ? "relative aspect-[16/10] max-h-[100svh]"
              : "sticky top-0 h-[100svh]",
          )}
        >
          <h2 className="mvp-heading">{heading}</h2>

          <div className="mvp-titles" aria-live="polite">
            {items.map((item, i) => (
              <span
                key={`title-${item.id}`}
                ref={(el) => {
                  titleRefs.current[i] = el;
                }}
                className="mvp-title-item"
                data-index={i + 1}
                data-active={i === 0 ? true : undefined}
                style={i === 0 ? { opacity: 1 } : undefined}
              >
                {item.title}
              </span>
            ))}
          </div>

          <div className="mvp-metas" aria-hidden="true">
            {items.map((item, i) => (
              <div
                key={`meta-${item.id}`}
                ref={(el) => {
                  metaRefs.current[i] = el;
                }}
                className="mvp-meta-item"
                data-index={i + 1}
                data-active={i === 0 ? true : undefined}
                style={i === 0 ? { opacity: 1 } : undefined}
              >
                <p className="mvp-meta-label">{item.label}</p>
                <p className="mvp-meta-release">{item.released}</p>
              </div>
            ))}
          </div>

          <div ref={listRef} className="mvp-list">
            {items.map((item, i) => {
              const media = resolveItemMedia(item);
              const href = media.href;
              const Tag = href ? "a" : "div";
              const isExternal = Boolean(href?.startsWith("http"));
              return (
                <Tag
                  key={item.id}
                  {...(href
                    ? {
                        href,
                        target: isExternal ? "_blank" : undefined,
                        rel: isExternal ? "noopener noreferrer" : undefined,
                        "aria-label": `${item.title} (opens in a new tab)`,
                      }
                    : {})}
                  className="mvp-item"
                  style={item.tint ? { background: item.tint } : undefined}
                  data-mv-item
                  data-index={i + 1}
                  data-fit={item.fit ?? (item.imageSrc && !item.imageSrc.startsWith("http") ? "contain" : "cover")}
                >
                  {media.imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.imageSrc}
                      alt={item.imageAlt ?? ""}
                      loading={i === 0 ? "eager" : "lazy"}
                      onLoad={(event) => {
                        if (!media.id) return;
                        const img = event.currentTarget;
                        if (img.naturalWidth >= 320) return;
                        const fallback = youtubeThumbSrc(media.id, "hq");
                        if (img.src !== fallback) img.src = fallback;
                      }}
                      onError={(event) => {
                        if (!media.id) return;
                        const img = event.currentTarget;
                        const fallback = youtubeThumbSrc(media.id, "hq");
                        if (img.src !== fallback) img.src = fallback;
                      }}
                    />
                  ) : null}
                  {item.badge ? (
                    <span className="mvp-play" aria-hidden="true">
                      {item.badge}
                    </span>
                  ) : null}
                  <div className="mvp-overlay" data-mv-overlay />
                </Tag>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MusicVideoPinStack;
