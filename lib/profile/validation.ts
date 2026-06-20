import { copy } from "@/lib/copy";

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const DISPLAY_NAME_MAX_LENGTH = 80;
export const BIO_MAX_LENGTH = 280;
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_]{2,29}$/;

export interface ProfileActionState {
  status: "idle" | "error";
  message: string;
}

export const initialProfileActionState: ProfileActionState = {
  status: "idle",
  message: "",
};

interface ValidProfileInput {
  success: true;
  username: string;
  displayName: string;
  bio: string | null;
}

interface InvalidProfileInput {
  success: false;
  message: string;
}

export type ProfileValidationResult = ValidProfileInput | InvalidProfileInput;

export function validateProfileInput(
  formData: FormData,
): ProfileValidationResult {
  const usernameValue = formData.get("username");
  const displayNameValue = formData.get("displayName");
  const bioValue = formData.get("bio");

  const username =
    typeof usernameValue === "string"
      ? usernameValue.trim().toLowerCase()
      : "";
  const displayName =
    typeof displayNameValue === "string" ? displayNameValue.trim() : "";
  const normalizedBio = typeof bioValue === "string" ? bioValue.trim() : "";

  if (!USERNAME_PATTERN.test(username)) {
    return {
      success: false,
      message: copy.onboarding.validation.username,
    };
  }

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
    username,
    displayName,
    bio: normalizedBio.length > 0 ? normalizedBio : null,
  };
}
