import type { CSSProperties, ComponentProps } from "react";
import { TWIN_ORBIT_DURATION_MS } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import { cn } from "@/lib/utils";

type TwinOrbitStyle = CSSProperties & { "--duration"?: string };

export function TwinOrbit({ className, style, ...props }: ComponentProps<"span">) {
  const orbitStyle: TwinOrbitStyle = {
    ...style,
    "--duration": `${TWIN_ORBIT_DURATION_MS}ms`,
  };
  return (
    <span
      role="status"
      className={cn(
        "relative inline-block aspect-square rounded-full bg-current",
        className,
      )}
      {...props}
      style={orbitStyle}
    >
      <span
        aria-hidden="true"
        className="twin-orbit-moon absolute inset-0 rounded-full bg-current"
        style={{ transform: "rotate(0deg) translate(155%)" }}
      />
      <span
        aria-hidden="true"
        className="twin-orbit-moon absolute inset-0 rounded-full bg-current"
        style={{
          transform: "rotate(0deg) translate(155%)",
          animationDelay: `calc(var(--duration, 1s) / 2)`,
        }}
      />
      <span className="sr-only">{strings.public.loadingHint}</span>
    </span>
  );
}
