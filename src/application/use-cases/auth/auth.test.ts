import { describe, expect, it, vi } from "vitest";
import { RateLimitError, UnauthorizedError, ValidationError } from "@/domain/errors";
import { FakePasswordHasher, FakeSessionSigner } from "@/domain/testing/fake-auth";
import { InMemoryAdminUserRepository } from "@/domain/testing/in-memory-admin-user-repository";
import { InMemoryLoginRateLimiter } from "@/infrastructure/auth/rate-limiter";
import { LOGIN_FAILURE_DELAY_MS } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import { ChangePasswordUseCase } from "./change-password";
import { LoginUseCase } from "./login";
import { LogoutUseCase } from "./logout";
import { VerifySessionUseCase } from "./verify-session";

const IP = "127.0.0.1";
const USERNAME = "admin";
const PASSWORD = "change-me-now";

async function seedAdmin(users: InMemoryAdminUserRepository) {
  const hasher = new FakePasswordHasher();
  return users.upsertByUsername(USERNAME, await hasher.hash(PASSWORD));
}

function createLogin(
  users: InMemoryAdminUserRepository,
  options: ConstructorParameters<typeof LoginUseCase>[4] = {},
) {
  return new LoginUseCase(
    users,
    new FakePasswordHasher(),
    new FakeSessionSigner(),
    new InMemoryLoginRateLimiter(),
    { sleep: async () => undefined, ...options },
  );
}

describe("LoginUseCase", () => {
  it("returns a session token for valid credentials", async () => {
    const users = new InMemoryAdminUserRepository();
    const admin = await seedAdmin(users);
    const result = await createLogin(users).execute({
      username: USERNAME,
      password: PASSWORD,
      ip: IP,
    });
    expect(result.adminId).toBe(admin.id);
    expect(result.token).toBe(`token:${admin.id}`);
  });

  it("uses the generic credentials error and records a delay", async () => {
    const users = new InMemoryAdminUserRepository();
    await seedAdmin(users);
    const slept: number[] = [];
    const login = createLogin(users, {
      sleep: async (ms) => {
        slept.push(ms);
      },
    });
    await expect(
      login.execute({ username: USERNAME, password: "nope", ip: IP }),
    ).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
    expect(slept).toEqual([LOGIN_FAILURE_DELAY_MS]);
    expect(strings.errors.domain.INVALID_CREDENTIALS).toBe(
      "نام کاربری یا رمز عبور نادرست است",
    );
  });

  it("rate-limits the sixth failed attempt for the same ip+username", async () => {
    const users = new InMemoryAdminUserRepository();
    await seedAdmin(users);
    const login = createLogin(users);
    const attempt = () =>
      login.execute({ username: USERNAME, password: "wrong", ip: IP });
    for (let i = 0; i < 5; i += 1) {
      await expect(attempt()).rejects.toBeInstanceOf(ValidationError);
    }
    await expect(attempt()).rejects.toBeInstanceOf(RateLimitError);
    expect(strings.errors.domain.RATE_LIMITED).toBe(
      "تعداد تلاش‌ها بیش از حد مجاز است؛ ۱۵ دقیقه دیگر تلاش کنید",
    );
  });

  it("accepts master credentials only when both are configured and logs a warning", async () => {
    const users = new InMemoryAdminUserRepository();
    const admin = await seedAdmin(users);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const login = createLogin(users, {
      master: { username: USERNAME, password: "master-secret" },
    });
    const result = await login.execute({
      username: USERNAME,
      password: "master-secret",
      ip: IP,
    });
    expect(result.adminId).toBe(admin.id);
    expect(warn).toHaveBeenCalledWith("[auth] master login used");
    warn.mockRestore();
  });

  it("rejects incomplete login payloads", async () => {
    const users = new InMemoryAdminUserRepository();
    await expect(
      createLogin(users).execute({ username: "", password: "x", ip: IP }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("ChangePasswordUseCase", () => {
  it("replaces the hash when the current password matches", async () => {
    const users = new InMemoryAdminUserRepository();
    const hasher = new FakePasswordHasher();
    const admin = await seedAdmin(users);
    const change = new ChangePasswordUseCase(users, hasher);
    await change.execute({
      adminId: admin.id,
      current: PASSWORD,
      next: "new-secret-99",
      confirm: "new-secret-99",
    });
    const updated = await users.findById(admin.id);
    expect(updated?.passwordHash).toBe("hash:new-secret-99");
  });

  it("rejects a short next password and a wrong current password", async () => {
    const users = new InMemoryAdminUserRepository();
    const hasher = new FakePasswordHasher();
    const admin = await seedAdmin(users);
    const change = new ChangePasswordUseCase(users, hasher);
    await expect(
      change.execute({
        adminId: admin.id,
        current: PASSWORD,
        next: "short",
        confirm: "short",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      change.execute({
        adminId: admin.id,
        current: "wrong",
        next: "long-enough",
        confirm: "long-enough",
      }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    await expect(
      change.execute({
        adminId: admin.id,
        current: PASSWORD,
        next: "long-enough",
        confirm: "does-not-match",
      }),
    ).rejects.toMatchObject({ code: "PASSWORD_MISMATCH" });
  });
});

describe("VerifySessionUseCase and LogoutUseCase", () => {
  it("returns adminId for a valid token and rejects a missing cookie", async () => {
    const verify = new VerifySessionUseCase(new FakeSessionSigner());
    await expect(verify.execute({ token: "token:abc" })).resolves.toEqual({
      adminId: "abc",
    });
    await expect(verify.execute({ token: "" })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    await expect(verify.execute({})).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("exposes a no-op logout execute", async () => {
    await expect(new LogoutUseCase().execute()).resolves.toBeUndefined();
  });
});
