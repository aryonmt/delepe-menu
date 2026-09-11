"use client";
import { startTransition, useActionState, useEffect, useState } from "react";
import type { ActionResult } from "@/application/dtos";
import { changePasswordAction } from "@/app/admin/_actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import { toPersianDigits } from "@/lib/format/digits";
import {
  changePasswordClientBlock,
  changePasswordFormData,
  changePasswordMismatch,
  isNewPasswordValid,
  newPasswordRules,
  type ChangePasswordFields,
} from "./change-password-fields";

function fieldsOf(current: string, next: string, confirm: string): ChangePasswordFields {
  return { current, next, confirm };
}

function ruleClass(met: boolean, started: boolean): string {
  if (!started || met) return "text-muted-foreground";
  return "text-destructive";
}

/**
 * Change-password form (docs/07: user-menu dialog).
 * Live new-password rules + distinct submit errors (docs/10).
 */
export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(
    changePasswordAction,
    null as ActionResult<null> | null,
  );
  const [confirming, setConfirming] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const fields = fieldsOf(current, next, confirm);
  const clientBlock = changePasswordClientBlock(fields);
  const rules = newPasswordRules(next);
  const nextStarted = next.length > 0;
  const confirmMismatch = confirm.length > 0 && changePasswordMismatch(fields);
  const nextValid = isNewPasswordValid(next);

  useEffect(() => {
    if (state?.ok) {
      setConfirming(false);
      setCurrent("");
      setNext("");
      setConfirm("");
      return;
    }
    if (state && !state.ok) {
      setConfirming(false);
    }
  }, [state]);

  const askConfirm = () => {
    if (clientBlock) return;
    setConfirming(true);
  };

  const submitChange = () => {
    startTransition(() => {
      action(changePasswordFormData(fields));
    });
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
            <Button type="button" disabled={pending} aria-busy={pending} onClick={submitChange}>
              {strings.auth.confirmPasswordChange}
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            askConfirm();
          }}
          className="flex flex-col gap-4"
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
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
              aria-invalid={state?.ok === false && state.error.code === "CURRENT_PASSWORD_WRONG"}
              className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
            />
          </label>
          <div className="flex flex-col gap-1">
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
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                value={next}
                onChange={(event) => setNext(event.target.value)}
                aria-invalid={nextStarted && !nextValid}
                aria-describedby="cp-next-rules"
                className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
              />
            </label>
            <ul id="cp-next-rules" className="space-y-1 text-xs">
              <li className={ruleClass(rules.minLength, nextStarted)}>
                {strings.auth.passwordRuleMin.replace(
                  "{n}",
                  toPersianDigits(PASSWORD_MIN_LENGTH),
                )}
              </li>
              <li className={ruleClass(rules.maxLength, nextStarted)}>
                {strings.auth.passwordRuleMax.replace(
                  "{n}",
                  toPersianDigits(PASSWORD_MAX_LENGTH),
                )}
              </li>
            </ul>
            {nextStarted && nextValid ? (
              <p className="text-xs text-muted-foreground">{strings.auth.newPasswordValid}</p>
            ) : null}
          </div>
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
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              aria-invalid={confirmMismatch}
              className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
            />
            {confirmMismatch ? (
              <p role="alert" className="text-xs text-destructive">
                {strings.errors.domain.PASSWORD_MISMATCH}
              </p>
            ) : null}
          </label>
          <Button type="submit" disabled={pending || clientBlock !== null}>
            {strings.auth.savePassword}
          </Button>
        </form>
      )}
    </div>
  );
}
