import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const base = {
  DATABASE_URL: "postgresql://delepe:delepe@localhost:5432/delepe",
  SESSION_SECRET: "a-unique-session-secret-32-chars!",
};

describe("parseEnv production Compose secrets", () => {
  it("rejects the example SESSION_SECRET on the Compose app hostname", () => {
    expect(() =>
      parseEnv({
        ...base,
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://delepe:x@db:5432/delepe",
        SESSION_SECRET: "replace-with-at-least-32-bytes-secret!!",
      }),
    ).toThrow(/SESSION_SECRET/);
  });

  it("rejects the example admin password on the Compose app hostname", () => {
    expect(() =>
      parseEnv({
        ...base,
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://delepe:x@db:5432/delepe",
        ADMIN_USERNAME: "admin",
        ADMIN_PASSWORD: "change-me-now",
      }),
    ).toThrow(/ADMIN_PASSWORD/);
  });

  it("allows the Docker image-build SESSION_SECRET", () => {
    const env = parseEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://delepe:delepe@127.0.0.1:1/delepe_build",
      SESSION_SECRET: "docker-image-build-session-secret-32",
    });
    expect(env.SESSION_SECRET.startsWith("docker-image-build")).toBe(true);
  });

  it("allows local development with the example password", () => {
    const env = parseEnv({
      ...base,
      NODE_ENV: "development",
      ADMIN_PASSWORD: "change-me-now",
    });
    expect(env.ADMIN_PASSWORD).toBe("change-me-now");
  });
});
