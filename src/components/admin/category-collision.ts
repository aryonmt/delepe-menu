import {
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

function sameLevelIds(topIds: Set<string>, id: string, activeIsTop: boolean): boolean {
  return topIds.has(id) === activeIsTop;
}

/** Keep top-level and child rows from stealing each other's drops. */
export function createCategoryCollision(topIds: string[]): CollisionDetection {
  const top = new Set(topIds);
  return (args) => {
    const pointerHits = pointerWithin(args);
    const base = pointerHits.length > 0 ? pointerHits : closestCenter(args);
    const activeIsTop = top.has(String(args.active.id));
    const filtered = base.filter((hit) =>
      sameLevelIds(top, String(hit.id), activeIsTop),
    );
    return filtered.length > 0 ? filtered : base;
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
