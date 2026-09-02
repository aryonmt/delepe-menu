import { SORT_ORDER_GAP } from "@/lib/constants";
import { createInMemoryRepos, type InMemoryRepos } from "@/domain/testing/create-repos";

export async function seedLeafCategory(repos: InMemoryRepos, name = "برگر") {
  const root = await repos.categories.create(
    { name: "غذای اصلی", parentId: null },
    SORT_ORDER_GAP,
  );
  const leaf = await repos.categories.create(
    { name, parentId: root.id },
    SORT_ORDER_GAP,
  );
  return { root, leaf };
}

export function defaultSettings() {
  return {
    restaurantName: "دلِپ",
    theme: "WARM_HONEY" as const,
    unavailableMode: "MUTED" as const,
  };
}

export function createRepos() {
  return createInMemoryRepos();
}
