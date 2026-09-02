import { Suspense } from "react";
import { EmptyState } from "@/components/menu/empty-state";
import { Hero } from "@/components/menu/hero";
import { MenuTabs } from "@/components/menu/menu-tabs";
import { CategorySection } from "@/components/menu/category-section";
import { HeroSkeleton, MenuSkeleton } from "@/components/menu/menu-skeleton";
import { getPublicMenuCached } from "@/lib/public-menu-cache";
import { strings } from "@/lib/fa/strings";

export const revalidate = 60;
export const dynamic = "force-dynamic";

async function MenuContent() {
  let menu: Awaited<ReturnType<typeof getPublicMenuCached>> | null = null;
  try {
    menu = await getPublicMenuCached();
  } catch {
    return <EmptyState />;
  }

  if (!menu || menu.categories.length === 0) {
    return <EmptyState />;
  }

  const tabs = menu.categories.map((cat) => ({ id: cat.id, name: cat.name }));

  return (
    <>
      <Hero restaurantName={menu.settings.restaurantName} />
      <div className="mx-auto max-w-2xl px-4">
        <MenuTabs categories={tabs} />
        <main className="space-y-8 pb-12 pt-4">
          {menu.categories.map((category, index) => (
            <CategorySection key={category.id} category={category} priorityStartIndex={index === 0 ? 0 : 999} />
          ))}
        </main>
        <footer className="flex flex-col items-center gap-2 border-t border-border py-8">
          <span className="font-display text-sm text-muted-foreground">{strings.public.footer}</span>
          <span className="text-ornament" aria-hidden="true">
            ✦
          </span>
        </footer>
      </div>
    </>
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
