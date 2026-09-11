"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { MenuLoading } from "@/components/menu/menu-loading";
import {
  MENU_BOOT_MAX_MS,
  MENU_BOOT_MIN_MS,
} from "@/lib/constants";
import { isMenuBootComplete, preloadImage } from "@/lib/menu-boot";

type Props = {
  imageUrls: string[];
  children: ReactNode;
};

/**
 * Holds TwinOrbit until the min time elapsed and boot images settled
 * (or MENU_BOOT_MAX_MS). Children stay mounted underneath so decoding can start.
 */
export function MenuBootGate({ imageUrls, children }: Props) {
  const [released, setReleased] = useState(false);
  const urlsKey = useMemo(() => imageUrls.join("\n"), [imageUrls]);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minMs = reduceMotion ? 0 : MENU_BOOT_MIN_MS;
    const urls = urlsKey.length > 0 ? urlsKey.split("\n") : [];

    const tick = () => {
      if (cancelled) return;
      if (
        isMenuBootComplete({
          elapsedMs: Date.now() - started,
          minMs,
          maxMs: MENU_BOOT_MAX_MS,
          pending,
        })
      ) {
        setReleased(true);
        window.clearInterval(interval);
      }
    };

    let pending = urls.length;
    const interval = window.setInterval(tick, 50);
    tick();
    const cap = window.setTimeout(() => {
      pending = 0;
      tick();
    }, MENU_BOOT_MAX_MS);

    void Promise.all(urls.map((url) => preloadImage(url))).then(() => {
      pending = 0;
      tick();
    });

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(cap);
    };
  }, [urlsKey]);

  return (
    <>
      <div aria-busy={!released}>{children}</div>
      {!released ? (
        <div className="fixed inset-0 z-[80] bg-background">
          <MenuLoading />
        </div>
      ) : null}
    </>
  );
}
