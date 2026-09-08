// src/components/admin/admin-shell.tsx
"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Package, Settings } from "lucide-react";
import type { AdminMenuDto } from "@/application/dtos";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { PreviewDrawer } from "@/components/admin/preview-drawer";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { useUnsavedWarning } from "@/hooks/use-unsaved-warning";
import { strings } from "@/lib/fa/strings";

type Props = { initialData: AdminMenuDto; children: ReactNode };

export function AdminShell({ initialData, children }: Props) {
  if (useMenuDraftStore.getState().draft === null) {
    useMenuDraftStore.getState().hydrate(initialData);
  }

  const isDirty = useUnsavedWarning();
  const pathname = usePathname();
  const router = useRouter();
  const [showNavConfirm, setShowNavConfirm] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleNav = (event: React.MouseEvent, href: string) => {
    if (isDirty && href !== pathname) {
      event.preventDefault();
      setPendingPath(href);
      setShowNavConfirm(true);
    }
  };

  const confirmNav = () => {
    if (pendingPath) {
      setShowNavConfirm(false);
      router.push(pendingPath);
    }
  };

  const links = [
    { href: "/admin/products", label: strings.admin.productsHeading, icon: Package },
    { href: "/admin/categories", label: strings.admin.categoriesHeading, icon: LayoutGrid },
    { href: "/admin/settings", label: strings.admin.settingsHeading, icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-[80] flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-4 md:ps-72">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="admin-preview"
          onClick={() => setPreviewOpen(true)}
        >
          {strings.admin.preview}
        </Button>
        <AdminUserMenu />
      </header>

      <aside className="hidden md:flex fixed inset-y-0 start-0 z-50 w-64 flex-col border-e border-border bg-card p-4">
        <h2 className="font-display text-xl text-primary mb-8">{strings.brand.wordmark}</h2>
        <nav className="flex flex-col gap-2 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="pb-20 md:pb-0 md:ps-64">{children}</main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-border bg-card p-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={(e) => handleNav(e, link.href)}
            className={`flex flex-col items-center gap-1 p-2 text-xs ${
              pathname === link.href ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </nav>

      <PreviewDrawer open={previewOpen} onOpenChange={setPreviewOpen} />

      <AlertDialog open={showNavConfirm} onOpenChange={setShowNavConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{strings.admin.unsavedChangesTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {strings.admin.unsavedChangesDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingPath(null)}>
              {strings.admin.stay}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmNav}>{strings.admin.leave}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
