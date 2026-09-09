import { loginSchema } from "@/application/schemas";
import { parseOrThrow } from "@/application/use-cases/shared/parse";
import type { AdminUser } from "@/domain/entities";
import { ValidationError } from "@/domain/errors";
import type {
  AdminUserRepository,
  LoginRateLimiter,
  PasswordHasher,
  SessionSigner,
} from "@/domain/ports";
import { LOGIN_FAILURE_DELAY_MS } from "@/lib/constants";

export type MasterCredentials = {
  username: string;
  password: string;
};

export type LoginUseCaseOptions = {
  master?: MasterCredentials | null;
  sleep?: (ms: number) => Promise<void>;
};

export type LoginResult = {
  token: string;
  adminId: string;
};

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function rateLimitKey(ip: string, username: string): string {
  return `${ip}\0${username}`;
}

/**
 * Authenticates an admin, enforces the docs/10 lockout window, and returns a
 * signed session token. Cookie flags are applied by the server action.
 */
export class LoginUseCase {
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly master: MasterCredentials | null;

  constructor(
    private readonly users: AdminUserRepository,
    private readonly hasher: PasswordHasher,
    private readonly sessions: SessionSigner,
    private readonly limiter: LoginRateLimiter,
    options: LoginUseCaseOptions = {},
  ) {
    this.sleep = options.sleep ?? defaultSleep;
    this.master = options.master ?? null;
  }

  async execute(input: unknown): Promise<LoginResult> {
    const data = parseOrThrow(loginSchema, input);
    const key = rateLimitKey(data.ip, data.username);
    await this.limiter.assertAllowed(key);

    const user = await this.authenticate(data.username, data.password);
    if (!user) {
      return await this.reject(key);
    }

    await this.limiter.reset(key);
    const token = await this.sessions.sign(user.id);
    return { token, adminId: user.id };
  }

  private async authenticate(
    username: string,
    password: string,
  ): Promise<AdminUser | null> {
    if (this.isMaster(username, password)) {
      console.warn("[auth] master login used");
      const named = await this.users.findByUsername(username);
      if (named) return named;
      return this.users.findFirst();
    }
    const user = await this.users.findByUsername(username);
    if (!user) {
      return null;
    }
    const matches = await this.hasher.verify(user.passwordHash, password);
    return matches ? user : null;
  }

  private isMaster(username: string, password: string): boolean {
    return (
      this.master !== null &&
      this.master.username === username &&
      this.master.password === password
    );
  }

  private async reject(key: string): Promise<never> {
    await this.limiter.recordFailure(key);
    await this.sleep(LOGIN_FAILURE_DELAY_MS);
    throw new ValidationError("INVALID_CREDENTIALS");
  }
}
