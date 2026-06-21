import { copy } from "@/lib/copy";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
} from "@/lib/profile/validation";
import {
  isValidEmailAddress,
  normalizeEmail,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth/validation";

interface ValidRegistrationInput {
  success: true;
  email: string;
  username: string;
  password: string;
}

interface InvalidRegistrationInput {
  success: false;
  message: string;
}

export type RegistrationValidationResult =
  | ValidRegistrationInput
  | InvalidRegistrationInput;

export function normalizeUsernameInput(value: string) {
  return value.trim().toLowerCase();
}

export function suggestUsernameFromEmail(email: string) {
  const localPart = normalizeEmail(email).split("@")[0] ?? "";

  return localPart
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^[^a-z0-9]+/, "")
    .slice(0, USERNAME_MAX_LENGTH);
}

export function isValidRegistrationUsername(username: string) {
  return USERNAME_PATTERN.test(normalizeUsernameInput(username));
}

export function validateRegistrationInput(
  formData: FormData,
): RegistrationValidationResult {
  const emailValue = formData.get("email");
  const usernameValue = formData.get("username");
  const passwordValue = formData.get("password");
  const confirmPasswordValue = formData.get("confirmPassword");
  const email = normalizeEmail(
    typeof emailValue === "string" ? emailValue : "",
  );
  const username = normalizeUsernameInput(
    typeof usernameValue === "string" ? usernameValue : "",
  );
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const confirmPassword =
    typeof confirmPasswordValue === "string" ? confirmPasswordValue : "";

  if (!isValidEmailAddress(email)) {
    return { success: false, message: copy.auth.validation.invalidEmail };
  }

  if (!USERNAME_PATTERN.test(username)) {
    return { success: false, message: copy.auth.validation.invalidUsername };
  }

  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return { success: false, message: copy.auth.validation.invalidPassword };
  }

  if (password !== confirmPassword) {
    return { success: false, message: copy.auth.validation.passwordMismatch };
  }

  return { success: true, email, username, password };
}
