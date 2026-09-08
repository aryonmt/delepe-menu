import { Suspense } from "react";
import { EmptyState } from "@/components/menu/empty-state";
import { MenuShell } from "@/components/menu/menu-shell";
import { HeroSkeleton, MenuSkeleton } from "@/components/menu/menu-skeleton";
import { NotFoundError } from "@/domain/errors";
import { getPublicMenuCached } from "@/lib/public-menu-cache";

export const revalidate = 60;

/**
 * Fetches the public menu (categories + settings) from cache.
 * Shows empty state if no menu, throws if error.
 * Wrapped in Suspense for streaming skeleton fallback.
 */
async function MenuContent() {
  let menu: Awaited<ReturnType<typeof getPublicMenuCached>>;

  try {
    menu = await getPublicMenuCached();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return <EmptyState />;
    }
    throw error;
  }

  if (menu.categories.length === 0) {
    return <EmptyState />;
  }

  return (
    <MenuShell
      categories={menu.categories}
      restaurantName={menu.settings.restaurantName}
    />
  );
}

export default function PublicMenuPage() {
  return (
    <Suspense
      fallback={
        <>
          <HeroSkeleton />
          <MenuSkeleton />
        </>
      }
    >
      <MenuContent />
    </Suspense>
  );
}