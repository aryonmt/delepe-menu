/** Scroll metrics for window or a contained preview viewport (docs/07). */
export type ScrollRoot = Window | HTMLElement;

export function isWindowRoot(root: ScrollRoot): root is Window {
  return root === window;
}

export function scrollTopOf(root: ScrollRoot): number {
  return isWindowRoot(root) ? window.scrollY : root.scrollTop;
}

export function clientHeightOf(root: ScrollRoot): number {
  return isWindowRoot(root) ? window.innerHeight : root.clientHeight;
}

export function scrollHeightOf(root: ScrollRoot): number {
  return isWindowRoot(root) ? document.documentElement.scrollHeight : root.scrollHeight;
}

/** Element top relative to the scroll viewport. */
export function relativeTopOf(element: Element, root: ScrollRoot): number {
  const rect = element.getBoundingClientRect();
  if (isWindowRoot(root)) return rect.top;
  return rect.top - root.getBoundingClientRect().top;
}

export function scrollToY(root: ScrollRoot, top: number): void {
  if (isWindowRoot(root)) {
    window.scrollTo({ top, behavior: "auto" });
    return;
  }
  root.scrollTo({ top, behavior: "auto" });
}

export function findSection(root: ScrollRoot, id: string): Element | null {
  const selector = `#section-${CSS.escape(id)}`;
  if (isWindowRoot(root)) return document.querySelector(selector);
  return root.querySelector(selector);
}
