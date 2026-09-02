/** Typed domain errors. `code` is the stable key mapped to Persian in `lib/fa`. */

export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = new.target.name;
    this.code = code;
  }
}

export class NotFoundError extends DomainError {
  constructor(code = "NOT_FOUND", message?: string) {
    super(code, message);
  }
}

export class ValidationError extends DomainError {
  constructor(code = "VALIDATION", message?: string) {
    super(code, message);
  }
}

/** BR-02: category still has products or children. */
export class CategoryNotEmptyError extends DomainError {
  constructor(message?: string) {
    super("CATEGORY_NOT_EMPTY", message);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message?: string) {
    super("UNAUTHORIZED", message);
  }
}

export class RateLimitError extends DomainError {
  constructor(message?: string) {
    super("RATE_LIMITED", message);
  }
}
