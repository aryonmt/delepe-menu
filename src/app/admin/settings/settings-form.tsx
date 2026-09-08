"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult, SettingsDto } from "@/application/dtos";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { strings } from "@/lib/fa/strings";
import { updateSettingsAction } from "@/app/admin/settings/_actions";

/** Restaurant name + unavailable mode, live-bound to the draft store (docs/07). */
export function SettingsForm() {
  const settings = useMenuDraftStore((s) => s.draft?.settings);
  const updateSettings = useMenuDraftStore((s) => s.updateSettings);
  const clearDirty = useMenuDraftStore((s) => s.clearDirty);
  const [state, action, pending] = useActionState(
    async (prev: ActionResult<SettingsDto> | null, formData: FormData) => {
      const result = await updateSettingsAction(prev, formData);
      if (result.ok) {
        updateSettings(result.data);
        clearDirty();
      }
      return result;
    },
    null as ActionResult<SettingsDto> | null,
  );

  if (!settings) return null;

  const patch = (partial: Partial<SettingsDto>) => {
    updateSettings({ ...settings, ...partial });
  };

  return (
    <form action={action} data-testid="settings-form" className="mt-8 flex flex-col gap-6">
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
        <Input
          name="restaurantName"
          type="text"
          required
          maxLength={80}
          value={settings.restaurantName}
          onChange={(event) => patch({ restaurantName: event.target.value })}
          className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
        />
      </label>
      <input type="hidden" name="theme" value={settings.theme} />
      <fieldset className="flex flex-col gap-3">
        <legend className="text-secondary text-muted-foreground">
          {strings.admin.unavailableMode}
        </legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-card border border-border bg-card px-4">
          <input
            type="radio"
            name="unavailableMode"
            value="MUTED"
            checked={settings.unavailableMode === "MUTED"}
            onChange={() => patch({ unavailableMode: "MUTED" })}
            data-testid="unavailable-mode-MUTED"
            className="h-4 w-4 accent-primary"
          />
          <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <span className="text-body text-foreground">{strings.admin.unavailableMuted}</span>
            <span
              aria-hidden="true"
              className="relative h-8 w-10 shrink-0 overflow-hidden rounded-sm bg-muted grayscale opacity-70"
            >
              <span className="absolute inset-x-0 bottom-0 bg-primary px-0.5 text-[8px] leading-4 text-primary-foreground">
                {strings.public.unavailable}
              </span>
            </span>
          </span>
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-card border border-border bg-card px-4">
          <input
            type="radio"
            name="unavailableMode"
            value="HIDE"
            checked={settings.unavailableMode === "HIDE"}
            onChange={() => patch({ unavailableMode: "HIDE" })}
            data-testid="unavailable-mode-HIDE"
            className="h-4 w-4 accent-primary"
          />
          <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <span className="text-body text-foreground">{strings.admin.unavailableHide}</span>
            <span
              aria-hidden="true"
              className="relative h-8 w-10 shrink-0 rounded-sm border border-dashed border-muted-foreground/40"
            />
          </span>
        </label>
      </fieldset>
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {strings.admin.save}
      </Button>
    </form>
  );
}
