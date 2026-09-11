import { describe, expect, it } from "vitest";
import type { Active, ClientRect, DroppableContainer } from "@dnd-kit/core";
import { createCategoryCollision } from "./category-collision";

function rect(top: number): ClientRect {
  return { top, left: 0, width: 200, height: 40, bottom: top + 40, right: 200 };
}

function droppable(id: string, top: number): DroppableContainer {
  return {
    id,
    key: id,
    disabled: false,
    data: { current: undefined },
    node: { current: null },
    rect: { current: rect(top) },
  };
}

function activeNode(id: string, top: number): Active {
  return {
    id,
    data: { current: undefined },
    rect: { current: { initial: rect(top), translated: rect(top) } },
  };
}

/** Mimic a drag without DragOverlay: the active row translates under the pointer. */
function collisionArgs(options: {
  activeId: string;
  pointerY: number;
  rows: Array<{ id: string; top: number }>;
}) {
  const activeRow = options.rows.find((row) => row.id === options.activeId);
  if (!activeRow) throw new Error("active row missing");
  const droppableRects = new Map(
    options.rows.map((row) => [
      row.id,
      row.id === options.activeId ? rect(options.pointerY - 20) : rect(row.top),
    ]),
  );
  return {
    active: activeNode(options.activeId, activeRow.top),
    collisionRect: rect(options.pointerY - 20),
    droppableRects,
    droppableContainers: options.rows.map((row) => droppable(row.id, row.top)),
    pointerCoordinates: { x: 100, y: options.pointerY },
  };
}

const tree = [
  { id: "parent-a", top: 0 },
  { id: "child-a", top: 50 },
  { id: "parent-b", top: 120 },
];

describe("createCategoryCollision", () => {
  const detect = createCategoryCollision(["parent-a", "parent-b"]);

  it("targets the sibling under the pointer, not the row that is following the cursor", () => {
    const hits = detect(
      collisionArgs({ activeId: "parent-a", pointerY: 140, rows: tree }),
    );
    expect(hits[0]?.id).toBe("parent-b");
  });

  it("does not let a child row steal a top-level drop", () => {
    const hits = detect(
      collisionArgs({ activeId: "parent-b", pointerY: 70, rows: tree }),
    );
    expect(hits.map((hit) => hit.id)).not.toContain("child-a");
    expect(hits[0]?.id).toBe("parent-a");
  });

  it("keeps a child drag on sibling children", () => {
    const hits = detect(
      collisionArgs({
        activeId: "child-a",
        pointerY: 70,
        rows: [...tree, { id: "child-b", top: 90 }],
      }),
    );
    expect(hits[0]?.id).toBe("child-b");
  });
});
