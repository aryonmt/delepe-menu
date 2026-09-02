import { ValidationError } from "@/domain/errors";
import { SORT_ORDER_GAP } from "@/lib/constants";

export function nextSortOrder(items: ReadonlyArray<{ sortOrder: number }>): number {
  if (items.length === 0) {
    return SORT_ORDER_GAP;
  }
  return Math.max(...items.map((item) => item.sortOrder)) + SORT_ORDER_GAP;
}

export function gapItems(orderedIds: readonly string[]): {
  id: string;
  sortOrder: number;
}[] {
  return orderedIds.map((id, index) => ({
    id,
    sortOrder: (index + 1) * SORT_ORDER_GAP,
  }));
}

/** BR-07: orderedIds must be a permutation of the current sibling set. */
export function assertSameIdSet(
  currentIds: readonly string[],
  orderedIds: readonly string[],
): void {
  if (currentIds.length !== orderedIds.length) {
    throw new ValidationError("INVALID_REORDER");
  }
  if (new Set(orderedIds).size !== orderedIds.length) {
    throw new ValidationError("INVALID_REORDER");
  }
  const current = new Set(currentIds);
  for (const id of orderedIds) {
    if (!current.has(id)) {
      throw new ValidationError("INVALID_REORDER");
    }
  }
}
