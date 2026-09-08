// src/components/menu/dock.tsx
"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import {
  SCROLLSPY_BOTTOM_THRESHOLD_PX,
  SCROLLSPY_FOCAL_LINE_PX,
  SCROLLSPY_TOP_THRESHOLD_PX,
} from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import {
  clientHeightOf,
  findSection,
  relativeTopOf,
  scrollHeightOf,
  scrollTopOf,
  type ScrollRoot,
} from "./scroll-root";

type CategoryTab = { id: string; name: string };
type Props = {
  categories: CategoryTab[];
  activeId: string;
  onActiveIdChange: (id: string) => void;
  /** Near-instant jump + settle choreography owned by the shell (docs/06 B-01). */
  onJump: (id: string) => void;
  /** Phone-frame preview scrolls a div, not the window (docs/07). */
  scrollRoot?: ScrollRoot;
};
type ButtonBox = { left: number; top: number; width: number; height: number };
const INDICATOR_SPRING: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 };

/**
 * Category tabs row of the unified sticky nav header (docs/05/06).
 * No longer fixed to the bottom on mobile — the header owns stickiness.
 */
export function Dock({
  categories,
  activeId,
  onActiveIdChange,
  onJump,
  scrollRoot,
}: Props) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const ignoreScrollRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [box, setBox] = useState<ButtonBox | null>(null);
  const [isReady, setIsReady] = useState(false);

  const measure = useCallback((id: string) => {
    const button = buttonRefs.current.get(id);
    if (!button) return;
    setBox({
      left: button.offsetLeft,
      top: button.offsetTop,
      width: button.offsetWidth,
      height: button.offsetHeight,
    });
    setIsReady(true);
  }, []);

  useLayoutEffect(() => {
    measure(activeId);
  }, [activeId, measure, categories]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const handleResize = () => measure(activeId);
    const observer = new ResizeObserver(handleResize);
    observer.observe(track);
    window.addEventListener("resize", handleResize);
    if (typeof document !== "undefined" && document.fonts) {
      void document.fonts.ready.then(() => measure(activeId));
    }
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [activeId, measure]);

  /* Scrollspy: nav sits on top, focal line below the header (docs/06 B-01). */
  useEffect(() => {
    const root: ScrollRoot | undefined =
      scrollRoot ?? (typeof window === "undefined" ? undefined : window);
    if (categories.length === 0 || !root) return;
    let rafId: number | null = null;
    const handleScroll = () => {
      if (ignoreScrollRef.current) return;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (scrollTopOf(root) < SCROLLSPY_TOP_THRESHOLD_PX) {
          const first = categories[0];
          if (first && first.id !== activeId) onActiveIdChange(first.id);
          return;
        }
        const atBottom =
          clientHeightOf(root) + scrollTopOf(root) >=
          scrollHeightOf(root) - SCROLLSPY_BOTTOM_THRESHOLD_PX;
        if (atBottom) {
          const last = categories[categories.length - 1];
          if (last && last.id !== activeId) onActiveIdChange(last.id);
          return;
        }
        let matchingId = categories[0]?.id;
        for (const category of categories) {
          const el = findSection(root, category.id);
          if (!el) continue;
          if (relativeTopOf(el, root) <= SCROLLSPY_FOCAL_LINE_PX) {
            matchingId = category.id;
          }
        }
        if (matchingId && matchingId !== activeId) onActiveIdChange(matchingId);
      });
    };
    root.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      root.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [categories, activeId, onActiveIdChange, scrollRoot]);

  useEffect(() => {
    const container = trackRef.current;
    const button = buttonRefs.current.get(activeId);
    if (!container || !button) return;
    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const delta =
      buttonRect.left + buttonRect.width / 2 - (containerRect.left + containerRect.width / 2);
    if (Math.abs(delta) > 3) {
      container.scrollBy({ left: delta, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }, [activeId, reduceMotion]);

  const jumpTo = (id: string) => {
    ignoreScrollRef.current = true;
    onActiveIdChange(id);
    onJump(id);
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      ignoreScrollRef.current = false;
    }, 750);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = categories.findIndex((category) => category.id === activeId);
    if (index < 0) return;
    let nextIndex = index;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      nextIndex = Math.min(index + 1, categories.length - 1);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      nextIndex = Math.max(index - 1, 0);
    } else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = categories.length - 1;
    else return;
    event.preventDefault();
    const next = categories[nextIndex];
    if (!next) return;
    jumpTo(next.id);
    buttonRefs.current.get(next.id)?.focus();
  };

  if (categories.length === 0) return null;
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-3 py-1.5 sm:px-6">
      <div className="relative min-w-0 flex-1 py-1 md:flex-initial">
        <div
          ref={trackRef}
          role="tablist"
          aria-label={strings.public.dockAria}
          data-testid="category-tabs"
          onKeyDown={handleKeyDown}
          style={{ scrollPadding: "0 28px" }}
          className="no-scrollbar edge-fade-x relative flex items-center gap-1.5 overflow-x-auto rounded-full border border-line/70 bg-card-2/60 p-1 backdrop-blur-md md:[mask-image:none] md:justify-center md:px-2"
        >
          {box && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full"
              initial={false}
              animate={{ x: box.left, y: box.top, width: box.width, height: box.height }}
              transition={reduceMotion ? { duration: 0 } : INDICATOR_SPRING}
              style={{
                top: 0,
                left: 0,
                opacity: isReady ? 1 : 0,
                background:
                  "linear-gradient(180deg, #ffcf82 0%, var(--primary) 45%, var(--accent) 100%)",
                boxShadow: "0 2px 12px rgba(232, 163, 61, 0.42), 0 0 1px rgba(255, 215, 140, 0.8)",
              }}
            />
          )}
          {categories.map((category) => {
            const isActive = activeId === category.id;
            return (
              <button
                key={category.id}
                ref={(node) => {
                  if (node) buttonRefs.current.set(category.id, node);
                  else buttonRefs.current.delete(category.id);
                }}
                type="button"
                role="tab"
                id={`tab-${category.id}`}
                aria-selected={isActive}
                aria-controls={`section-${category.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => jumpTo(category.id)}
                data-testid={`tab-${category.name}`}
                data-active={isActive ? "true" : "false"}
                className={`relative z-10 flex min-h-[40px] min-w-[64px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 md:min-h-[42px] md:px-5 md:text-[13.5px] ${
                  isActive
                    ? "text-primary-foreground font-black"
                    : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}