// src/components/menu/context-strip.tsx
"use client";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CategoryDto } from "@/application/dtos";
import { strings } from "@/lib/fa/strings";

const ALL_CHIPS = "__all__";
export type ChipId = typeof ALL_CHIPS | string;
export const ALL_SUBCATEGORY_CHIP: ChipId = ALL_CHIPS;
export function isAllChips(id: ChipId): boolean {
  return id === ALL_CHIPS;
}

type Props = {
  activeCategory: CategoryDto | null;
  hueIndex: number;
  selectedChip: ChipId;
  onChipSelect: (id: ChipId) => void;
};

/**
 * Second row of the unified sticky nav header: active chapter name plus the
 * subcategory chips (only when the chapter has children). No own stickiness.
 */
export function ContextStrip({ activeCategory, hueIndex, selectedChip, onChipSelect }: Props) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const scroller = scrollerRef.current;
    const button = chipRefs.current.get(selectedChip);
    if (!scroller || !button) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const delta =
      buttonRect.left + buttonRect.width / 2 - (scrollerRect.left + scrollerRect.width / 2);
    if (Math.abs(delta) > 3) {
      scroller.scrollBy({ left: delta, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }, [selectedChip, reduceMotion]);

  if (!activeCategory) return null;
  const hueVar = `var(--chapter-hue-${(hueIndex % 6) + 1})`;
  const chips =
    activeCategory.children.length > 0
      ? [
          { id: ALL_CHIPS as ChipId, name: strings.public.allSubcategories },
          ...activeCategory.children.map((child) => ({ id: child.id as ChipId, name: child.name })),
        ]
      : [];

  return (
    <div className="flex w-full items-center gap-3 border-t border-line/60 px-3.5 pb-2 pt-1.5 sm:px-6">
      <span className="flex shrink-0 items-center gap-2">
        <span aria-hidden="true" className="h-3.5 w-1 rounded-full" style={{ background: hueVar }} />
        <span className="font-display whitespace-nowrap text-[15px] text-foreground">
          {activeCategory.name}
        </span>
      </span>
      {chips.length > 0 && (
        <div
          ref={scrollerRef}
          role="group"
          aria-label={strings.public.subcategoriesAria}
          data-testid="subcategory-chips"
          style={{ scrollPadding: "0 16px" }}
          className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto pe-1 py-1"
        >
          {chips.map((chip) => {
            const pressed = selectedChip === chip.id;
            return (
              <motion.button
                key={chip.id}
                ref={(node) => {
                  if (node) chipRefs.current.set(chip.id, node);
                  else chipRefs.current.delete(chip.id);
                }}
                type="button"
                aria-pressed={pressed}
                onClick={() => onChipSelect(chip.id)}
                whileTap={{ scale: 0.94 }}
                className={`relative min-h-[38px] shrink-0 whitespace-nowrap rounded-full px-3.5 text-[12.5px] font-bold transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  pressed
                    ? "text-primary-foreground font-black"
                    : "border border-line bg-card-2/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {pressed && (
                  <motion.div
                    layoutId="active-chip-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{chip.name}</span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}