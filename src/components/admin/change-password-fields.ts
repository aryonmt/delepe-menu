import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/constants";

export type ChangePasswordFields = {
  current: string;
  next: string;
  confirm: string;
};

export type NewPasswordRules = {
  minLength: boolean;
  maxLength: boolean;
};

export type ChangePasswordClientBlock =
  | "current-empty"
  | "next-invalid"
  | "mismatch"
  | null;

/** Read the three password fields from a form (docs/07 + docs/10). */
export function changePasswordFieldsFromFormData(data: FormData): ChangePasswordFields {
  return {
    current: String(data.get("current") ?? ""),
    next: String(data.get("next") ?? ""),
    confirm: String(data.get("confirm") ?? ""),
  };
}

export function changePasswordMismatch(fields: ChangePasswordFields): boolean {
  return fields.next !== fields.confirm;
}

export function newPasswordRules(next: string): NewPasswordRules {
  return {
    minLength: next.length >= PASSWORD_MIN_LENGTH,
    maxLength: next.length <= PASSWORD_MAX_LENGTH,
  };
}

export function isNewPasswordValid(next: string): boolean {
  const rules = newPasswordRules(next);
  return rules.minLength && rules.maxLength;
}

export function changePasswordClientBlock(
  fields: ChangePasswordFields,
): ChangePasswordClientBlock {
  if (fields.current.length < 1) return "current-empty";
  if (!isNewPasswordValid(fields.next)) return "next-invalid";
  if (changePasswordMismatch(fields)) return "mismatch";
  return null;
}

/** Payload for the server action — never rely on hidden type=password fields. */
export function changePasswordFormData(fields: ChangePasswordFields): FormData {
  const data = new FormData();
  data.set("current", fields.current);
  data.set("next", fields.next);
  data.set("confirm", fields.confirm);
  return data;
}
