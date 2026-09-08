"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionResult, SettingsDto } from "@/application/dtos";
import { strings } from "@/lib/fa/strings";
import { updateSettingsAction } from "./_actions";

type Props = {
  settings: SettingsDto;
};

export function SettingsForm({ settings }: Props) {
  const [state, action, pending] = useActionState(
    updateSettingsAction,
    null as ActionResult<SettingsDto> | null,
  );

  const mode = state?.ok ? state.data.unavailableMode : settings.unavailableMode;
  const restaurantName = state?.ok ? state.data.restaurantName : settings.restaurantName;
  const theme = state?.ok ? state.data.theme : settings.theme;

  return (
    <form action={action} className="mt-8 flex flex-col gap-6">
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
          {strings.admin.settingsSaved}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-secondary text-muted-foreground">
        {strings.admin.restaurantName}
        <input
          name="restaurantName"
          type="text"
          required
          maxLength={80}
          defaultValue={restaurantName}
          className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
        />
      </label>
      <input type="hidden" name="theme" defaultValue={theme} />
      <fieldset className="flex flex-col gap-3">
        <legend className="text-secondary text-muted-foreground">{strings.admin.unavailableMode}</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-card border border-border bg-card px-4">
          <input
            type="radio"
            name="unavailableMode"
            value="MUTED"
            defaultChecked={mode === "MUTED"}
            data-testid="unavailable-mode-MUTED"
            className="h-4 w-4 accent-primary"
          />
          <span className="text-body text-foreground">{strings.admin.unavailableMuted}</span>
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-card border border-border bg-card px-4">
          <input
            type="radio"
            name="unavailableMode"
            value="HIDE"
            defaultChecked={mode === "HIDE"}
            data-testid="unavailable-mode-HIDE"
            className="h-4 w-4 accent-primary"
          />
          <span className="text-body text-foreground">{strings.admin.unavailableHide}</span>
        </label>
      </fieldset>
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {strings.admin.save}
      </Button>
    </form>
  );
}
