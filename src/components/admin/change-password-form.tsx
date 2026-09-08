"use client";
import { useActionState, useRef, useState } from "react";
import type { ActionResult } from "@/application/dtos";
import { changePasswordAction } from "@/app/admin/_actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { strings } from "@/lib/fa/strings";

/**
 * Change-password form (docs/07: user-menu dialog).
 * Repeat-password + confirm step before the mutation; fields remount on success.
 */
export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(
    changePasswordAction,
    null as ActionResult<null> | null,
  );
  const [confirming, setConfirming] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const askConfirm = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const next = String(data.get("next") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (next !== confirm) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    setConfirming(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {state && !state.ok ? (
        <p
          role="alert"
          data-error-code={state.error.code}
          className="rounded-lg bg-destructive/10 px-3 py-2 text-secondary text-destructive"
        >
          {state.error.fa}
        </p>
      ) : null}
      {mismatch ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-secondary text-destructive">
          {strings.errors.domain.PASSWORD_MISMATCH}
        </p>
      ) : null}
      {state?.ok ? (
        <p
          role="status"
          data-testid="change-password-status"
          className="text-secondary text-muted-foreground"
        >
          {strings.auth.passwordChanged}
        </p>
      ) : null}
      {confirming ? (
        <div className="flex flex-col gap-4">
          <p className="text-body text-foreground">{strings.auth.confirmPasswordTitle}</p>
          <p className="text-secondary text-muted-foreground">{strings.auth.confirmPasswordDesc}</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirming(false)}>
              {strings.admin.cancel}
            </Button>
            <Button
              type="submit"
              form="change-password-form"
              disabled={pending}
              aria-busy={pending}
            >
              {strings.auth.confirmPasswordChange}
            </Button>
          </div>
        </div>
      ) : null}
      <form
        id="change-password-form"
        ref={formRef}
        key={state?.ok ? "ok" : "edit"}
        action={action}
        onSubmit={() => setConfirming(false)}
        className={confirming ? "hidden" : "flex flex-col gap-4"}
      >
        <label
          htmlFor="cp-current"
          className="flex flex-col gap-1 text-secondary text-muted-foreground"
        >
          {strings.auth.currentPassword}
          <Input
            id="cp-current"
            name="current"
            type="password"
            autoComplete="current-password"
            required
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
          />
        </label>
        <label
          htmlFor="cp-next"
          className="flex flex-col gap-1 text-secondary text-muted-foreground"
        >
          {strings.auth.nextPassword}
          <Input
            id="cp-next"
            name="next"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
          />
        </label>
        <label
          htmlFor="cp-confirm"
          className="flex flex-col gap-1 text-secondary text-muted-foreground"
        >
          {strings.auth.confirmPassword}
          <Input
            id="cp-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
          />
        </label>
        <Button type="button" disabled={pending} onClick={askConfirm}>
          {strings.auth.savePassword}
        </Button>
      </form>
    </div>
  );
}
