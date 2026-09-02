import { describe, expect, it } from "vitest";
import { NotFoundError, ValidationError } from "@/domain/errors";
import { createRepos, defaultSettings } from "@/application/testing/harness";
import { GetSettingsUseCase } from "./get-settings";
import { UpdateSettingsUseCase } from "./update-settings";

describe("UpdateSettingsUseCase", () => {
  it("upserts the singleton settings row (BR-10)", async () => {
    const repos = createRepos();
    const update = new UpdateSettingsUseCase(repos.settings);
    const first = await update.execute({
      restaurantName: "دلِپ",
      theme: "WARM_HONEY",
      unavailableMode: "MUTED",
    });
    const second = await update.execute({
      restaurantName: "کافه دلِپ",
      theme: "MIDNIGHT_GOLD",
      unavailableMode: "HIDE",
    });
    expect(first.restaurantName).toBe("دلِپ");
    expect(second.theme).toBe("MIDNIGHT_GOLD");
    expect((await repos.settings.get())?.id).toBe(1);
  });
});

describe("GetSettingsUseCase", () => {
  it("throws NotFoundError when the singleton has never been upserted", async () => {
    const repos = createRepos();
    await expect(new GetSettingsUseCase(repos.settings).execute()).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("returns the singleton after upsert (BR-10)", async () => {
    const repos = createRepos();
    await repos.settings.upsert(defaultSettings());
    const settings = await new GetSettingsUseCase(repos.settings).execute();
    expect(settings.restaurantName).toBe("دلِپ");
  });
});

describe("updateSettings validation", () => {
  it("rejects an empty restaurant name", async () => {
    const repos = createRepos();
    await expect(
      new UpdateSettingsUseCase(repos.settings).execute({
        restaurantName: "",
        theme: "WARM_HONEY",
        unavailableMode: "MUTED",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
