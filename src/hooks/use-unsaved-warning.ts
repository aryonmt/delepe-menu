// src/hooks/use-unsaved-warning.ts
import { useEffect } from "react";
import { useMenuDraftStore } from "./use-menu-draft-store";

export function useUnsavedWarning() {
  const isDirty = useMenuDraftStore((s) => s.isDirty);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return isDirty;
}