import { USERNAME_PATTERN } from "@/lib/profile/validation";

export function normalizePublicUsername(value: string): string {
  return value.toLowerCase();
}

export function isValidPublicUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value);
}
