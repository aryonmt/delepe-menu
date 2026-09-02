"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/application/dtos";
import { strings } from "@/lib/fa/strings";
import { changePasswordAction, logoutAction } from "../_actions";

export function AdminSessionPanel() {
  const [state, action, pending] = useActionState(
    changePasswordAction,
    null as ActionResult<null> | null,
  );

  return (
    <div className="mt-8 flex flex-col gap-8">
      <form action={logoutAction}>
        <Button type="submit" variant="outline">
          {strings.auth.logout}
        </Button>
      </form>
      <form action={action} className="flex flex-col gap-4">
        <h2 className="font-display text-section text-foreground">
          {strings.auth.changePassword}
        </h2>
        {state && !state.ok ? (
          <p
            role="alert"
            data-error-code={state.error.code}
            className="rounded-lg bg-destructive/10 px-3 py-2 text-secondary text-destructive"
          >
            {state.error.fa}
          </p>
        ) : null}
        {state?.ok ? (
          <p role="status" className="text-secondary text-muted-foreground">
            {strings.auth.passwordChanged}
          </p>
        ) : null}
        <label className="flex flex-col gap-1 text-secondary text-muted-foreground">
          {strings.auth.currentPassword}
          <input
            name="current"
            type="password"
            autoComplete="current-password"
            required
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-secondary text-muted-foreground">
          {strings.auth.nextPassword}
          <input
            name="next"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
          />
        </label>
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {strings.auth.savePassword}
        </Button>
      </form>
    </div>
  );
}
