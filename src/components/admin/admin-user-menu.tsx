"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { User, X } from "lucide-react";
import { logoutAction } from "@/app/admin/_actions";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/fa/strings";

/** Account menu: change-password dialog + logout (docs/07 top bar). */
export function AdminUserMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={strings.auth.userMenu}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <User className="h-4 w-4" />
      </Button>
      {menuOpen ? (
        <div
          role="menu"
          className="absolute end-0 z-[70] mt-2 min-w-44 rounded-lg border border-border bg-card p-1 shadow-lift"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full rounded-md px-3 py-2 text-start text-sm text-foreground hover:bg-muted"
            onClick={() => {
              setMenuOpen(false);
              setPasswordOpen(true);
            }}
          >
            {strings.auth.changePassword}
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full rounded-md px-3 py-2 text-start text-sm text-foreground hover:bg-muted"
            >
              {strings.auth.logout}
            </button>
          </form>
        </div>
      ) : null}

      <Dialog.Root open={passwordOpen} onOpenChange={setPasswordOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[81] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-card p-6 shadow-lift focus:outline-none">
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="font-display text-xl text-foreground">
                {strings.auth.changePassword}
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon" aria-label={strings.admin.cancel}>
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
            <ChangePasswordForm />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
