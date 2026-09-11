import {
  closestCenter,
  type CollisionDetection,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

function sameLevelIds(topIds: Set<string>, id: string, activeIsTop: boolean): boolean {
  return topIds.has(id) === activeIsTop;
}

/**
 * Same-level drops only. Ignore the active row: without a DragOverlay it
 * translates under the pointer, so pointerWithin would always "hit" itself
 * and reorder would never commit.
 */
export function createCategoryCollision(topIds: string[]): CollisionDetection {
  const top = new Set(topIds);
  return (args) => {
    const activeId = String(args.active.id);
    const activeIsTop = top.has(activeId);
    return closestCenter(args).filter((hit) => {
      const id = String(hit.id);
      return id !== activeId && sameLevelIds(top, id, activeIsTop);
    });
  };
}

/** Arrow keys stay within the same tree depth as the active row. */
export function createCategoryKeyboardCoordinates(
  topIds: string[],
): KeyboardCoordinateGetter {
  const top = new Set(topIds);
  return (event, args) => {
    const activeIsTop = top.has(String(args.active));
    const enabled = args.context.droppableContainers
      .getEnabled()
      .filter((container) => sameLevelIds(top, String(container.id), activeIsTop));
    const original = args.context.droppableContainers.getEnabled;
    args.context.droppableContainers.getEnabled = () => enabled;
    try {
      return sortableKeyboardCoordinates(event, args);
    } finally {
      args.context.droppableContainers.getEnabled = original;
    }
  };
}
