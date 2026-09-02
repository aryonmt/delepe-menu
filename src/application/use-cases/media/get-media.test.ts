import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/domain/errors";
import { createRepos } from "@/application/testing/harness";
import { GetMediaUseCase } from "./get-media";

const SAMPLE_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("GetMediaUseCase", () => {
  it("returns the domain Media entity when the row exists", async () => {
    const repos = createRepos();
    const stored = await repos.media.create({
      id: SAMPLE_ID,
      fileName: `${SAMPLE_ID}.jpg`,
      mimeType: "image/jpeg",
      width: 800,
      height: 600,
      dominantColor: "#C4A574",
      path: `uploads/${SAMPLE_ID}.jpg`,
    });

    const result = await new GetMediaUseCase(repos.media).execute({
      id: SAMPLE_ID,
    });

    expect(result).toEqual(stored);
  });

  it("throws NotFoundError when the media id is absent", async () => {
    const repos = createRepos();
    await expect(
      new GetMediaUseCase(repos.media).execute({
        id: "00000000-0000-4000-8000-000000000000",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
