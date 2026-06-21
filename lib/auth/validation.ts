import { copy } from "@/lib/copy";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

interface ValidCredentials {
  success: true;
  email: string;
  password: string;
}

interface InvalidCredentials {
  success: false;
  message: string;
}

export type CredentialValidationResult =
  | ValidCredentials
  | InvalidCredentials;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmailAddress(value: string) {
  return EMAIL_PATTERN.test(normalizeEmail(value));
}

export function validateCredentials(
  formData: FormData,
): CredentialValidationResult {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = normalizeEmail(
    typeof emailValue === "string" ? emailValue : "",
  );
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!isValidEmailAddress(email)) {
    return { success: false, message: copy.auth.validation.invalidEmail };
  }

  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return { success: false, message: copy.auth.validation.invalidPassword };
  }

  return { success: true, email, password };
}
