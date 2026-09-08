import { describe, expect, it } from "vitest";
import { NotFoundError, ValidationError } from "@/domain/errors";
import { UPLOAD_MAX_BYTES } from "@/lib/constants";
import { createRepos } from "@/application/testing/harness";
import { DeleteMediaUseCase } from "./delete-media";
import { UploadMediaUseCase } from "./upload-media";

function jpegBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  return bytes;
}

describe("UploadMediaUseCase", () => {
  it("rejects a file that is not jpeg/png/webp by magic bytes (BR-11)", async () => {
    const repos = createRepos();
    const upload = new UploadMediaUseCase(repos.optimizer, repos.media);
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    await expect(
      upload.execute({ bytes, width: 800, height: 800, fileName: "x.bin" }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "INVALID_UPLOAD",
    );
  });

  it("rejects a file larger than 5MB (BR-11)", async () => {
    const repos = createRepos();
    const upload = new UploadMediaUseCase(repos.optimizer, repos.media);
    await expect(
      upload.execute({
        bytes: jpegBytes(UPLOAD_MAX_BYTES + 1),
        width: 800,
        height: 800,
        fileName: "big.jpg",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "INVALID_UPLOAD",
    );
  });

  it("rejects an aspect ratio outside 1:1 ±2% (BR-11)", async () => {
    const repos = createRepos();
    const upload = new UploadMediaUseCase(repos.optimizer, repos.media);
    await expect(
      upload.execute({
        bytes: jpegBytes(200),
        width: 800,
        height: 600,
        fileName: "landscape.jpg",
      }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ValidationError && error.code === "INVALID_UPLOAD",
    );
  });

  it("stores a valid 1:1 jpeg and returns media metadata (BR-11)", async () => {
    const repos = createRepos();
    const result = await new UploadMediaUseCase(repos.optimizer, repos.media).execute({
      bytes: jpegBytes(200),
      width: 800,
      height: 800,
      fileName: "latte.jpg",
    });
    expect(result.mediaId).toBeTruthy();
    expect(result.width).toBe(800);
    expect(result.height).toBe(800);
    expect(result.dominantColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe("DeleteMediaUseCase", () => {
  it("removes the row and files", async () => {
    const repos = createRepos();
    const uploaded = await new UploadMediaUseCase(repos.optimizer, repos.media).execute({
      bytes: jpegBytes(200),
      width: 800,
      height: 800,
      fileName: "x.jpg",
    });
    await new DeleteMediaUseCase(repos.media, repos.storage).execute({
      mediaId: uploaded.mediaId,
    });
    expect(await repos.media.findById(uploaded.mediaId)).toBeNull();
    expect(repos.db.deletedMediaFiles).toContain(uploaded.mediaId);
  });

  it("throws NotFoundError for an unknown media id", async () => {
    const repos = createRepos();
    await expect(
      new DeleteMediaUseCase(repos.media, repos.storage).execute({
        mediaId: "missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
