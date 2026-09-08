"use client";

import { motion, useReducedMotion } from "motion/react";
import { toPersianDigits } from "@/lib/format/digits";

type ChapterProps = {
  title: string;
  displayIndex: number;
  /** True briefly after a dock jump — the one sanctioned settle moment. */
  settling: boolean;
};

export function ChapterHeader({ title, displayIndex, settling }: ChapterProps) {
  const reduceMotion = useReducedMotion();
  const ghost = toPersianDigits(String(displayIndex + 1).padStart(2, "0"));

  return (
    <div className="relative pb-5 pt-12">
      {/* Ghost chapter number, tinted by the chapter hue (decorative). */}
      <span
        aria-hidden="true"
        className="font-display pointer-events-none absolute -top-3 end-0 select-none text-[88px] leading-none opacity-10"
        style={{ color: "var(--chapter-hue)" }}
      >
        {ghost}
      </span>

      <motion.div
        // No `key` swap here: remounting this node on every settle toggle
        // was re-triggering the nested whileInView reveal below on every
        // dock jump instead of only once. The settle pulse itself is driven
        // purely by `animate` changing, so the same mounted node can play
        // it repeatedly.
        animate={
          settling && !reduceMotion
            ? { opacity: [0.4, 1], y: [12, 0] }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <h2 className="font-display text-[30px] leading-tight text-foreground md:text-[36px]">
            {title}
          </h2>
          <div
            aria-hidden="true"
            className="mt-2 h-px w-24"
            style={{ background: "linear-gradient(to left, var(--chapter-hue), transparent)" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

type SubHeaderProps = { title: string };

export function SubHeader({ title }: SubHeaderProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <h3 className="font-display shrink-0 text-[18px] text-foreground">{title}</h3>
      <div aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-transparent to-line" />
    </div>
  );
}