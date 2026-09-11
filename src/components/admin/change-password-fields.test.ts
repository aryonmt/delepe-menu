import { describe, expect, it } from "vitest";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/constants";
import {
  changePasswordClientBlock,
  changePasswordFieldsFromFormData,
  changePasswordFormData,
  changePasswordMismatch,
  isNewPasswordValid,
  newPasswordRules,
} from "./change-password-fields";

describe("changePasswordFields", () => {
  it("reads current, next, and confirm from FormData", () => {
    const data = new FormData();
    data.set("current", "old-secret");
    data.set("next", "new-secret-99");
    data.set("confirm", "new-secret-99");
    expect(changePasswordFieldsFromFormData(data)).toEqual({
      current: "old-secret",
      next: "new-secret-99",
      confirm: "new-secret-99",
    });
  });

  it("flags a confirmation mismatch before the server action", () => {
    expect(
      changePasswordMismatch({
        current: "a",
        next: "new-secret-99",
        confirm: "new-secret-98",
      }),
    ).toBe(true);
    expect(
      changePasswordMismatch({
        current: "a",
        next: "new-secret-99",
        confirm: "new-secret-99",
      }),
    ).toBe(false);
  });

  it("builds FormData the action can read (not type=password display:none)", () => {
    const data = changePasswordFormData({
      current: "old-secret",
      next: "new-secret-99",
      confirm: "new-secret-99",
    });
    expect(data.get("current")).toBe("old-secret");
    expect(data.get("next")).toBe("new-secret-99");
    expect(data.get("confirm")).toBe("new-secret-99");
  });

  it("reports live new-password rules (docs/10: 8–128)", () => {
    expect(newPasswordRules("")).toEqual({ minLength: false, maxLength: true });
    expect(newPasswordRules("1234567")).toEqual({ minLength: false, maxLength: true });
    expect(isNewPasswordValid("12345678")).toBe(true);
    expect(isNewPasswordValid("x".repeat(PASSWORD_MIN_LENGTH))).toBe(true);
    expect(isNewPasswordValid("x".repeat(PASSWORD_MAX_LENGTH))).toBe(true);
    expect(isNewPasswordValid("x".repeat(PASSWORD_MAX_LENGTH + 1))).toBe(false);
  });

  it("blocks save until current, valid next, and matching confirm are set", () => {
    const validNext = "new-secret-99";
    expect(
      changePasswordClientBlock({ current: "", next: validNext, confirm: validNext }),
    ).toBe("current-empty");
    expect(
      changePasswordClientBlock({ current: "old", next: "short", confirm: "short" }),
    ).toBe("next-invalid");
    expect(
      changePasswordClientBlock({
        current: "old",
        next: validNext,
        confirm: "other-secret",
      }),
    ).toBe("mismatch");
    expect(
      changePasswordClientBlock({
        current: "old",
        next: validNext,
        confirm: validNext,
      }),
    ).toBeNull();
  });
});
