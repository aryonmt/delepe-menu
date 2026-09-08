"use client";
import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { resolveTickerItems } from "@/application/mappers/ticker";
import { toPublicMenu } from "@/application/mappers/to-public-menu";
import { EmptyState } from "@/components/menu/empty-state";
import { MenuShell } from "@/components/menu/menu-shell";
import { PhoneFrame } from "@/components/phone-frame";
import { Button } from "@/components/ui/button";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { PREVIEW_PANEL_WIDTH_PX } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

/** Side sheet (desktop 380px) / full-screen (mobile) live preview (docs/07). */
export function PreviewDrawer({ open, onOpenChange }: Props) {
  const draft = useMenuDraftStore((s) => s.draft);
  const resetToSaved = useMenuDraftStore((s) => s.resetToSaved);
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [resetting, setResetting] = useState(false);
  const attachViewport = (node: HTMLDivElement | null) => {
    if (node) setViewport(node);
  };

  const publicMenu = useMemo(() => (draft ? toPublicMenu(draft) : null), [draft]);
  const tickerItems = useMemo(
    () => (publicMenu ? resolveTickerItems(publicMenu) : []),
    [publicMenu],
  );

  const handleReset = async () => {
    setResetting(true);
    await resetToSaved();
    setResetting(false);
  };

  return (
    <Dialog.Root modal={false} open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 md:hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[61] flex flex-col bg-card p-3 shadow-lift focus:outline-none md:inset-auto md:top-14 md:bottom-0 md:end-0 md:w-[380px] md:border-s md:border-border"
          data-preview-width={PREVIEW_PANEL_WIDTH_PX}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onFocusOutside={(event) => event.preventDefault()}
        >
          <div className="mx-auto flex h-full min-h-0 w-full flex-col gap-3">
            <div className="flex shrink-0 items-center justify-between gap-2">
              <Dialog.Title className="font-display text-section text-foreground">
                {strings.admin.preview}
              </Dialog.Title>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={resetting}
                  data-testid="preview-reset"
                  onClick={() => void handleReset()}
                >
                  {strings.admin.backToSaved}
                </Button>
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="sm">
                    {strings.admin.closePreview}
                  </Button>
                </Dialog.Close>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <PhoneFrame viewportRef={attachViewport}>
                {!publicMenu || publicMenu.categories.length === 0 ? (
                  <EmptyState />
                ) : (
                  <MenuShell
                    categories={publicMenu.categories}
                    restaurantName={publicMenu.settings.restaurantName}
                    tickerItems={tickerItems}
                    scrollRoot={viewport}
                  />
                )}
              </PhoneFrame>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
