"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { SolarSystem, type OrbitConfig } from "@/components/ui/solar-system";
import { strings } from "@/lib/fa/strings";

type Props = {
  restaurantName: string;
  children?: ReactNode;
};

const BRAND_ORBITS: OrbitConfig[] = [
  {
    id: "inner", name: "Inner Ring", radiusClass: "var(--radius-inner)", radiusPx: 175, speed: 22,
    items: [
      { id: "pizza", label: strings.hero.pizza, image: "/hero-foods/pizza.webp", color: "#d96c4a" },
      { id: "coffee", label: strings.hero.coffee, image: "/hero-foods/coffee.webp", color: "#c89b54" },
      { id: "coockie", label: strings.hero.cookie, image: "/hero-foods/coockie.webp", color: "#e8a33d" },
    ],
  },
  {
    id: "mid", name: "Middle Ring", radiusClass: "var(--radius-mid)", radiusPx: 285, speed: 34,
    items: [
      { id: "salad", label: strings.hero.salad, image: "/hero-foods/salad.webp", color: "#7fc8a9" },
      { id: "ice-coffee", label: strings.hero.coldDrink, image: "/hero-foods/ice-coffee.webp", color: "#8fb8cc" },
      { id: "cake", label: strings.hero.dessert, image: "/hero-foods/cake.webp", color: "#c77dbb" },
    ],
  },
  {
    id: "outer", name: "Outer Ring", radiusClass: "var(--radius-outer)", radiusPx: 395, speed: 50,
    items: [
      { id: "sandwich", label: strings.hero.sandwich, image: "/hero-foods/sandwich.webp", color: "#b86e20" },
      { id: "burger", label: strings.hero.burger, image: "/hero-foods/burger.webp", color: "#f0563a" },
    ],
  },
];

export function HeroWordmark({ restaurantName, children }: Props) {
  const reduceMotion = useReducedMotion();
  return (
    <header
      data-testid="hero"
      className="grain-overlay relative isolate flex min-h-[min(95svh,900px)] flex-col overflow-hidden text-center"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: "var(--ambient-glow-1), var(--ambient-glow-2)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: "radial-gradient(65% 55% at 50% 46%, rgba(232,163,61,0.22) 0%, rgba(184,110,32,0.08) 55%, transparent 75%)" }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28" style={{ background: "linear-gradient(to top, var(--background) 0%, transparent 100%)" }} />
      
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-10 md:pt-14">
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
          className="font-display text-gold-gradient text-[52px] leading-[1.3] pb-1 md:text-[76px] md:leading-[1.25]"
        >
          {restaurantName}
        </motion.h1>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-1 text-secondary text-muted-foreground"
        >
          {strings.public.subtitle}
        </motion.p>
      </div>

      <motion.div
        dir="ltr"
        className="relative z-10 flex w-full flex-1 items-center justify-center"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <SolarSystem
          className="[--orbit-accent:#e8a33d]"
          orbits={BRAND_ORBITS}
          aria-label={strings.hero.solarAria}
          centerLogoAlt={restaurantName}
          centerLogo={
            <span aria-hidden="true" className="font-display text-gold-gradient block whitespace-nowrap text-[20px] leading-none md:text-[26px]">
              {strings.brand.wordmark}
            </span>
          }
        />
      </motion.div>

      {children ? <div className="relative z-10 w-full">{children}</div> : null}
    </header>
  );
}