'use client';

import React, { useState } from 'react';
import { Orbit as OrbitIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SolarSystemItem {
  id: string;
  label?: string;
  image?: string;
  color: string;
  svg?: React.ReactNode;
}

export interface OrbitConfig {
  id: string;
  name: string;
  radiusClass: string;
  radiusPx: number;
  speed: number;
  items: SolarSystemItem[];
}

export interface SolarSystemProps extends React.HTMLAttributes<HTMLDivElement> {
  centerLogo?: string | React.ReactNode;
  centerLogoAlt?: string;
  orbits?: OrbitConfig[];
  isPaused?: boolean;
  speedMultiplier?: number;
}

export const SolarSystem = React.forwardRef<HTMLDivElement, SolarSystemProps>(
  (
    {
      centerLogo,
      centerLogoAlt = 'Core Engine',
      orbits = [],
      isPaused = false,
      speedMultiplier = 1,
      className,
      ...props
    },
    ref,
  ) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const dustItems = [
      { delay: '-4s', radius: '165px', color: '#e8a33d' },
      { delay: '-11s', radius: '260px', color: '#b86e20' },
      { delay: '-19s', radius: '340px', color: '#f0563a' },
      { delay: '-28s', radius: '395px', color: '#c89b54' },
      { delay: '-7s', radius: '200px', color: '#d96c4a' },
      { delay: '-15s', radius: '365px', color: '#e8763d' },
      { delay: '-23s', radius: '430px', color: '#7fc8a9' },
    ];

    return (
      <div
        ref={ref}
        className={cn(
          'solar-system relative flex h-[200px] w-full max-w-[940px] select-none items-center justify-center overflow-visible perspective-[1200px] md:h-[450px]',
          className,
        )}
        {...props}
      >
        <div
          className="absolute flex h-[240px] w-[240px] items-center justify-center md:h-[940px] md:w-[940px]"
          style={{ transform: 'rotateX(65deg) rotateY(-10deg)', transformStyle: 'preserve-3d' }}
        >
          {/* Sun core */}
          <div
            className="absolute w-[100px] h-[100px] md:w-[130px] md:h-[130px] flex items-center justify-center z-20 pointer-events-none"
            style={{ transform: 'rotateY(10deg) rotateX(-65deg)', transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-full filter blur-md animate-custom-sun-pulse z-10"
              style={{ background: 'color-mix(in srgb, var(--orbit-accent) 22%, transparent)' }}
            />
            {centerLogo ? (
              typeof centerLogo === 'string' ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  className="w-14 h-14 md:w-20 md:h-20 rounded-full z-20 bg-zinc-950 p-2 md:p-3 relative"
                  style={{
                    border: '2px solid color-mix(in srgb, var(--orbit-accent) 45%, transparent)',
                    boxShadow: '0 0 30px color-mix(in srgb, var(--orbit-accent) 35%, transparent)',
                  }}
                  src={centerLogo}
                  alt={centerLogoAlt}
                  width={80}
                  height={80}
                />
              ) : (
                <div
                  className="w-14 h-14 md:w-20 md:h-20 rounded-full z-20 bg-zinc-950 flex items-center justify-center relative"
                  style={{
                    border: '2px solid color-mix(in srgb, var(--orbit-accent) 45%, transparent)',
                    boxShadow: '0 0 30px color-mix(in srgb, var(--orbit-accent) 35%, transparent)',
                  }}
                >
                  {centerLogo}
                </div>
              )
            ) : (
              <div
                className="w-14 h-14 md:w-20 md:h-20 rounded-full z-20 bg-zinc-950 flex items-center justify-center p-2 relative"
                style={{
                  border: '2px solid color-mix(in srgb, var(--orbit-accent) 45%, transparent)',
                  boxShadow: '0 0 30px color-mix(in srgb, var(--orbit-accent) 35%, transparent)',
                }}
              >
                <OrbitIcon
                  className="w-8 h-8 animate-spin"
                  style={{ animationDuration: '10s', color: 'var(--orbit-accent)' }}
                />
              </div>
            )}
            <div
              className="absolute w-[110px] h-[110px] md:w-[140px] md:h-[140px] rounded-full border border-dashed animate-custom-spin-cw pointer-events-none"
              style={{ borderColor: 'color-mix(in srgb, var(--orbit-accent) 25%, transparent)' }}
            />
            <div
              className="absolute w-[150px] h-[150px] md:w-[185px] md:h-[185px] rounded-full border border-dashed animate-custom-spin-ccw pointer-events-none"
              style={{ borderColor: 'color-mix(in srgb, var(--orbit-accent) 12%, transparent)' }}
            />
          </div>

          {dustItems.map((dust, idx) => (
            <div
              key={idx}
              className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full opacity-40 pointer-events-none animate-custom-orbit"
              style={{
                background: dust.color,
                boxShadow: `0 0 6px ${dust.color}`,
                transform: `translate(-50%, -50%) translateX(${dust.radius})`,
                animationDelay: dust.delay,
                animationDuration: `${24 / speedMultiplier}s`,
                ['--orbit-radius' as string]: dust.radius,
                ['--orbit-duration' as string]: `${24 / speedMultiplier}s`,
                ['--orbit-play-state' as string]: isPaused ? 'paused' : 'running',
              } as React.CSSProperties}
            />
          ))}

          {orbits.map((orbit) => (
            <React.Fragment key={orbit.id}>
              <div
                className="absolute rounded-full border border-dashed border-zinc-700/60 pointer-events-none"
                style={{
                  width: `calc(2 * ${orbit.radiusClass})`,
                  height: `calc(2 * ${orbit.radiusClass})`,
                  boxShadow: 'inset 0 0 25px rgba(255, 255, 255, 0.01), 0 0 25px rgba(255, 255, 255, 0.01)',
                }}
              />
              {orbit.items.map((item, idx, arr) => {
                const delayValue = -(orbit.speed / arr.length) * idx;
                const durationValue = orbit.speed / speedMultiplier;
                const isHovered = hoveredId === item.id;

                return (
                  <div
                    key={item.id}
                    className="absolute left-1/2 top-1/2 w-0 h-0 pointer-events-none animate-custom-orbit"
                    style={{
                      transform: `translate(-50%, -50%) translateX(${orbit.radiusClass})`,
                      animationDelay: `${delayValue}s`,
                      animationDuration: `${durationValue}s`,
                      ['--orbit-radius' as string]: orbit.radiusClass,
                      ['--orbit-duration' as string]: `${durationValue}s`,
                      ['--orbit-play-state' as string]: isPaused ? 'paused' : 'running',
                      ['--hover-color' as string]: item.color,
                      zIndex: isHovered ? 30 : 10,
                      transformStyle: 'preserve-3d',
                    } as React.CSSProperties}
                  >
                    <div
                      className="absolute right-0 top-1/2 h-[1.5px] origin-right -translate-y-1/2 pointer-events-none transition-opacity duration-300 z-0"
                      style={{
                        width: orbit.radiusClass,
                        opacity: isHovered ? 1 : 0,
                        background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.15) 20%, ${item.color} 80%, ${item.color} 100%)`,
                        boxShadow: `0 0 8px ${item.color}, 0 0 16px ${item.color}40`,
                      }}
                    />
                    {item.image ? (
                      /* Free-floating food planet: DIV with background-image to avoid breaking media.spec (Rule B-12) */
                      <div
                        aria-hidden="true"
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="orbit-food-img animate-custom-billboard h-14 w-14 md:h-20 md:w-20 bg-center bg-contain bg-no-repeat"
                        style={{
                          backgroundImage: `url(${item.image})`,
                          animationDelay: `${delayValue}s`,
                          animationDuration: `${durationValue}s`,
                          ['--orbit-duration' as string]: `${durationValue}s`,
                          ['--orbit-play-state' as string]: isPaused ? 'paused' : 'running',
                          scale: isHovered ? 1.12 : 1,
                          filter: isHovered
                            ? `drop-shadow(0 0 16px ${item.color}) brightness(1.08)`
                            : 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.55))',
                        } as React.CSSProperties}
                      />
                    ) : (
                      <div
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="orbit-logo-card animate-custom-billboard"
                        style={{
                          animationDelay: `${delayValue}s`,
                          animationDuration: `${durationValue}s`,
                          ['--orbit-duration' as string]: `${durationValue}s`,
                          ['--orbit-play-state' as string]: isPaused ? 'paused' : 'running',
                          borderColor: isHovered ? item.color : undefined,
                          boxShadow: isHovered
                            ? `0 0 20px rgba(0, 0, 0, 0.6), 0 0 15px ${item.color}35`
                            : undefined,
                          scale: isHovered ? 1.05 : 1,
                        } as React.CSSProperties}
                      >
                        <div
                          className="transition-transform duration-300"
                          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)', color: item.color }}
                        >
                          {item.svg}
                        </div>
                        {item.label ? (
                          <span className="text-[11px] md:text-[13px] tracking-tight">{item.label}</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
);
SolarSystem.displayName = 'SolarSystem';