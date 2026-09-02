"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type CategoryTab = {
  id: string;
  name: string;
};

type Props = {
  categories: CategoryTab[];
};

export function MenuTabs({ categories }: Props) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? "");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (categories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace(/^section-/, "");
            setActiveId(id);
          }
        }
      },
      { rootMargin: "-40% 0px -55%", threshold: 0 },
    );

    for (const cat of categories) {
      const el = document.getElementById(`section-${cat.id}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    const btn = buttonRefs.current.get(activeId);
    if (btn) {
      btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeId]);

  const handleClick = (id: string) => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = document.getElementById(`section-${id}`);
    if (target) {
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      setActiveId(id);
    }
  };

  if (categories.length === 0) return null;

  return (
    <nav
      ref={containerRef}
      className="sticky top-0 z-40 -mx-4 flex gap-2 overflow-x-auto border-b border-border bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      aria-label="دسته‌ها"
      data-testid="category-tabs"
      style={{ scrollbarWidth: "none" }}
    >
      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <button
            key={cat.id}
            ref={(node) => {
              if (node) buttonRefs.current.set(cat.id, node);
              else buttonRefs.current.delete(cat.id);
            }}
            type="button"
            onClick={() => handleClick(cat.id)}
            data-testid={`tab-${cat.name}`}
            data-active={isActive ? "true" : "false"}
            aria-current={isActive ? "page" : undefined}
            className={`relative whitespace-nowrap rounded-full px-4 py-2 font-display text-[15px] transition-colors ${
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                aria-hidden="true"
              />
            )}
            <span className="relative z-10">{cat.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
