import { TwinOrbit } from "@/components/ui/twin-orbit";

/** Public menu Suspense fallback (docs/05). */
export function MenuLoading() {
  return (
    <div
      className="flex min-h-[min(86svh,700px)] w-full flex-col items-center justify-center"
      data-testid="menu-loading"
    >
      <TwinOrbit className="size-4 text-primary" />
    </div>
  );
}
