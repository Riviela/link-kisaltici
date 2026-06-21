import { copy } from "@/lib/copy";

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const DISPLAY_NAME_MAX_LENGTH = 80;
export const BIO_MAX_LENGTH = 280;
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_]{2,29}$/;

export interface ProfileActionState {
  status: "idle" | "error";
  message: string;
  showUsernameFallback: boolean;
}

export const initialProfileActionState: ProfileActionState = {
  status: "idle",
  message: "",
  showUsernameFallback: false,
};

export interface ProfileVisibilityActionState {
  status: "idle" | "success" | "error";
  message: string;
  isPublished: boolean;
}

interface ValidProfileDetails {
  success: true;
  displayName: string;
  bio: string | null;
}

interface InvalidProfileDetails {
  success: false;
  message: string;
}

export type ProfileDetailsValidationResult =
  | ValidProfileDetails
  | InvalidProfileDetails;

export function validateProfileDetails(
  formData: FormData,
): ProfileDetailsValidationResult {
  const displayNameValue = formData.get("displayName");
  const bioValue = formData.get("bio");

  const displayName =
    typeof displayNameValue === "string" ? displayNameValue.trim() : "";
  const normalizedBio = typeof bioValue === "string" ? bioValue.trim() : "";

  if (
    displayName.length === 0 ||
    displayName.length > DISPLAY_NAME_MAX_LENGTH
  ) {
    return {
      success: false,
      message: copy.onboarding.validation.displayName,
    };
  }

  if (normalizedBio.length > BIO_MAX_LENGTH) {
    return {
      success: false,
      message: copy.onboarding.validation.bio,
    };
  }

  return {
    success: true,
    displayName,
    bio: normalizedBio.length > 0 ? normalizedBio : null,
  };
}

export function validateProfileUsername(value: FormDataEntryValue | null) {
  const username =
    typeof value === "string" ? value.trim().toLowerCase() : "";

  if (!USERNAME_PATTERN.test(username)) {
    return {
      success: false as const,
      message: copy.onboarding.validation.username,
    };
  }

  return { success: true as const, username };
}
