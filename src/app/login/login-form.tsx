"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/application/dtos";
import { strings } from "@/lib/fa/strings";
import { loginAction } from "./_actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(
    loginAction,
    null as ActionResult<null> | null,
  );

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      {state && !state.ok ? (
        <p
          role="alert"
          data-error-code={state.error.code}
          className="rounded-lg bg-destructive/10 px-3 py-2 text-secondary text-destructive"
        >
          {state.error.fa}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-secondary text-muted-foreground">
        {strings.auth.username}
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          maxLength={40}
          className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
        />
      </label>
      <label className="flex flex-col gap-1 text-secondary text-muted-foreground">
        {strings.auth.password}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
          className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
        />
      </label>
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {strings.auth.submit}
      </Button>
    </form>
  );
}
